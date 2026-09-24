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

const HomePage = () => {
  const { user, mainDecks, decks, ultimoDeck, dadosCarregados, cardRatings } = useApp();
  const navigate = useNavigate();

  const isFirstVisit = dadosCarregados && mainDecks.length === 0;
  const learnDeckDoUltimo = mainDecks.find((md) => md.id === ultimoDeck?.mainDeckId);

  // Resumo dos cards do usuário
  const todosCards = decks.flatMap((d) => d.cards);
  const dificeis = todosCards.filter((c) => cardRatings[c.id] === 'dificil').length;
  const naoAvaliados = todosCards.filter((c) => !cardRatings[c.id]).length;
  const resumo = [
    { valor: todosCards.length, label: todosCards.length === 1 ? 'flashcard' : 'flashcards' },
    { valor: dificeis, label: dificeis === 1 ? 'difícil' : 'difíceis' },
    { valor: naoAvaliados, label: naoAvaliados === 1 ? 'não avaliado' : 'não avaliados' },
  ];

  // /memorizar abre o último deck estudado ou pede para escolher um
  const handleMemorizar = () => {
    navigate(isFirstVisit ? '/criar/learndeck' : '/memorizar');
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
          {dadosCarregados && !isFirstVisit && (
            <ul className={styles.resumo} aria-label="Resumo dos seus cards">
              {resumo.map((item) => (
                <li key={item.label} className={styles.resumoItem}>
                  <span className={styles.resumoNum}>{item.valor}</span>
                  <span className={styles.resumoLabel}>{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Direita - último deck/card */}
        <div className={styles.heroRight}>
          <img src={imgLearnDeck} alt="LearnDeck" className={styles.learnDeckImg} />

          <div className={styles.progressCard}>
            {!isFirstVisit && ultimoDeck && (
              <span className={styles.progressDeckTag}>
                {learnDeckDoUltimo ? `${learnDeckDoUltimo.nome} › ` : ''}{ultimoDeck.nome}
              </span>
            )}
            <p className={styles.progressCardName}>
              {isFirstVisit
                ? 'Que tal darmos o primeiro passo?'
                : ultimoDeck
                  ? `Continue de onde parou: ${ultimoDeck.cards.length} ${ultimoDeck.cards.length === 1 ? 'card' : 'cards'}`
                  : 'Escolha um deck para começar a estudar.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
