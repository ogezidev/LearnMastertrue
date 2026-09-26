import { useNavigate } from 'react-router-dom';
import Icone from '@/components/Icone/Icone';
import styles from './Criacao.module.css';

const ETAPAS = ['LearnDeck', 'Deck', 'Cards'];

// Topo das telas de criação: voltar + em qual dos 3 passos a pessoa está
const Passos = ({ atual, voltarPara = '/app/criar' }) => {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      <button type="button" className={styles.voltar} onClick={() => navigate(voltarPara)}>
        <Icone nome="voltar" tamanho={18} /> Voltar
      </button>
      <ol className={styles.passos} aria-label={`Passo ${atual} de 3`}>
        {ETAPAS.map((nome, i) => {
          const n = i + 1;
          const classe = n === atual ? styles.passoAtual : n < atual ? styles.passoFeito : '';
          return (
            <li key={nome} className={`${styles.passo} ${classe}`} aria-current={n === atual ? 'step' : undefined}>
              <span className={styles.passoNum}>{n < atual ? <Icone nome="check" tamanho={13} /> : n}</span>
              <span>{nome}</span>
            </li>
          );
        })}
      </ol>
      <span />
    </header>
  );
};

export default Passos;
