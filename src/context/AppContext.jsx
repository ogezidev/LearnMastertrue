import { createContext, useContext, useState } from 'react';
import { mockDecks, mockMainDecks, mockProgresso, mockUser } from '@/MockData/mockData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user] = useState(mockUser);
  const [mainDecks, setMainDecks] = useState(mockMainDecks);
  const [decks, setDecks] = useState(mockDecks);
  const [progresso, setProgresso] = useState(mockProgresso);
  const [cardRatings, setCardRatings] = useState({}); // { [cardId]: 'lembro' | 'lembro-pouco' | 'esqueci' }

  // --- MainDeck (LearnDeck) ---
  const createMainDeck = (nome) => {
    const newMainDeck = { id: Date.now(), nome, usuarioId: user.id };
    setMainDecks((prev) => [...prev, newMainDeck]);
    return newMainDeck;
  };

  const deleteMainDeck = (mainDeckId) => {
    setMainDecks((prev) => prev.filter((md) => md.id !== mainDeckId));
    setDecks((prev) => prev.filter((d) => d.mainDeckId !== mainDeckId));
  };

  // --- Deck ---
  const createDeck = (nome, mainDeckId) => {
    const newDeck = { id: Date.now(), nome, mainDeckId, cards: [] };
    setDecks((prev) => [...prev, newDeck]);
    return newDeck;
  };

  const deleteDeck = (deckId) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  };

  // --- Flashcard ---
  const createCard = (deckId, frente, verso) => {
    const id = Date.now();
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === deckId
          ? { ...deck, cards: [...deck.cards, { id, frente, verso }] }
          : deck
      )
    );
    return id;
  };

  const deleteCard = (deckId, cardId) => {
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === deckId
          ? { ...deck, cards: deck.cards.filter((c) => c.id !== cardId) }
          : deck
      )
    );
  };

  const updateCard = (deckId, cardId, frente, verso) => {
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === deckId
          ? {
              ...deck,
              cards: deck.cards.map((c) =>
                c.id === cardId ? { ...c, frente, verso } : c
              ),
            }
          : deck
      )
    );
  };

  // --- Notas dos cards ---
  const rateCard = (cardId, rating) => {
    setCardRatings((prev) => ({ ...prev, [cardId]: rating }));
  };

  // --- Progresso (último deck/card visto) ---
  const updateProgresso = (data) => {
    setProgresso((prev) => ({ ...prev, ...data }));
  };

  const ultimoDeck = decks.find((d) => d.id === progresso.ultimoDeckId) ?? null;
  const ultimoCard = ultimoDeck?.cards.find((c) => c.id === progresso.ultimoCardId) ?? null;

  const getUltimoDeck = () => ultimoDeck;
  const getUltimoCard = () => ultimoCard;

  return (
    <AppContext.Provider
      value={{
        user,
        mainDecks,
        decks,
        progresso,
        getUltimoDeck,
        getUltimoCard,
        createMainDeck,
        deleteMainDeck,
        createDeck,
        deleteDeck,
        createCard,
        deleteCard,
        updateCard,
        updateProgresso,
        cardRatings,
        rateCard,
      }}
    >
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
