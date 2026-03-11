import styles from './SpeedSection.module.css';
import imgMascote from '@/assets/images/MascoteLearnScott.png';
import imgGarota from '@/assets/images/ImagemGarota.png';
import imgGrafico from '@/assets/images/ImagemGrafico.png';

// ─── Card reutilizável ─────────────────────────────────────────────
const BenefitCard = ({ image, title, subtitle }) => (
  <div className={styles.card}>
    <div className={styles.cardImageWrapper}>
      <img src={image} alt={title} className={styles.cardImage} />
    </div>
    <div className={styles.cardText}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardSubtitle}>{subtitle}</p>
    </div>
  </div>
);

// ─── Dados dos cards ───────────────────────────────────────────────
const cards = [
  {
    image: imgMascote,
    title: 'Um método moderno e personalizado.',
    subtitle: 'Modernidade e personalização pensadas para você.',
  },
  {
    image: imgGarota,
    title: 'A confiança dos usuários fala por si.',
    subtitle: 'Resultados comprovados, usuários satisfeitos.',
  },
  {
    image: imgGrafico,
    title: 'Aqui, seu tempo vira progresso.',
    subtitle: 'Seu esforço convertido em resultados visíveis.',
  },
];

// ─── Componente principal ──────────────────────────────────────────
const SpeedSection = () => (
  <section className={styles.section}>

    {/* Cabeçalho */}
    <div className={styles.header}>
      <h2 className={styles.title}>Rapidez e memorização eficaz</h2>
      <p className={styles.subtitle}>
        Conte com a rapidez da LearnMaster para se desenvolver no quesito de memorização
        e buscar melhores resultados de estudo.
      </p>
    </div>

    {/* Cards */}
    <div className={styles.cardsRow}>
      {cards.map((card, index) => (
        <BenefitCard
          key={index}
          image={card.image}
          title={card.title}
          subtitle={card.subtitle}
        />
      ))}
    </div>

  </section>
);

export default SpeedSection;
