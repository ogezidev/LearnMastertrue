import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Dialogo from '@/components/Dialogo/Dialogo';
import { MensagemErro } from '@/components/EstadoTela/EstadoTela';
import styles from './CriarLearnDeckPage.module.css';

const MAX = 50;

const CriarLearnDeckPage = () => {
  const { mainDecks, createMainDeck } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  // LearnDeck recém-criado: abre o "Deseja prosseguir?"
  const [criado, setCriado] = useState(null);

  const isFirstTime = mainDecks.length === 0 && !criado;

  const handleSubmit = async () => {
    const valor = nome.trim();
    if (!valor || salvando) return;
    setErro('');
    setSalvando(true);
    try {
      setCriado(await createMainDeck(valor));
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
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/app/criar')}>
          Voltar
        </button>
        <div className={styles.steps} aria-hidden="true">
          <span className={styles.stepActive}>1</span>
          <span className={styles.stepDivider}>—</span>
          <span className={styles.stepInactive}>2</span>
          <span className={styles.stepDivider}>—</span>
          <span className={styles.stepInactive}>3</span>
        </div>
        <div className={styles.headerSpacer} />
      </header>

      <main className={styles.main}>
        <Breadcrumb
          className={styles.breadcrumb}
          itens={[{ label: 'Criar', to: '/app/criar' }, { label: 'Novo LearnDeck' }]}
        />
        <p className={styles.stepLabel}>Passo 1 de 3 · LearnDeck</p>
        <h1 className={styles.title}>{isFirstTime ? 'Crie seu primeiro LearnDeck' : 'Crie seu LearnDeck'}</h1>

        <div className={styles.formCard}>
          <label className={styles.formTitle} htmlFor="nome-learndeck">Nome do LearnDeck</label>
          <p className={styles.formSubtitle}>
            O LearnDeck é a pasta principal que organiza seus decks. Ex.: Matemática, Inglês, Biologia.
          </p>

          <div className={styles.inputWrapper}>
            <textarea
              id="nome-learndeck"
              className={styles.textarea}
              placeholder="Ex: Matemática.."
              maxLength={MAX}
              value={nome}
              onChange={(e) => { setNome(e.target.value.replace(/\n/g, '').slice(0, MAX)); setErro(''); }}
              onKeyDown={handleKeyDown}
              aria-describedby="contador-learndeck"
              autoFocus
            />
            <span id="contador-learndeck" className={styles.counter}>{nome.length}/{MAX}</span>
          </div>
        </div>

        <MensagemErro>{erro}</MensagemErro>

        <button
          className={styles.continueBtn}
          onClick={handleSubmit}
          disabled={!nome.trim() || salvando}
        >
          {salvando ? 'Criando...' : 'Criar LearnDeck'}
        </button>

        {isFirstTime && (
          <p className={styles.stepHint}>Próximo: criar um Deck dentro do seu LearnDeck</p>
        )}
      </main>

      {criado && (
        <Dialogo
          icone="✅"
          titulo="LearnDeck criado!"
          onFechar={criarOutro}
          acoes={[
            { label: 'Criar deck neste LearnDeck', variante: 'primario', onClick: () => navigate(`/criar/deck?learndeck=${criado.id}`) },
            { label: 'Criar outro LearnDeck', variante: 'secundario', onClick: criarOutro },
            { label: 'Concluir', variante: 'texto', onClick: () => navigate('/app/criar') },
          ]}
        >
          <p>“{criado.nome}” está pronto. Deseja prosseguir?</p>
        </Dialogo>
      )}
    </div>
  );
};

export default CriarLearnDeckPage;
