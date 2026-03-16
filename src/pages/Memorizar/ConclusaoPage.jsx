import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './ConclusaoPage.module.css';

const RADIUS       = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PARTICLES = [
  { top: '7%',  left: '10%', color: '#60a5fa', size: 10, delay: '0.2s', dur: '3.2s' },
  { top: '12%', left: '80%', color: '#34d399', size: 7,  delay: '0.6s', dur: '2.8s' },
  { top: '38%', left: '93%', color: '#f59e0b', size: 9,  delay: '0.9s', dur: '3.5s' },
  { top: '68%', left: '88%', color: '#a78bfa', size: 8,  delay: '0.3s', dur: '2.6s' },
  { top: '84%', left: '70%', color: '#60a5fa', size: 6,  delay: '1.0s', dur: '3.0s' },
  { top: '80%', left: '7%',  color: '#34d399', size: 11, delay: '0.7s', dur: '2.9s' },
  { top: '46%', left: '3%',  color: '#f87171', size: 7,  delay: '0.4s', dur: '3.3s' },
  { top: '22%', left: '46%', color: '#fbbf24', size: 5,  delay: '1.1s', dur: '2.7s' },
  { top: '91%', left: '33%', color: '#a78bfa', size: 9,  delay: '0.8s', dur: '3.1s' },
  { top: '55%', left: '96%', color: '#f472b6', size: 6,  delay: '0.5s', dur: '2.5s' },
];

const ConclusaoPage = () => {
  const { deckId } = useParams();
  const navigate   = useNavigate();
  const { state }  = useLocation();

  const { deckNome = 'Deck', total = 0, ratings = {} } = state ?? {};

  const lembro      = Object.values(ratings).filter(r => r === 'lembro').length;
  const lembroPouco = Object.values(ratings).filter(r => r === 'lembro-pouco').length;
  const esqueci     = Object.values(ratings).filter(r => r === 'esqueci').length;

  const pctLembro = total > 0 ? Math.round((lembro / total) * 100) : 0;

  const getMsg = () => {
    if (pctLembro >= 80) return {
      emoji: '🔥',
      title: 'Impressionante!',
      desc: 'Você está dominando esse deck. A consistência é seu superpoder!',
    };
    if (pctLembro >= 50) return {
      emoji: '💪',
      title: 'Bom progresso!',
      desc: 'Você está evoluindo. Mais uma sessão e você vai dominar tudo!',
    };
    return {
      emoji: '🚀',
      title: 'Continue praticando!',
      desc: 'Cada sessão conta. Você já está mais perto do que imagina!',
    };
  };

  const msg = getMsg();

  // Ring e contador
  const [ringFilled, setRingFilled] = useState(false);
  const [count,      setCount]      = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setRingFilled(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ringFilled) return;
    let startTime = null;
    const duration = 1300;
    const tick = (now) => {
      if (!startTime) startTime = now;
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * 100));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [ringFilled]);

  const dashOffset = ringFilled ? 0 : CIRCUMFERENCE;

  return (
    <div className={styles.page}>

      {/* Partículas decorativas */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={styles.particle}
          style={{
            top: p.top, left: p.left,
            width: p.size, height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}

      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <span className={styles.emoji}>{msg.emoji}</span>
          <h1 className={styles.title}>{msg.title}</h1>
          <p className={styles.deckLabel}>{deckNome}</p>
        </div>

        {/* ── Ring de progresso ── */}
        <div className={styles.ringWrap}>
          <svg className={styles.ring} viewBox="0 0 200 200">
            <defs>
              <linearGradient id="conclusaoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#10b981" />
                <stop offset="100%" stopColor="#368BFF" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r={RADIUS} className={styles.ringTrack} />
            <circle
              cx="100" cy="100" r={RADIUS}
              className={styles.ringArc}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className={styles.ringInner}>
            <span className={styles.ringCount}>{count}%</span>
            <span className={styles.ringText}>concluído</span>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={styles.stats}>
          <div className={`${styles.stat} ${styles.statGreen}`}>
            <span className={styles.statNum}>{lembro}</span>
            <span className={styles.statName}>Lembro</span>
          </div>
          <div className={`${styles.stat} ${styles.statBlue}`}>
            <span className={styles.statNum}>{lembroPouco}</span>
            <span className={styles.statName}>Lembro pouco</span>
          </div>
          <div className={`${styles.stat} ${styles.statRed}`}>
            <span className={styles.statNum}>{esqueci}</span>
            <span className={styles.statName}>Não lembro</span>
          </div>
        </div>

        <p className={styles.desc}>{msg.desc}</p>

        {/* ── Ações ── */}
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() => navigate(`/memorizar/${deckId}`)}
          >
            Estudar novamente
          </button>
          <button
            className={styles.btnSecondary}
            onClick={() => navigate('/criar/flashcard')}
          >
            Criar mais cards
          </button>
          <button
            className={styles.btnGhost}
            onClick={() => navigate('/app')}
          >
            Ir para início
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConclusaoPage;
