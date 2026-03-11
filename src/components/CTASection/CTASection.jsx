import { Link } from 'react-router-dom';
import styles from './CTASection.module.css';
import imgMascotes from '@/assets/images/MascotesEscola.png';

const CTASection = () => (
  <section className={styles.section}>
    <h2 className={styles.title}>Juntos, pelo futuro da memorização.</h2>

    <Link to="/cadastro" className={styles.button}>
      Seja Learnmaster!
    </Link>

    <div className={styles.imageWrapper}>
      <img src={imgMascotes} alt="Mascotes LearnMaster" className={styles.image} />
    </div>
  </section>
);

export default CTASection;
