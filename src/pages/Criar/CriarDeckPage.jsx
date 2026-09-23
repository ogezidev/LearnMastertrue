import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Dialogo from '@/components/Dialogo/Dialogo';
import { Carregando, ErroCarregar, MensagemErro } from '@/components/EstadoTela/EstadoTela';
import styles from './CriarDeckPage.module.css';

const MAX = 50;

const CriarDeckPage = () => {
  const { mainDecks, createDeck, dadosCarregados, erroDados, recarregarDados } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const learnDeckDaUrl = Number(params.get('learndeck')) || null;

  const [nome, setNome] = useState('');
  const [mainDeckId, setMainDeckId] = useState(learnDeckDaUrl);
  const [savedDecks, setSavedDecks] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [criado, setCriado] = useState(null);
  const textareaRef = useRef(null);

  // Os LearnDecks chegam do servidor depois da primeira renderização (ex.: ao recarregar a página):
  // só então dá para escolher o padrão
  useEffect(() => {
    if (!dadosCarregados || mainDecks.length === 0) return;
    if (!mainDecks.some((md) => md.id === mainDeckId)) {
      const daUrl = mainDecks.find((md) => md.id === learnDeckDaUrl);
      setMainDeckId((daUrl ?? mainDecks[0]).id);
    }
  }, [dadosCarregados, mainDecks, mainDeckId, learnDeckDaUrl]);

  const learnDeckAtual = mainDecks.find((md) => md.id === mainDeckId);

  const handleSubmit = async () => {
    const valor = nome.trim();
    if (!valor || !mainDeckId || salvando) return;
    setErro('');
    setSalvando(true);
    try {
      const novo = await createDeck(valor, mainDeckId);
      setSavedDecks((prev) => [...prev, { id: novo.id, nome: novo.nome, mainDeckId }]);
      setCriado(novo);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const criarOutro = () => {
    setCriado(null);
    setNome('');
    textareaRef.current?.focus();
  };

  const header = (
    <header className={styles.header}>
      <button className={styles.backBtn} onClick={() => navigate('/app/criar')}>Voltar</button>
      <div className={styles.steps} aria-hidden="true">
        <span className={styles.stepDone}>✓</span>
        <span className={styles.stepDivider}>—</span>
        <span className={styles.stepActive}>2</span>
        <span className={styles.stepDivider}>—</span>
        <span className={styles.stepInactive}>3</span>
      </div>
      <div className={styles.headerSpacer} />
    </header>
  );

  if (!dadosCarregados) {
    return (
      <div className={styles.page}>
        {header}
        {erroDados
          ? <ErroCarregar mensagem={erroDados} onTentar={recarregarDados} />
          : <Carregando texto="Carregando seus LearnDecks..." />}
      </div>
    );
  }

  if (mainDecks.length === 0) {
    return (
      <div className={styles.page}>
        {header}
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
      {header}

      <div className={styles.layout}>
        <main className={styles.main}>
          <Breadcrumb
            className={styles.breadcrumb}
            itens={[
              { label: 'Criar', to: '/app/criar' },
              { label: learnDeckAtual?.nome ?? 'LearnDeck' },
              { label: 'Novo deck' },
            ]}
          />
          <p className={styles.stepLabel}>Passo 2 de 3 · Deck</p>
          <h1 className={styles.title}>Crie seu Deck</h1>

          <div className={styles.formCard}>
            <label className={styles.formTitle} htmlFor="nome-deck">Nome do Deck</label>
            <p className={styles.formSubtitle}>
              O Deck fica dentro de um LearnDeck e guarda seus flashcards. Ex.: Trigonometria.
            </p>

            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel} htmlFor="learndeck-pai">LearnDeck</label>
              <select
                id="learndeck-pai"
                className={styles.select}
                value={mainDeckId ?? ''}
                onChange={(e) => setMainDeckId(Number(e.target.value))}
              >
                {mainDecks.map((md) => (
                  <option key={md.id} value={md.id}>{md.nome}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputWrapper}>
              <textarea
                id="nome-deck"
                className={styles.textarea}
                placeholder="Ex: Trigonometria.."
                maxLength={MAX}
                value={nome}
                onChange={(e) => { setNome(e.target.value.replace(/\n/g, '').slice(0, MAX)); setErro(''); }}
                onKeyDown={handleKeyDown}
                ref={textareaRef}
                autoFocus
              />
              <span className={styles.counter}>{nome.length}/{MAX}</span>
            </div>
          </div>

          <MensagemErro>{erro}</MensagemErro>

          <button
            className={styles.continueBtn}
            onClick={handleSubmit}
            disabled={!nome.trim() || !mainDeckId || salvando}
          >
            {salvando ? 'Criando...' : 'Criar Deck'}
          </button>
        </main>

        {/* Decks criados nesta visita */}
        <aside className={styles.sidepanel} aria-label="Decks criados agora">
          <div className={styles.sidepanelHeader}>
            <h3 className={styles.sidepanelTitle}>
              Decks criados
              <span className={styles.sidepanelCount}>{savedDecks.length}</span>
            </h3>
            <button
              className={styles.addDeckBtn}
              onClick={() => textareaRef.current?.focus()}
              title="Criar novo deck"
              aria-label="Criar novo deck"
            >+</button>
          </div>

          {savedDecks.length === 0 ? (
            <p className={styles.sidepanelEmpty}>Seus decks vão aparecer aqui após criar.</p>
          ) : (
            <div className={styles.deckList}>
              {savedDecks.map((d, i) => (
                <div key={d.id} className={styles.savedDeck}>
                  <span className={styles.savedNum}>{i + 1}</span>
                  <div className={styles.savedContent}>
                    <span className={styles.savedNome}>{d.nome}</span>
                    <span className={styles.savedParent}>
                      {mainDecks.find((m) => m.id === d.mainDeckId)?.nome ?? ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {criado && (
        <Dialogo
          icone="✅"
          titulo="Deck criado!"
          onFechar={criarOutro}
          acoes={[
            { label: 'Adicionar cards neste deck', variante: 'primario', onClick: () => navigate(`/criar/flashcard?deck=${criado.id}`) },
            { label: 'Criar outro deck', variante: 'secundario', onClick: criarOutro },
            { label: 'Concluir', variante: 'texto', onClick: () => navigate('/app/criar') },
          ]}
        >
          <p>“{criado.nome}” foi criado em {learnDeckAtual?.nome ?? 'seu LearnDeck'}. Deseja prosseguir?</p>
        </Dialogo>
      )}
    </div>
  );
};

export default CriarDeckPage;
