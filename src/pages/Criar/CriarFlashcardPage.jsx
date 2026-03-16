import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './CriarFlashcardPage.module.css';

const MAX = 251;

const CriarFlashcardPage = () => {
  const { decks, createCard, updateCard } = useApp();
  const navigate = useNavigate();

  const [deckId, setDeckId] = useState(decks[0]?.id ?? null);
  const [frente, setFrente] = useState('');
  const [verso, setVerso] = useState('');
  const [side, setSide] = useState('frente'); // 'frente' | 'verso'
  const [flipState, setFlipState] = useState('idle'); // 'idle' | 'out' | 'in'
  const [savedCards, setSavedCards] = useState([]); // { id, deckId, frente, verso }
  const [editingIndex, setEditingIndex] = useState(null); // null = novo card
  const [justSaved, setJustSaved] = useState(false);

  const animateFlip = (callback) => {
    setFlipState('out');
    setTimeout(() => {
      callback();
      setFlipState('in');
      setTimeout(() => setFlipState('idle'), 220);
    }, 200);
  };

  const handleContinue = () => {
    if (!frente.trim()) return;
    animateFlip(() => setSide('verso'));
  };

  const handleFinalizar = async () => {
    if (!frente.trim() || !verso.trim() || !deckId) return;

    if (editingIndex !== null) {
      const card = savedCards[editingIndex];
      await updateCard(Number(deckId), card.id, frente.trim(), verso.trim());
      setSavedCards((prev) =>
        prev.map((c, i) =>
          i === editingIndex
            ? { ...c, deckId: Number(deckId), frente: frente.trim(), verso: verso.trim() }
            : c
        )
      );
      setEditingIndex(null);
    } else {
      const newId = await createCard(Number(deckId), frente.trim(), verso.trim());
      setSavedCards((prev) => [
        ...prev,
        { id: newId, deckId: Number(deckId), frente: frente.trim(), verso: verso.trim() },
      ]);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1600);
    }

    setFrente('');
    setVerso('');
    animateFlip(() => setSide('frente'));
  };

  const handleEditar = (index) => {
    const card = savedCards[index];
    setEditingIndex(index);
    setDeckId(card.deckId);
    setFrente(card.frente);
    setVerso(card.verso);
    animateFlip(() => setSide('frente'));
  };

  const handleCancelarEdicao = () => {
    setEditingIndex(null);
    setFrente('');
    setVerso('');
    animateFlip(() => setSide('frente'));
  };

  if (decks.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/app/criar')}>Voltar</button>
          <div className={styles.headerSpacer} />
        </header>
        <main className={styles.mainCenter}>
          <p className={styles.emptyMsg}>Você precisa criar um Deck antes de criar Flashcards.</p>
          <button className={styles.actionBtn} onClick={() => navigate('/criar/deck')}>
            Criar Deck
          </button>
        </main>
      </div>
    );
  }

  const isEditing = editingIndex !== null;
  const hasCards = savedCards.length > 0;

  const cardWrapperClass = [
    styles.cardWrapper,
    flipState === 'out' ? styles.cardFlipOut : '',
    flipState === 'in'  ? styles.cardFlipIn  : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/app/criar')}>
          Voltar
        </button>
        <div className={styles.steps}>
          <span className={styles.stepDone}>✓</span>
          <span className={styles.stepDivider}>—</span>
          <span className={styles.stepDone}>✓</span>
          <span className={styles.stepDivider}>—</span>
          <span className={styles.stepActive}>3</span>
        </div>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.layout}>

        {/* ── Área principal ── */}
        <main className={`${styles.main} ${hasCards && !isEditing ? styles.mainContinuous : ''}`}>
          <p className={styles.stepLabel}>Passo 3 de 3 · Flashcard</p>
          <h1 className={styles.title}>
            {isEditing
              ? `Editando Card #${editingIndex + 1}`
              : hasCards
                ? 'Adicionar mais cards'
                : 'Crie seu Flashcard'}
          </h1>

          <div className={styles.deckRow}>
            <label className={styles.deckLabel}>Deck:</label>
            <select
              className={styles.deckSelect}
              value={deckId}
              onChange={(e) => setDeckId(e.target.value)}
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>

          {justSaved && (
            <div className={styles.savedFlash}>
              <span className={styles.savedFlashIcon}>✓</span>
              Card salvo! Crie o próximo.
            </div>
          )}

          <div className={styles.divider} />

          <div className={cardWrapperClass}>
            {side === 'frente' ? (
              <div className={`${styles.cardFront} ${isEditing ? styles.cardFrontEditing : ''}`}>
                <span className={styles.cardLabel}>Frente</span>
                <textarea
                  className={`${styles.textarea} ${hasCards && !isEditing ? styles.textareaCompact : ''}`}
                  placeholder="Escreva o que deseja memorizar.."
                  maxLength={MAX}
                  value={frente}
                  onChange={(e) => setFrente(e.target.value)}
                  autoFocus
                />
                <span className={styles.counter}>{frente.length}/{MAX}</span>
              </div>
            ) : (
              <div className={styles.cardVerso}>
                <span className={styles.cardLabelVerso}>Verso</span>
                {frente && (
                  <p className={styles.frenteRef}>
                    {frente.length > 80 ? frente.slice(0, 80) + '…' : frente}
                  </p>
                )}
                <textarea
                  className={`${styles.textareaVerso} ${hasCards && !isEditing ? styles.textareaCompact : ''}`}
                  placeholder="Escreva a resposta.."
                  maxLength={MAX}
                  value={verso}
                  onChange={(e) => setVerso(e.target.value)}
                  autoFocus
                />
                <span className={styles.counterVerso}>{verso.length}/{MAX}</span>
              </div>
            )}
          </div>

          <div className={styles.divider} />

          <div className={styles.actions}>
            {isEditing && (
              <button className={styles.cancelBtn} onClick={handleCancelarEdicao}>
                Cancelar
              </button>
            )}
            {side === 'frente' ? (
              <button
                className={styles.continueBtn}
                onClick={handleContinue}
                disabled={!frente.trim()}
              >
                Continuar →
              </button>
            ) : (
              <button
                className={`${styles.finalizarBtn} ${isEditing ? styles.salvarBtn : ''}`}
                onClick={handleFinalizar}
                disabled={!verso.trim()}
              >
                {isEditing ? 'Salvar' : 'Finalizar'}
              </button>
            )}
          </div>
        </main>

        {/* ── Painel lateral ── */}
        <aside className={styles.sidepanel}>
          <div className={styles.sidepanelHeader}>
            <h3 className={styles.sidepanelTitle}>Cards criados</h3>
            <span className={styles.sidepanelCount}>{savedCards.length}</span>
          </div>

          {savedCards.length === 0 ? (
            <p className={styles.sidepanelEmpty}>
              Seus cards vão aparecer aqui após finalizar.
            </p>
          ) : (
            <div className={styles.cardList}>
              {savedCards.map((c, i) => (
                <div
                  key={c.id}
                  className={`${styles.savedCard} ${editingIndex === i ? styles.savedCardActive : ''}`}
                >
                  <div className={styles.savedCardTop}>
                    <span className={styles.savedNum}>{i + 1}</span>
                    <div className={styles.savedContent}>
                      <span className={styles.savedFrente}>
                        {c.frente.length > 40 ? c.frente.slice(0, 40) + '…' : c.frente}
                      </span>
                      <span className={styles.savedVerso}>
                        {c.verso.length > 40 ? c.verso.slice(0, 40) + '…' : c.verso}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`${styles.editBtn} ${editingIndex === i ? styles.editBtnActive : ''}`}
                    onClick={() => handleEditar(i)}
                  >
                    {editingIndex === i ? 'Editando...' : 'Editar'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {savedCards.length > 0 && (
            <div className={styles.sidepanelActions}>
              <button
                className={styles.memorizeBtn}
                onClick={() => navigate(`/memorizar/${deckId}`)}
              >
                Ir para memorização →
              </button>
              <button className={styles.concluirBtn} onClick={() => navigate('/app')}>
                Ir para início
              </button>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};

export default CriarFlashcardPage;
