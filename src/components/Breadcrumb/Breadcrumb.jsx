import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

// Mostra em que nível da hierarquia o usuário está: "Matemática › Trigonometria"
// itens: [{ label, to? }] — o último é a página atual (sem link)
const Breadcrumb = ({ itens, className = '' }) => (
  <nav aria-label="Você está em" className={`${styles.breadcrumb} ${className}`}>
    <ol className={styles.lista}>
      {itens.map((item, i) => {
        const ultimo = i === itens.length - 1;
        return (
          <li key={`${item.label}-${i}`} className={styles.item}>
            {item.to && !ultimo
              ? <Link to={item.to} className={styles.link}>{item.label}</Link>
              : <span className={ultimo ? styles.atual : styles.texto} aria-current={ultimo ? 'page' : undefined}>{item.label}</span>}
            {!ultimo && <span className={styles.separador} aria-hidden="true">›</span>}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumb;
