import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './CriarDeckPage.module.css';

const MAX = 50;

const CriarDeckPage = () => {
  const { mainDecks, decks, createDeck } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [mainDeckId, setMainDeckId] = useState(mainDecks[0]?.id ?? '');
  const [savedDecks, setSavedDecks] = useState([]);
  const textareaRef = useRef(null);

  const handleSubmit = async () => {
    if (!nome.trim() || !mainDeckId) return;
    const newDeck = await createDeck(nome.trim(), Number(mainDeckId));
    setSavedDecks(prev => [...prev, { id: newDeck.id, nome: nome.trim(), mainDeckId: Number(mainDeckId) }]);
    setNome('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleConcluir = () => {
    if (decks.length === savedDecks.length && savedDecks.length > 0) {
      navigate('/criar/flashcard');
    } else {
      navigate('/app/criar');
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

  const firstTimeFlow = decks.length === 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => savedDecks.length > 0 ? handleConcluir() : navigate(firstTimeFlow ? '/criar/learndeck' : '/app/criar')}>
          {savedDecks.length > 0 ? 'Concluir' : 'Voltar'}
        </button>
        <div className={styles.steps}>
          <span className={styles.stepDone}>✓</span>
          <span className={styles.stepDivider}>—</span>
          <span className={styles.stepActive}>2</span>
          <span className={styles.stepDivider}>—</span>
          <span className={styles.stepInactive}>3</span>
        </div>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <p className={styles.stepLabel}>Passo 2 de 3 · Deck</p>
          <h1 className={styles.title}>{firstTimeFlow ? 'Crie seu primeiro Deck' : 'Crie seu Deck'}</h1>

          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Nome do Deck</h2>
            <p className={styles.formSubtitle}>
              {firstTimeFlow
                ? 'O Deck é a pasta que contém seus flashcards de estudo.'
                : 'Seu Deck é onde comporta seus flashcards'}
            </p>

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
                ref={textareaRef}
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
            {savedDecks.length === 0 ? (firstTimeFlow ? 'Criar Deck →' : 'Criar') : '+ Criar mais um Deck'}
          </button>

          {firstTimeFlow && savedDecks.length === 0 && (
            <p className={styles.stepHint}>Próximo: criar flashcards dentro do seu Deck</p>
          )}
        </main>

        {/* Painel lateral de decks criados */}
        <aside className={styles.sidepanel}>
          <div className={styles.sidepanelHeader}>
            <h3 className={styles.sidepanelTitle}>
              Decks criados
              <span className={styles.sidepanelCount}>{savedDecks.length}</span>
            </h3>
            <button
              className={styles.addDeckBtn}
              onClick={() => textareaRef.current?.focus()}
              title="Criar novo deck"
            >+</button>
          </div>

          {savedDecks.length === 0 ? (
            <p className={styles.sidepanelEmpty}>
              Seus decks vão aparecer aqui após criar.
            </p>
          ) : (
            <div className={styles.deckList}>
              {savedDecks.map((d, i) => {
                const parentName = mainDecks.find(m => m.id === d.mainDeckId)?.nome ?? '';
                return (
                  <div key={d.id} className={styles.savedDeck}>
                    <span className={styles.savedNum}>{i + 1}</span>
                    <div className={styles.savedContent}>
                      <span className={styles.savedNome}>{d.nome}</span>
                      <span className={styles.savedParent}>{parentName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {savedDecks.length > 0 && (
            <div className={styles.sidepanelActions}>
              <button className={styles.concluirBtn} onClick={handleConcluir}>
                {firstTimeFlow ? 'Continuar →' : 'Concluir'}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CriarDeckPage;
