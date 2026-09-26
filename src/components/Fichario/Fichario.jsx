import Icone from '@/components/Icone/Icone';
import styles from './Fichario.module.css';

/*
 * LearnDeck desenhado como uma pilha de fichas: faixa na cor do assunto com o ícone,
 * nome, informação curta, etiquetas (decks) e barra de progresso opcionais.
 * Só visual: quem usa decide se ele é clicável.
 */
const Fichario = ({ nome, visual, meta, etiquetas = [], progresso = null, vazio, compacto, className = '' }) => {
  const extras = etiquetas.length - 3;
  return (
    <div
      className={`${styles.fichario} ${compacto ? styles.compacto : ''} ${className}`}
      style={{ '--cor': visual.cor, '--suave': visual.suave, '--escuro': visual.escuro }}
    >
      <span className={`${styles.ficha} ${styles.fundo2}`} aria-hidden="true" />
      <span className={`${styles.ficha} ${styles.fundo1}`} aria-hidden="true" />
      <div className={`${styles.ficha} ${styles.frente}`}>
        <div className={styles.faixa}>
          <span className={styles.icone}>
            <Icone nome={visual.icone} tamanho={compacto ? 20 : 24} />
          </span>
        </div>
        <div className={styles.corpo}>
          <p className={`${styles.nome} ${vazio ? styles.nomeVazio : ''}`}>{nome}</p>
          {meta && <p className={styles.meta}>{meta}</p>}
          {etiquetas.length > 0 && (
            <div className={styles.etiquetas}>
              {etiquetas.slice(0, 3).map((e) => (
                <span key={e.chave ?? e.texto} className={`${styles.etiqueta} ${e.nova ? styles.etiquetaNova : ''}`}>{e.texto}</span>
              ))}
              {extras > 0 && <span className={`${styles.etiqueta} ${styles.etiquetaMais}`}>+{extras}</span>}
            </div>
          )}
          {progresso !== null && (
            <div className={styles.progresso}>
              <span className={styles.barra}><span style={{ width: `${Math.round(progresso * 100)}%` }} /></span>
              <span className={styles.pct}>{Math.round(progresso * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fichario;
