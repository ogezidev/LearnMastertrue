import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './EstudarPage.module.css';

const RATINGS = [
  { key: 'esqueci',      label: 'Esqueci',       style: styles.ratingRed  },
  { key: 'lembro-pouco', label: 'Lembro pouco',  style: styles.ratingBlue },
  { key: 'lembro',       label: 'Lembro',        style: styles.ratingGreen },
];

const EstudarPage = () => {
  const { deckId } = useParams();
  const { decks, updateProgresso, rateCard } = useApp();
  const navigate = useNavigate();

  const deck = decks.find((d) => d.id === Number(deckId));
  const cards = deck?.cards ?? [];

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!deck || cards.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyCenter}>
          <p>Nenhum card encontrado.</p>
          <button className={styles.navBtn} onClick={() => navigate(`/memorizar/${deckId}`)}>Voltar</button>
        </div>
      </div>
    );
  }

  const card = cards[index];
  const progress = Math.round(((index + (flipped ? 1 : 0)) / cards.length) * 100);
  const isLast = index === cards.length - 1;

  const handleFlip = () => {
    if (!flipped) setFlipped(true);
  };

  const handleRate = (rating) => {
    rateCard(card.id, rating);
    updateProgresso({ ultimoDeckId: deck.id, ultimoCardId: card.id });
    if (isLast) {
      navigate(`/memorizar/${deckId}`);
      return;
    }
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (index === 0) return;
    setFlipped(false);
    setIndex((i) => i - 1);
  };

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.headerBtn} onClick={() => navigate(`/memorizar/${deckId}`)}>
            ← Voltar
          </button>
        </div>

        <div className={styles.headerCenter}>
          <span className={styles.deckTitle}>{deck.nome}</span>
          <div className={styles.progressRow}>
            <span className={styles.progressLabel}>{progress}%</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressLabel}>{index + 1}/{cards.length}</span>
          </div>
        </div>

        <div className={styles.headerRight} />
      </header>

      {/* ── Card ── */}
      <main className={styles.main}>
        <div className={styles.cardScene} onClick={handleFlip}>
          <div className={`${styles.cardInner} ${flipped ? styles.cardInnerFlipped : ''}`}>

            {/* Frente */}
            <div className={styles.cardFront}>
              <span className={styles.cardLabel}>Frente</span>
              <p className={styles.cardText}>{card.frente}</p>
              {!flipped && <span className={styles.cardHint}>Clique para revelar</span>}
            </div>

            {/* Verso */}
            <div className={styles.cardBack}>
              <span className={styles.cardLabelBack}>Verso</span>
              <p className={styles.cardTextBack}>{card.verso}</p>
            </div>

          </div>
        </div>

        {/* ── Rating + Voltar — aparecem após virar ── */}
        <div className={`${styles.actions} ${flipped ? styles.actionsVisible : ''}`}>
          <button
            className={styles.prevBtn}
            onClick={handlePrev}
            disabled={index === 0}
          >
            ← Anterior
          </button>

          <div className={styles.ratingBtns}>
            {RATINGS.map(({ key, label, style }) => (
              <button
                key={key}
                className={`${styles.ratingBtn} ${style}`}
                onClick={() => handleRate(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </main>

    </div>
  );
};

export default EstudarPage;
