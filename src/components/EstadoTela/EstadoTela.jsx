import styles from './EstadoTela.module.css';

// Estados de tela que dependem do banco: carregando e erro (com "Tentar novamente")
export const Carregando = ({ texto = 'Carregando...' }) => (
  <div className={styles.estado} role="status" aria-live="polite">
    <span className={styles.spinner} aria-hidden="true" />
    <p className={styles.texto}>{texto}</p>
  </div>
);

export const ErroCarregar = ({ mensagem, onTentar }) => (
  <div className={styles.estado} role="alert">
    <p className={styles.texto}>{mensagem || 'Não foi possível carregar seus dados.'}</p>
    {onTentar && (
      <button type="button" className={styles.botao} onClick={onTentar}>
        Tentar novamente
      </button>
    )}
  </div>
);

// Mensagem de erro em linha, embaixo de um formulário
export const MensagemErro = ({ children }) =>
  children ? <p className={styles.erroLinha} role="alert">{children}</p> : null;
