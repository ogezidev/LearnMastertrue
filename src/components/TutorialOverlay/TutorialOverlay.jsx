import { useEffect, useRef, useState } from 'react';
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
      'Depois de revelar o verso, avalie cada card como Difícil, Bom ou Fácil. Assim você sabe o que precisa revisar mais.',
  },
  {
    emoji: '🚀',
    bg: 'linear-gradient(135deg, #368BFF 0%, #1d6fed 100%)',
    title: 'Pronto para começar!',
    description:
      'Comece criando seu primeiro LearnDeck. Você pode rever tudo isso quando quiser na tela inicial.',
  },
];

// Aparece até o usuário concluir ou pular; a conclusão fica salva no banco (não volta a aparecer)
const TutorialOverlay = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const modalRef = useRef(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Foco no botão principal a cada passo; Esc pula; setas navegam
  useEffect(() => {
    modalRef.current?.querySelector('[data-principal]')?.focus();
  }, [step]);

  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === 'Escape') onDone();
      else if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, STEPS.length - 1));
      else if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0));
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onDone]);

  return (
    <div className={styles.overlay}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-titulo"
        aria-describedby="tutorial-descricao"
      >

        {/* Colored icon header */}
        <div key={`icon-${step}`} className={styles.iconWrap} style={{ background: current.bg }} aria-hidden="true">
          <span className={styles.emoji}>{current.emoji}</span>
          <div className={styles.iconGlow} />
        </div>

        {/* Step content — key forces re-animation on step change */}
        <div key={`content-${step}`} className={styles.stepContent}>
          <div className={styles.content}>
            <p className={styles.passo}>Passo {step + 1} de {STEPS.length}</p>
            <h2 id="tutorial-titulo" className={styles.title}>{current.title}</h2>
            <p id="tutorial-descricao" className={styles.description}>{current.description}</p>
          </div>

          {/* Dots */}
          <div className={styles.dots}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
                onClick={() => setStep(i)}
                style={i === step ? { background: current.bg } : {}}
                aria-label={`Ir para o passo ${i + 1}`}
                aria-current={i === step ? 'step' : undefined}
              />
            ))}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {!isLast && (
              <button className={styles.skipBtn} onClick={onDone}>
                Pular tour
              </button>
            )}

            <div className={styles.navBtns}>
              {step > 0 && (
                <button className={styles.prevBtn} onClick={() => setStep(s => s - 1)}>
                  ← Anterior
                </button>
              )}
              <button
                data-principal
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
