import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import logo from '@/assets/images/LearnMasterAzul.png';

const Footer = () => (
  <footer className={styles.wrapper}>
    <div className={styles.container}>

      {/* Topo */}
      <div className={styles.top}>
        <img src={logo} alt="LearnMaster" className={styles.logo} />
      </div>

      <div className={styles.divider} />

      {/* Base */}
      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} LearnMaster. Todos os direitos reservados.
        </p>
        <div className={styles.links}>
          <Link to="/contato" className={styles.link}>Contato</Link>
          <Link to="/quem-somos" className={styles.link}>Quem somos</Link>
          <Link to="/entrar" className={styles.link}>Entrar</Link>
        </div>
      </div>

    </div>
  </footer>
);

export default Footer;
