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
  const { user, getUltimoDeck, getUltimoCard } = useApp();
  const navigate = useNavigate();

  const ultimoDeck = getUltimoDeck();
  const ultimoCard = getUltimoCard();

  return (
    <div className={styles.page}>

      <div className={styles.heroCard}>

        {/* Esquerda */}
        <div className={styles.heroLeft}>
          <p className={styles.saudacao}>
            {getSaudacao()}, {user.nome}!
          </p>
          <h1 className={styles.heroTitle}>Novo dia, novo aprendizado.</h1>
          <p className={styles.heroSubtitle}>
            A consistência diária é a verdadeira chave para alcançar
            a memorização de longo prazo.
          </p>
          <button
            className={styles.btnMemorizar}
            onClick={() => ultimoDeck && navigate(`/memorizar/${ultimoDeck.id}`)}
          >
            Memorizar
          </button>
        </div>

        {/* Direita - último deck/card */}
        <div className={styles.heroRight}>
          <img src={imgLearnDeck} alt="LearnDeck" className={styles.learnDeckImg} />

          <div className={styles.progressCard}>
            <span className={styles.progressDeckTag}>
              {ultimoDeck ? ultimoDeck.nome : 'Nenhum deck'}
            </span>
            <p className={styles.progressCardName}>
              {ultimoCard ? ultimoCard.frente : '---'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
