import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './CriarDeckPage.module.css';

const MAX = 50;

const CriarDeckPage = () => {
  const { mainDecks, createDeck } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [mainDeckId, setMainDeckId] = useState(mainDecks[0]?.id ?? '');

  const handleSubmit = () => {
    if (!nome.trim() || !mainDeckId) return;
    createDeck(nome.trim(), Number(mainDeckId));
    navigate('/app/criar');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (mainDecks.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/app/criar')}>Voltar</button>
          <div className={styles.headerSpacer} />
        </header>
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <p className={styles.emptyMsg}>Você precisa criar um LearnDeck antes de criar um Deck.</p>
            <button className={styles.continueBtn} onClick={() => navigate('/criar/learndeck')}>
              Criar LearnDeck
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/app/criar')}>
          Voltar
        </button>
        <div className={styles.headerSpacer} />
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Crie seu Deck</h1>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Nome do Deck</h2>
          <p className={styles.formSubtitle}>Seu Deck é onde comporta seus flashcards</p>

          <div className={styles.selectWrapper}>
            <label className={styles.selectLabel}>LearnDeck</label>
            <select
              className={styles.select}
              value={mainDeckId}
              onChange={(e) => setMainDeckId(e.target.value)}
            >
              {mainDecks.map((md) => (
                <option key={md.id} value={md.id}>{md.nome}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputWrapper}>
            <textarea
              className={styles.textarea}
              placeholder="Ex: Trigonometria.."
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

export default CriarDeckPage;
