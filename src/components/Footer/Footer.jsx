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
          <a href="#contato" className={styles.link}>Contato</a>
          <a href="#quem-somos" className={styles.link}>Quem somos</a>
          <a href="#entrar" className={styles.link}>Entrar</a>
        </div>
      </div>

    </div>
  </footer>
);

export default Footer;
