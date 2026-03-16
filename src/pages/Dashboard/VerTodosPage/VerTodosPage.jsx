import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './VerTodosPage.module.css';

const RATING_COLORS = {
  'lembro':       { card: styles.ratingGreen, label: 'Lembro',       labelCls: styles.ratingLabelGreen },
  'lembro-pouco': { card: styles.ratingBlue,  label: 'Lembro pouco', labelCls: styles.ratingLabelBlue  },
  'esqueci':      { card: styles.ratingRed,   label: 'Não lembro',   labelCls: styles.ratingLabelRed   },
};

const PALETTE = ['#F87171','#FB923C','#FBBF24','#4ADE80','#60A5FA','#818CF8','#C084FC','#F472B6','#34D399'];
function getColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const VerTodosPage = () => {
  const {
    mainDecks, decks,
    deleteMainDeck, deleteDeck, deleteCard,
    updateMainDeck, updateDeck, updateCard,
    cardRatings,
  } = useApp();
  const navigate = useNavigate();

  const [selectedMainDeckId, setSelectedMainDeckId] = useState(null);
  const [selectedDeckId,     setSelectedDeckId]     = useState(null);
  const [showRatings,        setShowRatings]         = useState(false);
  const [ratingFilter,       setRatingFilter]        = useState('all');
  const [searchTerm,         setSearchTerm]          = useState('');

  // Zoom modal (Item 14)
  const [zoomCard,     setZoomCard]     = useState(null); // { card, index }
  const [zoomRevealed, setZoomRevealed] = useState(false);

  // editModal: { type: 'learndeck'|'deck'|'flashcard', id, nome?, frente?, verso? }
  const [editModal, setEditModal] = useState(null);

  const currentView = selectedDeckId
    ? 'flashcards'
    : selectedMainDeckId
    ? 'decks'
    : 'learndecks';

  const currentMainDeck = mainDecks.find((md) => md.id === selectedMainDeckId);
  const currentDeck     = decks.find((d) => d.id === selectedDeckId);
  const currentDecks    = decks.filter((d) => d.mainDeckId === selectedMainDeckId);
  const currentCards    = currentDeck?.cards ?? [];

  const filteredCards = currentCards.filter((card) => {
    const matchesSearch = !searchTerm || card.frente.toLowerCase().includes(searchTerm.toLowerCase());
    const rating = cardRatings[card.id];
    const matchesRating = ratingFilter === 'all' || rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const ratingStats = {
    lembro:         currentCards.filter(c => cardRatings[c.id] === 'lembro').length,
    'lembro-pouco': currentCards.filter(c => cardRatings[c.id] === 'lembro-pouco').length,
    esqueci:        currentCards.filter(c => cardRatings[c.id] === 'esqueci').length,
  };

  const handleBack = () => {
    if (selectedDeckId) {
      setSelectedDeckId(null);
      setShowRatings(false);
      setRatingFilter('all');
      setSearchTerm('');
    } else {
      setSelectedMainDeckId(null);
    }
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

  const handleDeleteCard = (cardId) => {
    deleteCard(selectedDeckId, cardId);
    if (zoomCard?.card.id === cardId) setZoomCard(null);
  };

  const openEditMainDeck = (e, md) => {
    e.stopPropagation();
    setEditModal({ type: 'learndeck', id: md.id, nome: md.nome });
  };

  const openEditDeck = (e, deck) => {
    e.stopPropagation();
    setEditModal({ type: 'deck', id: deck.id, nome: deck.nome });
  };

  const openEditCard = (card) => {
    setEditModal({ type: 'flashcard', id: card.id, frente: card.frente, verso: card.verso });
  };

  const handleSaveEdit = () => {
    if (!editModal) return;
    if (editModal.type === 'learndeck') {
      if (editModal.nome.trim()) updateMainDeck(editModal.id, editModal.nome.trim());
    } else if (editModal.type === 'deck') {
      if (editModal.nome.trim()) updateDeck(editModal.id, editModal.nome.trim());
    } else if (editModal.type === 'flashcard') {
      if (editModal.frente.trim() && editModal.verso.trim())
        updateCard(selectedDeckId, editModal.id, editModal.frente.trim(), editModal.verso.trim());
    }
    setEditModal(null);
  };

  const openZoom = (card, index) => {
    setZoomCard({ card, index });
    setZoomRevealed(false);
  };

  const closeZoom = () => setZoomCard(null);

  const headerTitle = {
    learndecks: 'Seus LearnDecks',
    decks:      currentMainDeck?.nome ?? '',
    flashcards: currentDeck?.nome ?? '',
  }[currentView];

  const isEmpty =
    (currentView === 'learndecks' && mainDecks.length === 0) ||
    (currentView === 'decks'      && currentDecks.length === 0) ||
    (currentView === 'flashcards' && currentCards.length === 0);

  return (
    <div className={styles.page}>
      <div className={styles.mainCard}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {currentView !== 'learndecks' && (
              <button className={styles.backBtn} onClick={handleBack}>← Voltar</button>
            )}
          </div>

          <div className={styles.headerCenter}>
            {currentView !== 'learndecks' && (
              <span className={styles.breadcrumb}>
                Seus LearnDecks
                {currentMainDeck && ` › ${currentMainDeck.nome}`}
                {currentView === 'flashcards' && currentDeck && ` › ${currentDeck.nome}`}
              </span>
            )}
            <h2 className={styles.headerTitle}>{headerTitle}</h2>
          </div>

          <div className={styles.headerRight}>
            {currentView === 'flashcards' ? (
              <div className={styles.headerActions}>
                <button
                  className={`${styles.notasBtn} ${showRatings ? styles.notasBtnActive : ''}`}
                  onClick={() => { setShowRatings(v => !v); if (showRatings) setRatingFilter('all'); }}
                >
                  ◈ Notas
                </button>
                <button
                  className={styles.playBtn}
                  onClick={() => navigate(`/memorizar/${selectedDeckId}`)}
                  title="Memorizar"
                >▶</button>
              </div>
            ) : (
              <button className={styles.createBtn} onClick={() => navigate('/app/criar')}>
                + Criar
              </button>
            )}
          </div>
        </div>

        {/* ── Toolbar (flashcards only) ── */}
        {currentView === 'flashcards' && (
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>⌕</span>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Buscar flashcard..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className={styles.searchClear} onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>
            {showRatings && (
              <div className={styles.filterChips}>
                {[
                  { key: 'all',          label: 'Todos',         count: null },
                  { key: 'lembro',       label: 'Lembro',        count: ratingStats.lembro },
                  { key: 'lembro-pouco', label: 'Lembro pouco',  count: ratingStats['lembro-pouco'] },
                  { key: 'esqueci',      label: 'Não lembro',    count: ratingStats.esqueci },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    className={`${styles.chip} ${styles[`chip_${key.replace('-','_')}`]} ${ratingFilter === key ? styles.chipActive : ''}`}
                    onClick={() => setRatingFilter(key)}
                  >
                    {label}
                    {count !== null && <span className={styles.chipCount}>{count}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Content ── */}
        <div className={styles.gridWrapper}>
          {isEmpty ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyMsg}>Nenhum item ainda.</p>
              <button className={styles.emptyBtn} onClick={() => navigate('/app/criar')}>
                Criar agora
              </button>
            </div>
          ) : currentView === 'flashcards' ? (

            <div className={styles.flashGrid}>
              {filteredCards.length === 0 ? (
                <p className={styles.noResults}>Nenhum card encontrado.</p>
              ) : filteredCards.map((card, i) => {
                const rating     = cardRatings[card.id];
                const ratingInfo = showRatings && rating ? RATING_COLORS[rating] : null;
                return (
                  <div
                    key={card.id}
                    className={`${styles.flashCard} ${ratingInfo ? ratingInfo.card : ''}`}
                    onClick={() => openZoom(card, i)}
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    {ratingInfo && (
                      <span className={`${styles.ratingLabel} ${ratingInfo.labelCls}`}>
                        {ratingInfo.label}
                      </span>
                    )}
                    <div className={styles.cardActions}>
                      <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); openEditCard(card); }} title="Editar">✎</button>
                      <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }} title="Excluir">✕</button>
                    </div>
                    <span className={styles.cardIndex}>#{i + 1}</span>
                    <p className={styles.flashName}>{card.frente}</p>
                    <span className={styles.cardHint}>Clique para ver →</span>
                  </div>
                );
              })}
            </div>

          ) : (

            /* ── Album Grid (LearnDecks / Decks) ── */
            <div className={styles.albumGrid}>
              {currentView === 'learndecks' && mainDecks.map((md, i) => {
                const deckCount = decks.filter((d) => d.mainDeckId === md.id).length;
                const color = getColor(md.nome);
                return (
                  <div
                    key={md.id}
                    className={styles.albumTile}
                    onClick={() => setSelectedMainDeckId(md.id)}
                    style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}
                  >
                    <div className={styles.albumCover} style={{ background: color }}>
                      <span className={styles.albumInitial}>{md.nome[0]?.toUpperCase()}</span>
                    </div>
                    <div className={styles.albumInfo}>
                      <span className={styles.albumName}>{md.nome}</span>
                      <span className={styles.albumMeta}>{deckCount} {deckCount === 1 ? 'deck' : 'decks'}</span>
                    </div>
                    <div className={styles.albumActions}>
                      <button className={styles.tileEditBtn} onClick={(e) => openEditMainDeck(e, md)} title="Editar">✎</button>
                      <button className={styles.tileDeleteBtn} onClick={(e) => handleDeleteMainDeck(e, md.id)} title="Excluir">✕</button>
                    </div>
                  </div>
                );
              })}

              {currentView === 'decks' && currentDecks.map((deck, i) => {
                const color = getColor(deck.nome);
                return (
                  <div
                    key={deck.id}
                    className={styles.albumTile}
                    onClick={() => setSelectedDeckId(deck.id)}
                    style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}
                  >
                    <div className={styles.albumCover} style={{ background: color }}>
                      <span className={styles.albumInitial}>{deck.nome[0]?.toUpperCase()}</span>
                    </div>
                    <div className={styles.albumInfo}>
                      <span className={styles.albumName}>{deck.nome}</span>
                      <span className={styles.albumMeta}>
                        {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
                      </span>
                    </div>
                    <div className={styles.albumActions}>
                      <button className={styles.tileEditBtn} onClick={(e) => openEditDeck(e, deck)} title="Editar">✎</button>
                      <button className={styles.tileDeleteBtn} onClick={(e) => handleDeleteDeck(e, deck.id)} title="Excluir">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Zoom Modal — Modo Janela (Item 14) ── */}
      {zoomCard && (
        <div className={styles.zoomOverlay} onClick={closeZoom}>
          <div className={styles.zoomModal} onClick={e => e.stopPropagation()}>

            <div className={styles.zoomHeader}>
              <span className={styles.zoomIndex}>#{zoomCard.index + 1}</span>
              <div className={styles.zoomHeaderActions}>
                <button
                  className={styles.zoomEditBtn}
                  onClick={() => { closeZoom(); openEditCard(zoomCard.card); }}
                >
                  ✎ Editar
                </button>
                <button
                  className={styles.zoomDeleteBtn}
                  onClick={() => handleDeleteCard(zoomCard.card.id)}
                >
                  Excluir
                </button>
                <button className={styles.zoomCloseBtn} onClick={closeZoom}>✕</button>
              </div>
            </div>

            <div className={styles.zoomBody}>
              <div className={styles.zoomFrente}>
                <span className={styles.zoomSideLabel}>Frente</span>
                <p className={styles.zoomText}>{zoomCard.card.frente}</p>
              </div>

              {!zoomRevealed ? (
                <button className={styles.revealBtn} onClick={() => setZoomRevealed(true)}>
                  Mostrar verso
                </button>
              ) : (
                <div className={styles.zoomVerso}>
                  <span className={styles.zoomSideLabelVerso}>Verso</span>
                  <p className={styles.zoomTextVerso}>{zoomCard.card.verso}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editModal && (
        <div className={styles.modalOverlay} onClick={() => setEditModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editModal.type === 'flashcard' ? 'Editar Flashcard'
                  : editModal.type === 'deck'   ? 'Editar Deck'
                  : 'Editar LearnDeck'}
              </h3>
              <button className={styles.modalClose} onClick={() => setEditModal(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {editModal.type === 'flashcard' ? (
                <>
                  <label className={styles.modalLabel}>Frente</label>
                  <textarea
                    className={styles.modalTextarea}
                    value={editModal.frente}
                    onChange={e => setEditModal(m => ({ ...m, frente: e.target.value }))}
                    placeholder="Frente do card..."
                    rows={3}
                  />
                  <label className={styles.modalLabel}>Verso</label>
                  <textarea
                    className={`${styles.modalTextarea} ${styles.modalTextareaVerso}`}
                    value={editModal.verso}
                    onChange={e => setEditModal(m => ({ ...m, verso: e.target.value }))}
                    placeholder="Verso do card..."
                    rows={3}
                  />
                </>
              ) : (
                <>
                  <label className={styles.modalLabel}>Nome</label>
                  <input
                    className={styles.modalInput}
                    value={editModal.nome}
                    onChange={e => setEditModal(m => ({ ...m, nome: e.target.value }))}
                    placeholder="Nome..."
                    maxLength={60}
                    onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                    autoFocus
                  />
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setEditModal(null)}>Cancelar</button>
              <button className={styles.modalSave} onClick={handleSaveEdit}>Salvar</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default VerTodosPage;
