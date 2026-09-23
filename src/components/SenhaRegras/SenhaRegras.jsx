import { SENHA_REGRAS } from '@/utils/senha';
import styles from './SenhaRegras.module.css';

// Lista das regras de senha, marcando em tempo real as que já foram atendidas
const SenhaRegras = ({ senha }) => (
  <ul className={styles.regras} aria-label="Regras da senha">
    {SENHA_REGRAS.map((regra) => {
      const ok = regra.test(senha);
      return (
        <li key={regra.id} className={ok ? styles.ok : styles.pendente}>
          {ok ? '✓' : '✗'} {regra.label}
        </li>
      );
    })}
  </ul>
);

export default SenhaRegras;
