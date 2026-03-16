import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '@/assets/images/LearnMasterBranca.png';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" aria-label="Voltar para a página inicial">
            <img src={logo} alt="LearnMaster" />
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link to="/contato" className={styles.navLink}>contato</Link>
          <Link to="/quem-somos" className={styles.navLink}>quem somos</Link>
          <Link to="/entrar" className={styles.btnEntrar}>Entrar</Link>

        </nav>
      </div>
    </header>
  );
};

export default Header;
