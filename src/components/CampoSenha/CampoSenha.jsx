import { useState } from 'react';
import Icone from '@/components/Icone/Icone';
import styles from './CampoSenha.module.css';

// Campo de senha com botão para mostrar/ocultar; repassa as demais props ao <input>
const CampoSenha = ({ className = '', ...props }) => {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className={styles.grupo}>
      <input {...props} type={visivel ? 'text' : 'password'} className={`${className} ${styles.campo}`} />
      <button
        type="button"
        className={styles.olho}
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visivel}
        title={visivel ? 'Ocultar senha' : 'Mostrar senha'}
      >
        <Icone nome={visivel ? 'olhoFechado' : 'olho'} tamanho={20} />
      </button>
    </div>
  );
};

export default CampoSenha;
