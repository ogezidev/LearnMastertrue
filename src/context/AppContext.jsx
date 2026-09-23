import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '@/services/api';

const AppContext = createContext(null);

const darkModeKey    = (userId) => `lm_dark_${userId}`;
const tutorialKey    = (userId) => `lm_tutorial_${userId}`;

export const AppProvider = ({ children }) => {
  // A sessão fica num cookie httpOnly: ao abrir o app, pergunta ao servidor quem está logado
  const [user, setUser] = useState(null);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const iniciou = useRef(false);

  const [darkMode, setDarkMode] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(() => localStorage.getItem('lm_dyslexia') === 'true');
  const [mainDecks, setMainDecks] = useState([]);
  const [decks, setDecks] = useState([]);
  const [progresso, setProgresso] = useState({ ultimoDeckId: null, ultimoCardId: null });
  const [cardRatings, setCardRatings] = useState({});
  const [loading, setLoading] = useState(false);
  // Os dados do usuário já chegaram do servidor? (evita mostrar "vazio" antes da hora)
  const [dadosCarregados, setDadosCarregados] = useState(false);
  const [erroDados, setErroDados] = useState(null);
  // Força nova renderização quando o tutorial é concluído (o valor vem do localStorage)
  const [, setTutorialVersao] = useState(0);

  // Preferências são lidas por usuário sempre que outra conta entra
  useEffect(() => {
    setDarkMode(user?.id ? localStorage.getItem(darkModeKey(user.id)) === 'true' : false);
  }, [user?.id]);

  useEffect(() => {
    document.body.classList.toggle('dyslexia-font', dyslexiaFont);
    localStorage.setItem('lm_dyslexia', dyslexiaFont);
  }, [dyslexiaFont]);

  const toggleDarkMode = () => {
    const novo = !darkMode;
    setDarkMode(novo);
    if (user?.id) localStorage.setItem(darkModeKey(user.id), novo);
  };
  const toggleDyslexiaFont = () => setDyslexiaFont(v => !v);

  const tutorialDone = !!user?.id && localStorage.getItem(tutorialKey(user.id)) === 'true';

  const markTutorialDone = () => {
    if (user?.id) localStorage.setItem(tutorialKey(user.id), 'true');
    setTutorialVersao(v => v + 1);
  };

  // ── Carrega os dados do usuário logado (o servidor já filtra pelo dono) ──
  const loadData = useCallback(async () => {
    setLoading(true);
    setErroDados(null);
    try {
      const [allMainDecks, allDecks, allFlashcards] = await Promise.all([
        api.getMainDecksApi(),
        api.getDecksApi(),
        api.getFlashcardsApi(),
      ]);
      const decksWithCards = allDecks.map(deck => ({
        ...deck,
        cards: allFlashcards
          .filter(f => f.deckId === deck.id)
          .map(f => ({ id: f.id, frente: f.frente, verso: f.verso })),
      }));
      setMainDecks(allMainDecks);
      setDecks(decksWithCards);
      setDadosCarregados(true);
    } catch (err) {
      setErroDados(err.message || 'Não foi possível carregar seus dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  const limparEstado = useCallback(() => {
    api.limparSessaoLocal();
    setUser(null);
    setMainDecks([]);
    setDecks([]);
    setProgresso({ ultimoDeckId: null, ultimoCardId: null });
    setCardRatings({});
    setDadosCarregados(false);
    setErroDados(null);
  }, []);

  // Restaura a sessão ao abrir o app (o ref evita repetir no StrictMode)
  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    api.definirAoExpirarSessao(limparEstado);
    api.renovarSessao()
      .then(async (data) => {
        setUser(data.usuario);
        await loadData();
      })
      .catch(() => {})
      .finally(() => setVerificandoSessao(false));
  }, [limparEstado, loadData]);

  // ── Auth ──
  const login = async (email, senha, lembrar = false) => {
    const data = await api.loginApi(email, senha, lembrar);
    setUser(data.usuario);
    await loadData();
    return data.usuario;
  };

  const logout = async () => {
    try { await api.logoutApi(); } catch { /* a sessão local é encerrada mesmo assim */ }
    limparEstado();
  };

  const cadastrar = async (nome, email, senha) => {
    const data = await api.cadastrarApi(nome, email, senha);
    setUser(data.usuario);
    setMainDecks([]);
    setDecks([]);
    setDadosCarregados(true);
    return data.usuario;
  };

  // ── Conta ──
  const atualizarNome = async (nome) => {
    setUser(await api.atualizarNomeApi(nome));
  };

  const alterarEmail = async (email, senhaAtual) => {
    setUser(await api.alterarEmailApi(email, senhaAtual));
  };

  const alterarSenha = async (senhaAtual, novaSenha) => {
    const data = await api.alterarSenhaApi(senhaAtual, novaSenha);
    setUser(data.usuario);
  };

  // ── MainDeck (LearnDeck) ──
  const createMainDeck = async (nome) => {
    const created = await api.createMainDeckApi(nome);
    setMainDecks(prev => [...prev, created]);
    return created;
  };

  // Uma chamada só: o servidor apaga decks, cards e avaliações numa transação
  const deleteMainDeck = async (mainDeckId) => {
    await api.deleteMainDeckApi(mainDeckId);
    setMainDecks(prev => prev.filter(md => md.id !== mainDeckId));
    setDecks(prev => prev.filter(d => d.mainDeckId !== mainDeckId));
  };

  const updateMainDeck = async (mainDeckId, nome) => {
    await api.updateMainDeckApi(mainDeckId, nome);
    setMainDecks(prev => prev.map(md => md.id === mainDeckId ? { ...md, nome } : md));
  };

  // ── Deck ──
  const createDeck = async (nome, mainDeckId) => {
    const created = await api.createDeckApi(nome, mainDeckId);
    const newDeck = { ...created, cards: [] };
    setDecks(prev => [...prev, newDeck]);
    return newDeck;
  };

  const deleteDeck = async (deckId) => {
    await api.deleteDeckApi(deckId);
    setDecks(prev => prev.filter(d => d.id !== deckId));
  };

  const updateDeck = async (deckId, nome) => {
    const deck = decks.find(d => d.id === deckId);
    await api.updateDeckApi(deckId, nome, deck.mainDeckId);
    setDecks(prev => prev.map(d => d.id === deckId ? { ...d, nome } : d));
  };

  // ── Flashcard ──
  const createCard = async (deckId, frente, verso) => {
    const created = await api.createFlashcardApi(frente, verso, deckId);
    setDecks(prev =>
      prev.map(deck =>
        deck.id === deckId
          ? { ...deck, cards: [...deck.cards, { id: created.id, frente: created.frente, verso: created.verso }] }
          : deck
      )
    );
    return created.id;
  };

  // cards: [{ frente, verso }] (1 a 5). Devolve os cards criados.
  const createCards = async (deckId, cards) => {
    const criados = await api.createFlashcardsLoteApi(deckId, cards);
    const novos = criados.map(c => ({ id: c.id, frente: c.frente, verso: c.verso }));
    setDecks(prev =>
      prev.map(deck => (deck.id === deckId ? { ...deck, cards: [...deck.cards, ...novos] } : deck))
    );
    return novos;
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
    await api.updateFlashcardApi(cardId, frente, verso, deckId);
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
      user, verificandoSessao, login, logout, cadastrar, loading,
      dadosCarregados, erroDados, recarregarDados: loadData,
      atualizarNome, alterarEmail, alterarSenha,
      tutorialDone, markTutorialDone,
      darkMode, toggleDarkMode,
      dyslexiaFont, toggleDyslexiaFont,
      mainDecks, decks, progresso,
      getUltimoDeck, getUltimoCard,
      createMainDeck, deleteMainDeck, updateMainDeck,
      createDeck, deleteDeck, updateDeck,
      createCard, createCards, deleteCard, updateCard,
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
