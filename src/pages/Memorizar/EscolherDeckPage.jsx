import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Carregando, ErroCarregar } from '@/components/EstadoTela/EstadoTela';
import styles from './IntroPage.module.css';

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

// /memorizar: abre o último deck estudado; se não houver (ou em "Trocar deck"), pede para escolher
const EscolherDeckPage = () => {
  const { mainDecks, decks, ultimoDeck, dadosCarregados, erroDados, recarregarDados } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const escolher = params.has('escolher');

  const topo = (
    <div className={styles.topo}>
      <button className={styles.backBtn} onClick={() => navigate('/app')}>Voltar</button>
    </div>
  );

  if (!dadosCarregados) {
    return (
      <div className={styles.page}>
        {topo}
        {erroDados
          ? <ErroCarregar mensagem={erroDados} onTentar={recarregarDados} />
          : <Carregando texto="Carregando seus decks..." />}
      </div>
    );
  }

  if (ultimoDeck && !escolher) {
    return <Navigate to={`/memorizar/${ultimoDeck.id}`} replace />;
  }

  if (decks.length === 0) {
    return (
      <div className={styles.page}>
        {topo}
        <main className={styles.center}>
          <p className={styles.emptyMsg}>Você ainda não tem decks para estudar.</p>
          <button className={styles.studyBtn} onClick={() => navigate(mainDecks.length ? '/criar/deck' : '/criar/learndeck')}>
            {mainDecks.length ? 'Criar um deck' : 'Criar meu primeiro LearnDeck'}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {topo}
      <main className={styles.escolha}>
        <h1 className={styles.escolhaTitulo}>Escolha um deck para estudar</h1>
        <p className={styles.escolhaSub}>Da próxima vez, o Memorizar abre direto no último deck que você estudou.</p>

        {mainDecks.map((md) => {
          const filhos = decks.filter((d) => d.mainDeckId === md.id);
          if (filhos.length === 0) return null;
          return (
            <section key={md.id} className={styles.grupo} aria-label={md.nome}>
              <h2 className={styles.grupoTitulo}>{md.nome}</h2>
              <div className={styles.grupoLista}>
                {filhos.map((d) => (
                  <button
                    key={d.id}
                    className={`${styles.opcao} ${d.id === ultimoDeck?.id ? styles.opcaoAtual : ''}`}
                    onClick={() => navigate(`/memorizar/${d.id}`)}
                  >
                    <span className={styles.opcaoNome}>{d.nome}</span>
                    <span className={styles.opcaoMeta}>
                      {d.cards.length === 0 ? 'Sem cards' : plural(d.cards.length, 'card', 'cards')}
                      {d.id === ultimoDeck?.id && ' · último estudado'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default EscolherDeckPage;
