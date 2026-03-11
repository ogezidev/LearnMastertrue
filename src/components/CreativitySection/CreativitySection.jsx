import styles from './CreativitySection.module.css';
import imgPessoa from '@/assets/images/ImagemCriatividade.png';
import iconCriador from '@/assets/images/IconModoCriador.png';
import iconRevisao from '@/assets/images/IconRevisaoInteligente.png';

// ─── FeatureItem reutilizável ──────────────────────────────────────
const FeatureItem = ({ icon, title, subtitle, description }) => (
  <div className={styles.featureItem}>
    <div className={styles.featureIcon}>
      <img src={icon} alt={title} />
    </div>
    <div className={styles.featureText}>
      <h4 className={styles.featureTitle}>{title}</h4>
      <p className={styles.featureSubtitle}>{subtitle}</p>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  </div>
);

// ─── Dados dos blocos ──────────────────────────────────────────────
const features = [
  {
    icon: iconCriador,
    title: 'Modo Criador',
    subtitle: 'Crie seus próprios flashcards.',
    description: 'Assuma o controle e transforme suas ideias em estudos poderosos.',
  },
  {
    icon: iconRevisao,
    title: 'Revisão Inteligente',
    subtitle: 'Memorize de forma eficaz.',
    description: 'Nosso algoritmo de repetição espaçada otimiza sua rotina de forma inteligente.',
  },
];

// ─── Componente principal ──────────────────────────────────────────
const CreativitySection = () => (
  <section className={styles.section}>
    <div className={styles.container}>

      {/* Coluna esquerda */}
      <div className={styles.textCol}>
        <h2 className={styles.title}>A sua criatividade aqui vai além!</h2>
        <p className={styles.subtitle}>
          Aqui, sua autonomia é prioridade. Damos a você a liberdade real e o poder de
          personalização total para dominar o conhecimento de um jeito que é exclusivamente seu.
        </p>

        <div className={styles.featureList}>
          {features.map((f, i) => (
            <FeatureItem
              key={i}
              icon={f.icon}
              title={f.title}
              subtitle={f.subtitle}
              description={f.description}
            />
          ))}
        </div>
      </div>

      {/* Coluna direita — imagem */}
      <div className={styles.imageCol}>
        <img
          src={imgPessoa}
          alt="Estudante criativo com LearnMaster"
          className={styles.image}
        />
      </div>

    </div>
  </section>
);

export default CreativitySection;
