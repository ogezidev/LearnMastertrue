import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './IntroPage.module.css';

const IntroPage = () => {
  const { deckId } = useParams();
  const { decks, mainDecks } = useApp();
  const navigate = useNavigate();

  const deck = decks.find((d) => d.id === Number(deckId));
  const mainDeck = mainDecks.find((md) => md.id === deck?.mainDeckId);

  if (!deck || deck.cards.length === 0) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate('/app')}>Voltar</button>
        <div className={styles.center}>
          <p className={styles.emptyMsg}>Este deck não tem flashcards ainda.</p>
          <button className={styles.studyBtn} onClick={() => navigate('/app/criar')}>
            Criar flashcards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/app')}>Voltar</button>

      <div className={styles.center}>
        {mainDeck && (
          <span className={styles.badge}>{mainDeck.nome}</span>
        )}
        <h1 className={styles.deckName}>{deck.nome}</h1>
        <p className={styles.cardCount}>
          {deck.cards.length} {deck.cards.length === 1 ? 'flashcard' : 'flashcards'}
        </p>
        <button
          className={styles.studyBtn}
          onClick={() => navigate(`/memorizar/${deckId}/estudar`)}
        >
          Estudar agora
        </button>
      </div>

      {/* Decorative blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
    </div>
  );
};

export default IntroPage;
