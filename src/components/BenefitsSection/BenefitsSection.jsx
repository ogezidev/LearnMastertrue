import styles from './BenefitsSection.module.css';
import peopleImage from '@/assets/images/DivisaoPessoas.png';

const benefitsList = [
  { text: 'Flashcards inteligentes' },
  { text: 'Decks intuitivos e personalizado' },
  { text: 'Propriedade do LearnDeck' },
  { text: 'Aprendizagem rápida' },
  { text: 'Plataforma moderna e atualizada' },
  { text: 'Gestão pedagógica otimizada' },
];

const BenefitsSection = () => {
  return (
    <section className={styles.benefitsSection}>
      <div className={styles.container}>
        <div className={styles.titleCol}>
          <h2 className={styles.title}>
            Benefícios para todos da comunidade de flashcards
          </h2>
        </div>

        <div className={styles.contentCol}>
          <p className={styles.description}>
            A LearnMaster desenvolve flashcards digitais inteligentes e conecta
            seus usuários a um ambiente de aprendizagem moderno, intuitivo e
            eficiente, facilitando o ensino e elevando os resultados.
          </p>

          <ul className={styles.benefitsList}>
            {benefitsList.map((item, index) => (
              <li key={index} className={styles.benefitItem}>
                <span className={styles.arrow}>→</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.peopleImageWrapper}>
        <img src={peopleImage} alt="People Image" className={styles.peopleImage} />
      </div>
    </section>
  );
};

export default BenefitsSection;
