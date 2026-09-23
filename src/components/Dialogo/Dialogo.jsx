import { useEffect, useRef } from 'react';
import styles from './Dialogo.module.css';

/*
 * Janela modal para "Deseja prosseguir?" e confirmações de exclusão.
 * acoes: [{ label, onClick, variante: 'primario' | 'secundario' | 'perigo' | 'texto', disabled }]
 */
const Dialogo = ({ titulo, children, acoes, onFechar, icone }) => {
  const caixaRef = useRef(null);
  const onFecharRef = useRef(onFechar);
  onFecharRef.current = onFechar;

  // Esc fecha; o foco vai para o primeiro botão só quando a janela abre
  useEffect(() => {
    caixaRef.current?.querySelector('button')?.focus();
    const aoTeclar = (e) => {
      if (e.key === 'Escape') onFecharRef.current?.();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div
        ref={caixaRef}
        className={styles.caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        {icone && <div className={styles.icone} aria-hidden="true">{icone}</div>}
        <h2 id="dialogo-titulo" className={styles.titulo}>{titulo}</h2>
        {children && <div className={styles.corpo}>{children}</div>}
        <div className={styles.acoes}>
          {acoes.map((acao) => (
            <button
              key={acao.label}
              type="button"
              className={`${styles.botao} ${styles[acao.variante ?? 'secundario']}`}
              onClick={acao.onClick}
              disabled={acao.disabled}
            >
              {acao.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dialogo;
