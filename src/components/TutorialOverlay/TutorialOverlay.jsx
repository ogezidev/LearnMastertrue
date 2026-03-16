import { useState } from 'react';
import styles from './TutorialOverlay.module.css';

const STEPS = [
  {
    emoji: '👋',
    bg: 'linear-gradient(135deg, #368BFF 0%, #1d6fed 100%)',
    title: 'Bem-vindo ao LearnMaster!',
    description:
      'Aprenda qualquer coisa com flashcards e memorização ativa. Deixa eu te mostrar como tudo funciona por aqui.',
  },
  {
    emoji: '🗂',
    bg: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    title: 'Como funciona?',
    description:
      'Tudo começa com um LearnDeck (pasta principal), que organiza seus Decks, que por sua vez contêm seus Flashcards.',
  },
  {
    emoji: '🧠',
    bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    title: 'Memorize seus cards',
    description:
      'Clique em "Memorizar" na tela inicial para iniciar uma sessão. Os cards aparecem um por um para você praticar.',
  },
  {
    emoji: '⭐',
    bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    title: 'Avalie sua memória',
    description:
      'Durante o estudo, avalie cada card como Fácil, Bom ou Difícil. Isso te ajuda a focar no que precisa revisar mais.',
  },
  {
    emoji: '🚀',
    bg: 'linear-gradient(135deg, #368BFF 0%, #1d6fed 100%)',
    title: 'Pronto para começar!',
    description:
      'Comece criando seu primeiro LearnDeck. Use o LearnMaster todo dia e veja seu conhecimento crescer!',
  },
];

const TutorialOverlay = ({ onDone }) => {
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        {/* Colored icon header */}
        <div key={`icon-${step}`} className={styles.iconWrap} style={{ background: current.bg }}>
          <span className={styles.emoji}>{current.emoji}</span>
          <div className={styles.iconGlow} />
        </div>

        {/* Step content — key forces re-animation on step change */}
        <div key={`content-${step}`} className={styles.stepContent}>
          <div className={styles.content}>
            <h2 className={styles.title}>{current.title}</h2>
            <p className={styles.description}>{current.description}</p>
          </div>

          {/* Dots */}
          <div className={styles.dots}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
                onClick={() => setStep(i)}
                style={i === step ? { background: current.bg } : {}}
                aria-label={`Passo ${i + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.skipBtn} onClick={onDone}>
              {isLast ? '' : 'Pular tour'}
            </button>

            <div className={styles.navBtns}>
              {step > 0 && (
                <button className={styles.prevBtn} onClick={() => setStep(s => s - 1)}>
                  ← Anterior
                </button>
              )}
              <button
                className={styles.nextBtn}
                style={{ background: current.bg }}
                onClick={() => (isLast ? onDone() : setStep(s => s + 1))}
              >
                {isLast ? 'Começar!' : 'Próximo →'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TutorialOverlay;
