import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './CriarLearnDeckPage.module.css';

const MAX = 50;

const CriarLearnDeckPage = () => {
  const { mainDecks, createMainDeck } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');

  const isFirstTime = mainDecks.length === 0;

  const handleSubmit = async () => {
    if (!nome.trim()) return;
    await createMainDeck(nome.trim());
    if (isFirstTime) {
      navigate('/criar/deck');
    } else {
      navigate('/app/criar');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(isFirstTime ? '/app' : '/app/criar')}>
          Voltar
        </button>
        <div className={styles.steps}>
          <span className={styles.stepActive}>1</span>
          <span className={styles.stepDivider}>—</span>
          <span className={styles.stepInactive}>2</span>
          <span className={styles.stepDivider}>—</span>
          <span className={styles.stepInactive}>3</span>
        </div>
        <div className={styles.headerSpacer} />
      </header>

      <main className={styles.main}>
        <p className={styles.stepLabel}>Passo 1 de 3 · LearnDeck</p>
        <h1 className={styles.title}>{isFirstTime ? 'Crie seu primeiro LearnDeck' : 'Crie seu LearnDeck'}</h1>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Nome do LearnDeck</h2>
          <p className={styles.formSubtitle}>
            {isFirstTime
              ? 'O LearnDeck é a pasta principal que organiza seus decks de estudo.'
              : 'Seu LearnDeck é onde comporta seus decks'}
          </p>

          <div className={styles.inputWrapper}>
            <textarea
              className={styles.textarea}
              placeholder="Ex: Matemática.."
              maxLength={MAX}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <span className={styles.counter}>{nome.length}/{MAX}</span>
          </div>
        </div>

        <button
          className={styles.continueBtn}
          onClick={handleSubmit}
          disabled={!nome.trim()}
        >
          {isFirstTime ? 'Continuar →' : 'Continuar'}
        </button>

        {isFirstTime && (
          <p className={styles.stepHint}>Próximo: criar um Deck dentro do seu LearnDeck</p>
        )}
      </main>
    </div>
  );
};

export default CriarLearnDeckPage;
