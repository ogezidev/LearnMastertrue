import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import imgLearnDeck from '@/assets/images/LearnDeck.png';
import styles from './HomePage.module.css';

const getSaudacao = () => {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
};

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const STREAK_DAYS = 0; // Visual only — backend TBD

const StreakWidget = () => {
  const todayIdx = new Date().getDay();
  const doneDaySet = new Set(
    Array.from({ length: STREAK_DAYS }, (_, i) => ((todayIdx - i + 7) % 7))
  );
  const flameSize = Math.min(22 + STREAK_DAYS * 2, 46);

  return (
    <div className={styles.streakWrap}>
      <div className={styles.streakLeft}>
        <svg
          width={flameSize}
          height={Math.round(flameSize * 1.4)}
          viewBox="0 0 20 28"
          fill="none"
          className={STREAK_DAYS > 0 ? styles.streakFlameGlow : ''}
        >
          <path d="M10 0C10 0 5 7 5 14C5 17.9 7 20.5 10 22C13 20.5 15 17.9 15 14C15 7 10 0 10 0Z" fill="url(#fg1)"/>
          <path d="M10 9C10 9 7.5 13 7.5 16.5C7.5 18.5 8.6 20 10 21C11.4 20 12.5 18.5 12.5 16.5C12.5 13 10 9 10 9Z" fill="url(#fg2)"/>
          <defs>
            <linearGradient id="fg1" x1="10" y1="0" x2="10" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93c5fd"/>
              <stop offset="100%" stopColor="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="fg2" x1="10" y1="9" x2="10" y2="21" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e0f2fe"/>
              <stop offset="100%" stopColor="#60a5fa"/>
            </linearGradient>
          </defs>
        </svg>
        <div className={styles.streakInfo}>
          <span className={styles.streakCount}>{STREAK_DAYS}</span>
          <span className={styles.streakLabel}>dias seguidos</span>
        </div>
      </div>
      <div className={styles.streakDays}>
        {DAYS_SHORT.map((day, i) => {
          const isDone = doneDaySet.has(i);
          const isToday = i === todayIdx;
          return (
            <div key={day} className={styles.streakDay}>
              <div className={`${styles.streakDot} ${isDone ? styles.dotDone : ''} ${isToday ? styles.dotToday : ''}`} />
              <span className={styles.streakDayLabel}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HomePage = () => {
  const { user, mainDecks, getUltimoDeck, getUltimoCard } = useApp();
  const navigate = useNavigate();

  const ultimoDeck = getUltimoDeck();
  const ultimoCard = getUltimoCard();
  const isFirstVisit = mainDecks.length === 0;

  const handleMemorizar = () => {
    if (isFirstVisit) {
      navigate('/criar/learndeck');
    } else if (ultimoDeck) {
      navigate(`/memorizar/${ultimoDeck.id}`);
    }
  };

  return (
    <div className={styles.page}>

      <div className={styles.heroCard}>

        {/* Esquerda */}
        <div className={styles.heroLeft}>
          <p className={styles.saudacao}>
            {getSaudacao()}, {user.nome}!
          </p>
          <h1 className={styles.heroTitle}>
            {isFirstVisit ? 'Bem-vindo ao LearnMaster!' : 'Novo dia, novo aprendizado.'}
          </h1>
          <p className={styles.heroSubtitle}>
            {isFirstVisit
              ? 'Organize seus estudos com flashcards e memorize tudo com eficiência.'
              : 'A consistência diária é a verdadeira chave para alcançar a memorização de longo prazo.'}
          </p>
          <button className={styles.btnMemorizar} onClick={handleMemorizar}>
            {isFirstVisit ? 'Começar agora' : 'Memorizar'}
          </button>
          <StreakWidget />
        </div>

        {/* Direita - último deck/card */}
        <div className={styles.heroRight}>
          <img src={imgLearnDeck} alt="LearnDeck" className={styles.learnDeckImg} />

          <div className={styles.progressCard}>
            {!isFirstVisit && ultimoDeck && (
              <span className={styles.progressDeckTag}>{ultimoDeck.nome}</span>
            )}
            <p className={styles.progressCardName}>
              {isFirstVisit
                ? 'Que tal darmos o primeiro passo?'
                : (ultimoCard ? ultimoCard.frente : '---')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
