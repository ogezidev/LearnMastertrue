import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './VerTodosPage.module.css';

const RATING_CLASS = {
  'lembro':       styles.ratingGreen,
  'lembro-pouco': styles.ratingBlue,
  'esqueci':      styles.ratingRed,
};

const VerTodosPage = () => {
  const { mainDecks, decks, deleteMainDeck, deleteDeck, deleteCard, cardRatings } = useApp();
  const navigate = useNavigate();

  const [selectedMainDeckId, setSelectedMainDeckId] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [showRatings, setShowRatings] = useState(false);

  const currentView = selectedDeckId
    ? 'flashcards'
    : selectedMainDeckId
    ? 'decks'
    : 'learndecks';

  const currentMainDeck = mainDecks.find((md) => md.id === selectedMainDeckId);
  const currentDeck = decks.find((d) => d.id === selectedDeckId);
  const currentDecks = decks.filter((d) => d.mainDeckId === selectedMainDeckId);
  const currentCards = currentDeck?.cards ?? [];

  const handleBack = () => {
    if (selectedDeckId) { setSelectedDeckId(null); setShowRatings(false); }
    else setSelectedMainDeckId(null);
  };

  const handleDeleteMainDeck = (e, id) => {
    e.stopPropagation();
    deleteMainDeck(id);
    if (selectedMainDeckId === id) setSelectedMainDeckId(null);
  };

  const handleDeleteDeck = (e, id) => {
    e.stopPropagation();
    deleteDeck(id);
    if (selectedDeckId === id) setSelectedDeckId(null);
  };

  const handleDeleteCard = (e, cardId) => {
    e.stopPropagation();
    deleteCard(selectedDeckId, cardId);
  };

  const headerTitle = {
    learndecks: 'Seus LearnDecks',
    decks: currentMainDeck?.nome ?? '',
    flashcards: currentDeck?.nome ?? '',
  }[currentView];

  const isEmpty =
    (currentView === 'learndecks' && mainDecks.length === 0) ||
    (currentView === 'decks' && currentDecks.length === 0) ||
    (currentView === 'flashcards' && currentCards.length === 0);

  return (
    <div className={styles.page}>
      <div className={styles.mainCard}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerSide}>
            {currentView !== 'learndecks' && (
              <button className={styles.backBtn} onClick={handleBack}>
                ← Voltar
              </button>
            )}
          </div>

          <h2 className={styles.headerTitle}>{headerTitle}</h2>

          <div className={styles.headerSide}>
            {currentView === 'flashcards' ? (
              <div className={styles.flashcardActions}>
                <button
                  className={`${styles.filterBtn} ${showRatings ? styles.filterBtnActive : ''}`}
                  onClick={() => setShowRatings((v) => !v)}
                  title="Filtrar por nota"
                >
                  ◈ Notas
                </button>
                <button
                  className={styles.playBtn}
                  onClick={() => navigate(`/memorizar/${selectedDeckId}`)}
                  title="Memorizar este deck"
                >
                  ▶
                </button>
              </div>
            ) : (
              <button
                className={styles.createBtn}
                onClick={() => navigate('/app/criar')}
              >
                + Criar
              </button>
            )}
          </div>
        </div>

        {/* ── Grid ── */}
        <div className={styles.gridWrapper}>
          {isEmpty ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyMsg}>Nenhum item encontrado.</p>
              <button className={styles.emptyBtn} onClick={() => navigate('/app/criar')}>
                Criar agora
              </button>
            </div>
          ) : (
            <div className={styles.grid}>

              {/* LearnDecks */}
              {currentView === 'learndecks' && mainDecks.map((md) => {
                const deckCount = decks.filter((d) => d.mainDeckId === md.id).length;
                return (
                  <div
                    key={md.id}
                    className={styles.itemCard}
                    onClick={() => setSelectedMainDeckId(md.id)}
                  >
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => handleDeleteMainDeck(e, md.id)}
                      title="Excluir"
                    >
                      ✕
                    </button>
                    <span className={styles.itemName}>{md.nome}</span>
                    <span className={styles.itemMeta}>
                      {deckCount} {deckCount === 1 ? 'deck' : 'decks'}
                    </span>
                  </div>
                );
              })}

              {/* Decks */}
              {currentView === 'decks' && currentDecks.map((deck) => (
                <div
                  key={deck.id}
                  className={styles.itemCard}
                  onClick={() => setSelectedDeckId(deck.id)}
                >
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDeleteDeck(e, deck.id)}
                    title="Excluir"
                  >
                    ✕
                  </button>
                  <span className={styles.itemName}>{deck.nome}</span>
                  <span className={styles.itemMeta}>
                    {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
                  </span>
                </div>
              ))}

              {/* Flashcards */}
              {currentView === 'flashcards' && currentCards.map((card) => {
                const rating = cardRatings[card.id];
                const ratingClass = showRatings && rating ? RATING_CLASS[rating] : '';
                return (
                  <div
                    key={card.id}
                    className={`${styles.itemCard} ${styles.itemCardFlash} ${ratingClass}`}
                  >
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => handleDeleteCard(e, card.id)}
                      title="Excluir"
                    >
                      ✕
                    </button>
                    <span className={styles.itemName}>{card.frente}</span>
                  </div>
                );
              })}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VerTodosPage;
