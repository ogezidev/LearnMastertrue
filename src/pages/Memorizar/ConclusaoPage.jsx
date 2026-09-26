import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './ConclusaoPage.module.css';

const GRUPOS = [
  { key: 'dificil', label: 'Difícil', classe: styles.dificil },
  { key: 'bom', label: 'Bom', classe: styles.bom },
  { key: 'facil', label: 'Fácil', classe: styles.facil },
  { key: 'pulado', label: 'Sem avaliação', classe: styles.pulado },
];
const ORDEM = { dificil: 0, bom: 1, facil: 2 };
const NOME = { dificil: 'Difícil', bom: 'Bom', facil: 'Fácil' };

const duracao = (ms) => {
  const s = Math.max(1, Math.round(ms / 1000));
  const min = Math.floor(s / 60);
  if (min === 0) return `${s} s`;
  return s % 60 ? `${min} min ${s % 60} s` : `${min} min`;
};

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

// Resumo da revisão: o que foi avaliado, o que mudou desde a última vez e o que rever
const ConclusaoPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { decks } = useApp();

  const acoesBase = [
    { label: 'Adicionar cards', onClick: () => navigate(`/criar/flashcard?deck=${deckId}`) },
    { label: 'Voltar ao início', onClick: () => navigate('/app'), texto: true },
  ];

  // O resultado vem da tela de estudo; ao recarregar a página ele não existe mais
  if (!state?.sessao) {
    return (
      <div className={styles.page}>
        <main className={styles.container}>
          <h1 className={styles.titulo}>Revisão encerrada</h1>
          <p className={styles.linha}>O resumo desta revisão não está mais disponível, mas as avaliações já foram salvas.</p>
          <div className={styles.acoes}>
            <button className={styles.principal} onClick={() => navigate(`/memorizar/${deckId}/estudar`)}>Estudar de novo</button>
            {acoesBase.map((a) => (
              <button key={a.label} className={a.texto ? styles.textoBotao : styles.secundario} onClick={a.onClick}>{a.label}</button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const { sessao, anteriores = {}, cardIds = [], duracaoMs = 0, parcial, deckNome, learnDeckNome } = state;
  const deck = decks.find((d) => d.id === Number(deckId));
  const porId = new Map((deck?.cards ?? []).map((c) => [c.id, c]));

  // Cards desta revisão, na ordem estudada (ignora os que foram excluídos depois)
  const itens = cardIds
    .map((id) => {
      const card = porId.get(id);
      if (!card) return null;
      const nivel = sessao[id] ?? null;
      const antes = anteriores[id] ?? null;
      let mudanca = null;
      if (nivel && !antes) mudanca = 'nova';
      else if (nivel && antes && ORDEM[nivel] > ORDEM[antes]) mudanca = 'subiu';
      else if (nivel && antes && ORDEM[nivel] < ORDEM[antes]) mudanca = 'caiu';
      return { card, nivel: nivel ?? 'pulado', antes, mudanca };
    })
    .filter(Boolean);

  const conta = (k) => itens.filter((i) => i.nivel === k).length;
  const avaliados = itens.filter((i) => i.nivel !== 'pulado').length;
  const subiram = itens.filter((i) => i.mudanca === 'subiu').length;
  const cairam = itens.filter((i) => i.mudanca === 'caiu').length;
  const novos = itens.filter((i) => i.mudanca === 'nova').length;
  const dificeis = itens.filter((i) => i.nivel === 'dificil').map((i) => i.card.id);

  const mudancas = [
    subiram && `${plural(subiram, 'card subiu', 'cards subiram')} de nível`,
    cairam && `${plural(cairam, 'caiu', 'caíram')}`,
    novos && `${plural(novos, 'avaliado pela primeira vez', 'avaliados pela primeira vez')}`,
  ].filter(Boolean);

  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <nav className={styles.topo}>
          <button className={styles.textoBotao} onClick={() => navigate('/app')}>← Início</button>
          <span className={styles.caminho}>{learnDeckNome ? `${learnDeckNome} › ` : ''}{deckNome}</span>
        </nav>

        <header className={styles.cabeca}>
          <p className={styles.sobre}>Revisão das {hora}{parcial ? ' · só os cards escolhidos' : ''}</p>
          <h1 className={styles.titulo}>{deckNome}</h1>
          <p className={styles.linha}>
            {plural(avaliados, 'card avaliado', 'cards avaliados')}
            {avaliados < itens.length && ` de ${itens.length}`} em {duracao(duracaoMs)}
          </p>
        </header>

        {/* Distribuição por nível */}
        <section className={styles.distribuicao} aria-label="Cards por nível">
          <div className={styles.barra}>
            {GRUPOS.filter((g) => conta(g.key) > 0).map((g) => (
              <span key={g.key} className={`${styles.segmento} ${g.classe}`} style={{ flexGrow: conta(g.key) }} />
            ))}
          </div>
          <ul className={styles.legenda}>
            {GRUPOS.filter((g) => g.key !== 'pulado' || conta('pulado') > 0).map((g) => (
              <li key={g.key}>
                <span className={`${styles.ponto} ${g.classe}`} />
                <strong>{conta(g.key)}</strong> {g.label.toLowerCase()}
              </li>
            ))}
          </ul>
          {mudancas.length > 0 && <p className={styles.mudancas}>Comparado com a última vez: {mudancas.join(', ')}.</p>}
        </section>

        <div className={styles.acoes}>
          {dificeis.length > 0 ? (
            <>
              <button className={styles.principal} onClick={() => navigate(`/memorizar/${deckId}/estudar?so=${dificeis.join(',')}`)}>
                Rever {dificeis.length === 1 ? 'o card difícil' : `os ${dificeis.length} difíceis`}
              </button>
              <button className={styles.secundario} onClick={() => navigate(`/memorizar/${deckId}/estudar`)}>Estudar tudo de novo</button>
            </>
          ) : (
            <button className={styles.principal} onClick={() => navigate(`/memorizar/${deckId}/estudar`)}>Estudar de novo</button>
          )}
          {acoesBase.map((a) => (
            <button key={a.label} className={a.texto ? styles.textoBotao : styles.secundario} onClick={a.onClick}>{a.label}</button>
          ))}
        </div>

        {/* Cards desta revisão, por nível */}
        {GRUPOS.map((g) => {
          const grupo = itens.filter((i) => i.nivel === g.key);
          if (grupo.length === 0) return null;
          return (
            <section key={g.key} className={styles.grupo} aria-label={`${g.label}: ${grupo.length}`}>
              <h2 className={styles.grupoTitulo}>
                <span className={`${styles.ponto} ${g.classe}`} /> {g.label} <span className={styles.grupoConta}>{grupo.length}</span>
              </h2>
              <ul className={styles.cards}>
                {grupo.map(({ card, antes, mudanca }) => (
                  <li key={card.id} className={`${styles.card} ${g.classe}`}>
                    <div className={styles.cardTexto}>
                      <p className={styles.frente}>{card.frente}</p>
                      <p className={styles.verso}>{card.verso}</p>
                    </div>
                    {mudanca === 'subiu' && <span className={`${styles.selo} ${styles.seloSubiu}`}>↑ antes {NOME[antes]}</span>}
                    {mudanca === 'caiu' && <span className={`${styles.selo} ${styles.seloCaiu}`}>↓ antes {NOME[antes]}</span>}
                    {mudanca === 'nova' && <span className={styles.selo}>primeira vez</span>}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default ConclusaoPage;
