import { Link } from 'react-router-dom';
import styles from './HeroSection.module.css';
import cardImage from '@/assets/images/CardImagemCriancaAprenda.png';

const HeroSection = () => {
  return (
    <section className={styles.heroWrapper}>
      <div className={styles.heroContainer}>
        <div className={styles.textCol}>
          <h1 className={styles.title}>
            Crie de forma
            <br />
            fácil e rápida
          </h1>
          <p className={styles.subtitle}>
            Transforme seus estudos em algo fácil, inteligente e feito para você com
            LearnMaster.
          </p>
          <Link to="/cadastro" className={styles.ctaButton}>
            Comece hoje mesmo na LearnMaster
          </Link>
        </div>

        <div className={styles.imageCol}>
          <img
            src={cardImage}
            alt="Card Image"
            className={styles.heroImage}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
