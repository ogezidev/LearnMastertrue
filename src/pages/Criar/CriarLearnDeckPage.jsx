import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './CriarLearnDeckPage.module.css';

const MAX = 50;

const CriarLearnDeckPage = () => {
  const { createMainDeck } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');

  const handleSubmit = () => {
    if (!nome.trim()) return;
    createMainDeck(nome.trim());
    navigate('/app/criar');
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
        <button className={styles.backBtn} onClick={() => navigate('/app/criar')}>
          Voltar
        </button>
        <div className={styles.headerSpacer} />
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Crie seu LearnDeck</h1>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Nome do LearnDeck</h2>
          <p className={styles.formSubtitle}>Seu LearnDeck é onde comporta seus decks</p>

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
          Continuar
        </button>
      </main>
    </div>
  );
};

export default CriarLearnDeckPage;
