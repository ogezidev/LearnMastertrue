import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './ConclusaoPage.module.css';

const RAIO = 80;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

const NIVEIS = [
  { key: 'dificil', label: 'Difícil', style: styles.statDificil },
  { key: 'bom',     label: 'Bom',     style: styles.statBom },
  { key: 'facil',   label: 'Fácil',   style: styles.statFacil },
];

const mensagem = (avaliados, contagem) => {
  if (avaliados === 0) {
    return { emoji: '👀', desc: 'Você passou pelos cards sem avaliar. Avalie na próxima sessão para acompanhar sua evolução.' };
  }
  const pctFacil = contagem.facil / avaliados;
  const pctDificil = contagem.dificil / avaliados;
  if (pctFacil >= 0.7) return { emoji: '🏆', desc: 'Você está dominando este deck. Continue assim!' };
  if (pctDificil >= 0.5) return { emoji: '💪', desc: 'Alguns cards ainda estão difíceis. Estudar de novo ajuda a fixar.' };
  return { emoji: '🚀', desc: 'Bom progresso! Cada sessão deixa a memória mais firme.' };
};

const ConclusaoPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  // O resultado vem da tela de estudo; ao recarregar a página ele não existe mais
  const sessao = state?.sessao ?? null;
  const total = state?.total ?? 0;
  const niveisDados = sessao ? Object.values(sessao) : [];
  const avaliados = niveisDados.length;
  const contagem = {
    dificil: niveisDados.filter((n) => n === 'dificil').length,
    bom: niveisDados.filter((n) => n === 'bom').length,
    facil: niveisDados.filter((n) => n === 'facil').length,
  };
  const pct = total > 0 ? Math.round((avaliados / total) * 100) : 0;
  const msg = mensagem(avaliados, contagem);

  // Anel e contador animados até a porcentagem de cards avaliados
  const [animar, setAnimar] = useState(false);
  const [contador, setContador] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimar(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!animar) return undefined;
    let inicio = null;
    let quadro;
    const passo = (agora) => {
      if (!inicio) inicio = agora;
      const p = Math.min((agora - inicio) / 1000, 1);
      setContador(Math.round((1 - Math.pow(1 - p, 3)) * avaliados));
      if (p < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [animar, avaliados]);

  const acoes = (
    <div className={styles.actions}>
      <button className={styles.btnPrimary} onClick={() => navigate(`/memorizar/${deckId}/estudar`)}>
        Estudar novamente
      </button>
      <button className={styles.btnSecondary} onClick={() => navigate(`/criar/flashcard?deck=${deckId}`)}>
        Criar mais cards
      </button>
      <button className={styles.btnGhost} onClick={() => navigate('/app')}>
        Voltar ao início
      </button>
    </div>
  );

  if (!sessao) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.emoji} aria-hidden="true">✅</span>
            <h1 className={styles.title}>Sessão encerrada</h1>
            <p className={styles.desc}>
              O resumo desta sessão não está mais disponível, mas suas avaliações já foram salvas.
            </p>
          </div>
          {acoes}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <span className={styles.emoji} aria-hidden="true">{msg.emoji}</span>
          <h1 className={styles.title}>Sessão concluída!</h1>
          <p className={styles.deckLabel}>{state.deckNome}</p>
        </div>

        {/* ── Cards avaliados ── */}
        <div className={styles.ringWrap}>
          <svg className={styles.ring} viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r={RAIO} className={styles.ringTrack} />
            <circle
              cx="100" cy="100" r={RAIO}
              className={styles.ringArc}
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={animar ? CIRCUNFERENCIA * (1 - pct / 100) : CIRCUNFERENCIA}
            />
          </svg>
          <div className={styles.ringInner}>
            <span className={styles.ringCount}>{contador}</span>
            <span className={styles.ringText}>de {total} {total === 1 ? 'card avaliado' : 'cards avaliados'}</span>
          </div>
        </div>
        <p className={styles.srOnly}>
          {avaliados} de {total} cards avaliados: {contagem.dificil} difícil, {contagem.bom} bom, {contagem.facil} fácil.
        </p>

        {/* ── Contagem por avaliação ── */}
        <div className={styles.stats}>
          {NIVEIS.map(({ key, label, style }) => (
            <div key={key} className={`${styles.stat} ${style}`}>
              <span className={styles.statNum}>{contagem[key]}</span>
              <span className={styles.statName}>{label}</span>
            </div>
          ))}
        </div>

        <p className={styles.desc}>{msg.desc}</p>

        {acoes}
      </div>
    </div>
  );
};

export default ConclusaoPage;
