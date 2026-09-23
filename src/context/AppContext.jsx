import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '@/services/api';

const AppContext = createContext(null);

const USER_KEY = 'lm_user';

const darkModeKey    = (userId) => userId ? `lm_dark_${userId}`     : 'lm_dark';
const tutorialKey    = (userId) => userId ? `lm_tutorial_${userId}` : 'lm_tutorial';

const readUser = () => {
  try {
    return (
      JSON.parse(localStorage.getItem(USER_KEY)) ||
      JSON.parse(sessionStorage.getItem(USER_KEY))
    );
  } catch { return null; }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => readUser());

  const [darkMode, setDarkMode] = useState(() => {
    const u = readUser();
    return localStorage.getItem(darkModeKey(u?.id)) === 'true';
  });
  const [dyslexiaFont, setDyslexiaFont] = useState(() => localStorage.getItem('lm_dyslexia') === 'true');
  const [mainDecks, setMainDecks] = useState([]);
  const [decks, setDecks] = useState([]);
  const [progresso, setProgresso] = useState({ ultimoDeckId: null, ultimoCardId: null });
  const [cardRatings, setCardRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(() => {
    const u = readUser();
    return localStorage.getItem(tutorialKey(u?.id)) === 'true';
  });

  useEffect(() => {
    if (user?.id) localStorage.setItem(darkModeKey(user.id), darkMode);
  }, [darkMode, user?.id]);

  useEffect(() => {
    document.body.classList.toggle('dyslexia-font', dyslexiaFont);
    localStorage.setItem('lm_dyslexia', dyslexiaFont);
  }, [dyslexiaFont]);

  const toggleDarkMode = () => setDarkMode(v => !v);
  const toggleDyslexiaFont = () => setDyslexiaFont(v => !v);

  const markTutorialDone = () => {
    setTutorialDone(true);
    localStorage.setItem(tutorialKey(user?.id), 'true');
  };

  // ── Load all data for the logged-in user ──
  const loadData = useCallback(async (userId) => {
    setLoading(true);
    try {
      const [allMainDecks, allDecks, allFlashcards] = await Promise.all([
        api.getMainDecksApi(),
        api.getDecksApi(),
        api.getFlashcardsApi(),
      ]);
      const userMainDecks  = allMainDecks.filter(md => md.usuarioId === userId);
      const userDecks      = allDecks.filter(d => d.usuarioId === userId);
      const userFlashcards = allFlashcards.filter(f => f.usuarioId === userId);
      const decksWithCards = userDecks.map(deck => ({
        ...deck,
        cards: userFlashcards
          .filter(f => f.deckId === deck.id)
          .map(f => ({ id: f.id, frente: f.frente, verso: f.verso })),
      }));
      setMainDecks(userMainDecks);
      setDecks(decksWithCards);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount if user is already logged in
  useEffect(() => {
    if (user?.id) loadData(user.id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth ──
  const login = async (email, senha, lembrar = false) => {
    const userData = await api.loginApi(email, senha);
    setUser(userData);
    const storage = lembrar ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(userData));
    // Migrate dark mode key if needed
    const genericKey = 'lm_dark';
    const userKey = darkModeKey(userData.id);
    if (!localStorage.getItem(userKey) && localStorage.getItem(genericKey)) {
      localStorage.setItem(userKey, localStorage.getItem(genericKey));
    }
    await loadData(userData.id);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setMainDecks([]);
    setDecks([]);
    setProgresso({ ultimoDeckId: null, ultimoCardId: null });
    setCardRatings({});
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  };

  const cadastrar = async (nome, email, senha) => {
    const userData = await api.cadastrarApi(nome, email, senha);
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setMainDecks([]);
    setDecks([]);
    return userData;
  };

  const updateUser = async (fields) => {
    const updated = { ...user, ...fields };
    await api.updateUsuarioApi(user.id, updated);
    setUser(updated);
    // Update whichever storage has the session
    if (localStorage.getItem(USER_KEY)) localStorage.setItem(USER_KEY, JSON.stringify(updated));
    if (sessionStorage.getItem(USER_KEY)) sessionStorage.setItem(USER_KEY, JSON.stringify(updated));
  };

  // ── MainDeck (LearnDeck) ──
  const createMainDeck = async (nome) => {
    const created = await api.createMainDeckApi(nome, user.id);
    setMainDecks(prev => [...prev, created]);
    return created;
  };

  const deleteMainDeck = async (mainDeckId) => {
    const deckIds = decks.filter(d => d.mainDeckId === mainDeckId).map(d => d.id);
    for (const deckId of deckIds) {
      const cards = decks.find(d => d.id === deckId)?.cards ?? [];
      for (const card of cards) await api.deleteFlashcardApi(card.id);
      await api.deleteDeckApi(deckId);
    }
    await api.deleteMainDeckApi(mainDeckId);
    setMainDecks(prev => prev.filter(md => md.id !== mainDeckId));
    setDecks(prev => prev.filter(d => d.mainDeckId !== mainDeckId));
  };

  const updateMainDeck = async (mainDeckId, nome) => {
    await api.updateMainDeckApi(mainDeckId, nome, user.id);
    setMainDecks(prev => prev.map(md => md.id === mainDeckId ? { ...md, nome } : md));
  };

  // ── Deck ──
  const createDeck = async (nome, mainDeckId) => {
    const created = await api.createDeckApi(nome, mainDeckId, user.id);
    const newDeck = { ...created, cards: [] };
    setDecks(prev => [...prev, newDeck]);
    return newDeck;
  };

  const deleteDeck = async (deckId) => {
    const cards = decks.find(d => d.id === deckId)?.cards ?? [];
    for (const card of cards) await api.deleteFlashcardApi(card.id);
    await api.deleteDeckApi(deckId);
    setDecks(prev => prev.filter(d => d.id !== deckId));
  };

  const updateDeck = async (deckId, nome) => {
    const deck = decks.find(d => d.id === deckId);
    await api.updateDeckApi(deckId, nome, deck.mainDeckId, user.id);
    setDecks(prev => prev.map(d => d.id === deckId ? { ...d, nome } : d));
  };

  // ── Flashcard ──
  const createCard = async (deckId, frente, verso) => {
    const created = await api.createFlashcardApi(frente, verso, deckId, user.id);
    setDecks(prev =>
      prev.map(deck =>
        deck.id === deckId
          ? { ...deck, cards: [...deck.cards, { id: created.id, frente: created.frente, verso: created.verso }] }
          : deck
      )
    );
    return created.id;
  };

  const deleteCard = async (deckId, cardId) => {
    await api.deleteFlashcardApi(cardId);
    setDecks(prev =>
      prev.map(deck =>
        deck.id === deckId
          ? { ...deck, cards: deck.cards.filter(c => c.id !== cardId) }
          : deck
      )
    );
  };

  const updateCard = async (deckId, cardId, frente, verso) => {
    await api.updateFlashcardApi(cardId, frente, verso, deckId, user.id);
    setDecks(prev =>
      prev.map(d =>
        d.id === deckId
          ? { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, frente, verso } : c) }
          : d
      )
    );
  };

  // ── Ratings & Progresso ──
  const rateCard = (cardId, rating) => {
    setCardRatings(prev => ({ ...prev, [cardId]: rating }));
  };

  const updateProgresso = (data) => {
    setProgresso(prev => ({ ...prev, ...data }));
  };

  const ultimoDeck = decks.find(d => d.id === progresso.ultimoDeckId) ?? null;
  const ultimoCard = ultimoDeck?.cards.find(c => c.id === progresso.ultimoCardId) ?? null;

  const getUltimoDeck = () => ultimoDeck;
  const getUltimoCard = () => ultimoCard;

  return (
    <AppContext.Provider value={{
      user, updateUser, login, logout, cadastrar, loading,
      tutorialDone, markTutorialDone,
      darkMode, toggleDarkMode,
      dyslexiaFont, toggleDyslexiaFont,
      mainDecks, decks, progresso,
      getUltimoDeck, getUltimoCard,
      createMainDeck, deleteMainDeck, updateMainDeck,
      createDeck, deleteDeck, updateDeck,
      createCard, deleteCard, updateCard,
      updateProgresso, cardRatings, rateCard,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
};

export default AppContext;
