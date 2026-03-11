import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './CriarPage.module.css';

const CriarPage = () => {
  const { mainDecks } = useApp();
  const navigate = useNavigate();
  const temLearnDeck = mainDecks.length > 0;

  return (
    <div className={styles.page}>

      {!temLearnDeck ? (
        <div className={`${styles.mainCard} ${styles.mainCardEmpty}`}>
          <h2 className={styles.emptyTitle}>Antes de começarmos...</h2>
          <p className={styles.emptySubtitle}>
            Crie seu primeiro LearnDeck para começar a organizar seus estudos.
          </p>
          <button className={styles.emptyBtn} onClick={() => navigate('/criar/learndeck')}>
            Criar LearnDeck
          </button>
        </div>
      ) : (
        <div className={`${styles.mainCard} ${styles.mainCardFull}`}>

          {/* LearnDeck */}
          <div className={`${styles.card} ${styles.cardBlue}`}>
            <h2 className={styles.cardTitle}>Crie um LearnDeck</h2>
            <p className={styles.cardDesc}>
              LearnDeck é onde comporta seus decks!
            </p>
            <button
              className={`${styles.cardBtn} ${styles.cardBtnWhite}`}
              onClick={() => navigate('/criar/learndeck')}
            >
              Criar
            </button>
          </div>

          {/* Deck */}
          <div className={`${styles.card} ${styles.cardWhite}`}>
            <h2 className={`${styles.cardTitle} ${styles.cardTitleBlue}`}>Crie um deck</h2>
            <p className={`${styles.cardDesc} ${styles.cardDescBlue}`}>
              Deck é a sua pasta onde comporta seus flashcards!
            </p>
            <button
              className={`${styles.cardBtn} ${styles.cardBtnBlue}`}
              onClick={() => navigate('/criar/deck')}
            >
              Criar
            </button>
          </div>

          {/* Flashcard */}
          <div className={`${styles.card} ${styles.cardBlue}`}>
            <h2 className={styles.cardTitle}>Crie um flashcard</h2>
            <p className={styles.cardDesc}>
              Flashcard é o método que irá fazer você memorizar!
            </p>
            <button
              className={`${styles.cardBtn} ${styles.cardBtnWhite}`}
              onClick={() => navigate('/criar/flashcard')}
            >
              Criar
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default CriarPage;
