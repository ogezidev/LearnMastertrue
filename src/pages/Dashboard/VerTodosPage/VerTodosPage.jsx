import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Dialogo from '@/components/Dialogo/Dialogo';
import Fichario from '@/components/Fichario/Fichario';
import Icone from '@/components/Icone/Icone';
import { Carregando, ErroCarregar, MensagemErro } from '@/components/EstadoTela/EstadoTela';
import { contarNiveis, dominio, semAcento, visualDoAssunto } from '@/utils/assunto';
import styles from './VerTodosPage.module.css';

const MAX_NOME = 50;
const MAX_TEXTO_CARD = 200;

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

const NIVEIS = {
  dificil: { label: 'Difícil', classe: styles.dificil },
  bom: { label: 'Bom', classe: styles.bom },
  facil: { label: 'Fácil', classe: styles.facil },
};
const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'dificil', label: 'Difícil' },
  { key: 'bom', label: 'Bom' },
  { key: 'facil', label: 'Fácil' },
  { key: 'nao-avaliado', label: 'Não avaliado' },
];

const normalizar = semAcento;

// Destaca o termo buscado no texto original, mantendo acentos e maiúsculas
const Destaque = ({ texto, termo }) => {
  if (!termo) return texto;
  let norm = '';
  const origem = [];
  for (let i = 0; i < texto.length; i++) {
    for (const ch of normalizar(texto[i])) {
      norm += ch;
      origem.push(i);
    }
  }
  const alvo = normalizar(termo);
  const partes = [];
  let pos = 0;
  let idx = norm.indexOf(alvo);
  while (idx !== -1 && alvo) {
    const ini = origem[idx];
    const fim = origem[idx + alvo.length - 1] + 1;
    if (ini > pos) partes.push(texto.slice(pos, ini));
    partes.push(<mark key={ini} className={styles.marca}>{texto.slice(ini, fim)}</mark>);
    pos = fim;
    idx = norm.indexOf(alvo, idx + alvo.length);
  }
  partes.push(texto.slice(pos));
  return partes;
};

// Barra fina com a proporção de cards em cada nível
const BarraNiveis = ({ contagem }) => (
  <span className={styles.barraNiveis} aria-label={`${contagem.dificil} difícil, ${contagem.bom} bom, ${contagem.facil} fácil, ${contagem.novos} não avaliados`}>
    {contagem.total === 0
      ? <span className={styles.segVazio} style={{ flexGrow: 1 }} />
      : ['dificil', 'bom', 'facil', 'novos'].filter((k) => contagem[k] > 0).map((k) => (
        <span key={k} className={styles[`seg_${k}`]} style={{ flexGrow: contagem[k] }} />
      ))}
  </span>
);

// Botões de editar/excluir: irmãos da área clicável (nunca um botão dentro de outro)
const Acoes = ({ nome, onEditar, onExcluir }) => (
  <div className={styles.acoes}>
    <button type="button" className={styles.acao} onClick={onEditar} aria-label={`Editar ${nome}`} title="Editar">
      <Icone nome="lapis" tamanho={16} />
    </button>
    <button type="button" className={`${styles.acao} ${styles.acaoPerigo}`} onClick={onExcluir} aria-label={`Excluir ${nome}`} title="Excluir">
      <Icone nome="lixeira" tamanho={16} />
    </button>
  </div>
);

const VerTodosPage = () => {
  const {
    mainDecks, decks,
    deleteMainDeck, deleteDeck, deleteCard,
    updateMainDeck, updateDeck, updateCard,
    cardRatings, dadosCarregados, erroDados, recarregarDados,
  } = useApp();
  const navigate = useNavigate();
  const { learnDeckId, deckId } = useParams();
  const [params, setParams] = useSearchParams();

  // O nível atual vem da URL: o Voltar do navegador sobe um nível e recarregar mantém a tela
  const ldId = learnDeckId ? Number(learnDeckId) : null;
  const dkId = deckId ? Number(deckId) : null;
  const nivel = dkId ? 'cards' : ldId ? 'decks' : 'learndecks';

  const termo = params.get('q') ?? '';
  const busca = termo.trim();
  const filtro = FILTROS.some((f) => f.key === params.get('nota')) ? params.get('nota') : 'todos';
  const buscando = busca.length > 0;

  const atualizarParams = (novos) => {
    const p = new URLSearchParams(params);
    Object.entries(novos).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p, { replace: true });
  };

  const [virados, setVirados] = useState(() => new Set()); // cards mostrando o verso
  const [edicao, setEdicao] = useState(null); // { type, id, deckId?, nome?, frente?, verso? }
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');
  const [confirmacao, setConfirmacao] = useState(null); // { tipo, id, deckId?, nome, decks, cards }
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');

  const learnDeck = mainDecks.find((m) => m.id === ldId);
  const deck = decks.find((d) => d.id === dkId && d.mainDeckId === ldId);
  const naoEncontrado = dadosCarregados && ((ldId && !learnDeck) || (dkId && !deck));
  const learnDeckDe = (id) => mainDecks.find((m) => m.id === id);
  const visualDe = (md) => (md ? visualDoAssunto(md.nome, md.id) : visualDoAssunto('', null));
  const visualAtual = visualDe(learnDeck);

  const todosCards = useMemo(
    () => decks.flatMap((d) => d.cards.map((c, i) => ({
      ...c, posicao: i + 1, deckId: d.id, deckNome: d.nome, mainDeckId: d.mainDeckId,
    }))),
    [decks],
  );

  const casa = (texto) => normalizar(texto).includes(normalizar(busca));
  const nivelDoCard = (card) => cardRatings[card.id] ?? null;
  const passaFiltro = (card) =>
    filtro === 'todos' || (filtro === 'nao-avaliado' ? !nivelDoCard(card) : nivelDoCard(card) === filtro);

  // ── O que aparece em cada nível ──
  const learnDecksVisiveis = nivel === 'learndecks' ? mainDecks.filter((m) => !buscando || casa(m.nome)) : [];
  const decksDoEscopo = nivel === 'learndecks' ? decks : decks.filter((d) => d.mainDeckId === ldId);
  const decksVisiveis = nivel === 'cards' ? [] : decksDoEscopo.filter((d) => !buscando || casa(d.nome));
  const cardsDoEscopo = nivel === 'cards'
    ? todosCards.filter((c) => c.deckId === dkId)
    : nivel === 'decks' ? todosCards.filter((c) => c.mainDeckId === ldId) : todosCards;
  const cardsPorTexto = nivel === 'cards' || buscando
    ? cardsDoEscopo.filter((c) => !buscando || casa(c.frente) || casa(c.verso))
    : [];
  const cardsVisiveis = cardsPorTexto.filter(passaFiltro);
  const contagemFiltro = (key) => cardsPorTexto.filter((c) =>
    key === 'todos' || (key === 'nao-avaliado' ? !nivelDoCard(c) : nivelDoCard(c) === key)).length;

  const nivelVazio =
    (nivel === 'learndecks' && mainDecks.length === 0) ||
    (nivel === 'decks' && decksDoEscopo.length === 0) ||
    (nivel === 'cards' && cardsDoEscopo.length === 0);

  const irParaCriar = () => navigate(
    nivel === 'cards' ? `/criar/flashcard?deck=${dkId}`
      : nivel === 'decks' ? `/criar/deck?learndeck=${ldId}`
      : '/criar/learndeck',
  );

  const virar = (id) => setVirados((prev) => {
    const novo = new Set(prev);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    return novo;
  });

  // ── Exclusão (mostra quantos itens vão junto) ──
  const pedirExclusao = (dados) => {
    setErroExclusao('');
    setConfirmacao(dados);
  };

  const confirmarExclusao = async () => {
    if (!confirmacao || excluindo) return;
    setExcluindo(true);
    setErroExclusao('');
    try {
      if (confirmacao.tipo === 'learndeck') await deleteMainDeck(confirmacao.id);
      else if (confirmacao.tipo === 'deck') await deleteDeck(confirmacao.id);
      else await deleteCard(confirmacao.deckId, confirmacao.id);
      setConfirmacao(null);
    } catch (err) {
      setErroExclusao(err.message);
    } finally {
      setExcluindo(false);
    }
  };

  const mensagemExclusao = () => {
    if (!confirmacao) return '';
    if (confirmacao.tipo === 'learndeck') {
      if (confirmacao.decks === 0) return 'O LearnDeck está vazio.';
      return `Isso apagará ${plural(confirmacao.decks, 'deck', 'decks')} e ${plural(confirmacao.cards, 'flashcard', 'flashcards')}, com o histórico de avaliações.`;
    }
    if (confirmacao.tipo === 'deck') {
      return confirmacao.cards === 0 ? 'O deck está vazio.' : `Isso apagará ${plural(confirmacao.cards, 'flashcard', 'flashcards')}, com o histórico de avaliações.`;
    }
    return 'O card e o histórico de avaliações dele serão apagados.';
  };

  // ── Edição ──
  const abrirEdicao = (dados) => {
    setErroEdicao('');
    setEdicao(dados);
  };

  const edicaoValida = edicao && (edicao.type === 'flashcard'
    ? edicao.frente.trim() && edicao.verso.trim()
    : edicao.nome.trim());

  const salvarEdicao = async () => {
    if (!edicaoValida || salvandoEdicao) return;
    setSalvandoEdicao(true);
    setErroEdicao('');
    try {
      if (edicao.type === 'learndeck') await updateMainDeck(edicao.id, edicao.nome.trim());
      else if (edicao.type === 'deck') await updateDeck(edicao.id, edicao.nome.trim());
      else await updateCard(edicao.deckId, edicao.id, edicao.frente.trim(), edicao.verso.trim());
      setEdicao(null);
    } catch (err) {
      setErroEdicao(err.message);
    } finally {
      setSalvandoEdicao(false);
    }
  };

  // ── Peças ──
  const renderLearnDeck = (md, i) => {
    const filhos = decks.filter((d) => d.mainDeckId === md.id);
    const cards = filhos.flatMap((d) => d.cards);
    return (
      <article key={md.id} className={styles.itemFichario} style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}>
        <Link to={`/app/decks/${md.id}`} className={styles.itemLink} aria-label={`Abrir ${md.nome}`}>
          <Fichario
            nome={<Destaque texto={md.nome} termo={busca} />}
            visual={visualDe(md)}
            meta={`${plural(filhos.length, 'deck', 'decks')} · ${plural(cards.length, 'card', 'cards')}`}
            etiquetas={filhos.map((d) => ({ chave: d.id, texto: d.nome }))}
            progresso={cards.length ? dominio(cards, cardRatings) : null}
          />
        </Link>
        <Acoes
          nome={md.nome}
          onEditar={() => abrirEdicao({ type: 'learndeck', id: md.id, nome: md.nome })}
          onExcluir={() => pedirExclusao({ tipo: 'learndeck', id: md.id, nome: md.nome, decks: filhos.length, cards: cards.length })}
        />
      </article>
    );
  };

  const renderDeck = (d, i) => {
    const md = learnDeckDe(d.mainDeckId);
    const v = visualDe(md);
    const contagem = contarNiveis(d.cards, cardRatings);
    const pct = Math.round(dominio(d.cards, cardRatings) * 100);
    return (
      <article
        key={d.id}
        className={styles.deck}
        style={{ '--cor': v.cor, '--suave': v.suave, '--escuro': v.escuro, animationDelay: `${Math.min(i * 40, 320)}ms` }}
      >
        <Link to={`/app/decks/${d.mainDeckId}/${d.id}`} className={styles.deckLink} aria-label={`Abrir deck ${d.nome}`}>
          <span className={styles.deckAba}>
            <Icone nome="camadas" tamanho={14} />
            {nivel === 'learndecks' ? md?.nome : 'Deck'}
          </span>
          <span className={styles.deckNome}><Destaque texto={d.nome} termo={busca} /></span>
          <span className={styles.deckMeta}>
            {plural(d.cards.length, 'card', 'cards')}{d.cards.length > 0 && ` · ${pct}% dominado`}
          </span>
          <BarraNiveis contagem={contagem} />
          <span className={styles.deckRodape}>
            {contagem.dificil > 0 && <span className={styles.deckChip}>{contagem.dificil} {contagem.dificil === 1 ? 'difícil' : 'difíceis'}</span>}
            {contagem.novos > 0 && <span className={`${styles.deckChip} ${styles.deckChipNovo}`}>{contagem.novos} {contagem.novos === 1 ? 'novo' : 'novos'}</span>}
          </span>
        </Link>
        {d.cards.length > 0 && (
          <button type="button" className={styles.deckEstudar} onClick={() => navigate(`/memorizar/${d.id}`)} aria-label={`Estudar ${d.nome}`}>
            <Icone nome="play" tamanho={14} /> Estudar
          </button>
        )}
        <Acoes
          nome={d.nome}
          onEditar={() => abrirEdicao({ type: 'deck', id: d.id, nome: d.nome })}
          onExcluir={() => pedirExclusao({ tipo: 'deck', id: d.id, nome: d.nome, decks: 0, cards: d.cards.length })}
        />
      </article>
    );
  };

  const renderCard = (card, i) => {
    const nivelCard = nivelDoCard(card);
    const info = nivelCard ? NIVEIS[nivelCard] : null;
    const virado = virados.has(card.id);
    const md = learnDeckDe(card.mainDeckId);
    return (
      <article key={card.id} className={styles.ficha} style={{ animationDelay: `${Math.min(i * 25, 300)}ms` }}>
        <button
          type="button"
          className={`${styles.fichaBotao} ${virado ? styles.fichaVirada : ''}`}
          onClick={() => virar(card.id)}
          aria-pressed={virado}
          aria-label={virado ? `Resposta: ${card.verso}. Clique para ver a pergunta` : `Pergunta: ${card.frente}. Clique para ver a resposta`}
        >
          <span className={`${styles.fichaFace} ${styles.fichaFrente}`}>
            <span className={styles.fichaTopo}>
              <span className={styles.fichaNum}>{nivel === 'cards' ? `#${card.posicao}` : `${md?.nome ?? ''} › ${card.deckNome}`}</span>
              <span className={`${styles.nivel} ${info ? info.classe : styles.novo}`}>{info ? info.label : 'Não avaliado'}</span>
            </span>
            <span className={styles.fichaTexto}><Destaque texto={card.frente} termo={busca} /></span>
            <span className={styles.fichaDica}><Icone nome="girar" tamanho={13} /> ver resposta</span>
          </span>
          <span className={`${styles.fichaFace} ${styles.fichaVerso}`}>
            <span className={styles.fichaTopo}><span className={styles.fichaNum}>Resposta</span></span>
            <span className={styles.fichaTexto}><Destaque texto={card.verso} termo={busca} /></span>
            <span className={styles.fichaDica}><Icone nome="girar" tamanho={13} /> ver pergunta</span>
          </span>
        </button>
        <Acoes
          nome="card"
          onEditar={() => abrirEdicao({ type: 'flashcard', id: card.id, deckId: card.deckId, frente: card.frente, verso: card.verso })}
          onExcluir={() => pedirExclusao({ tipo: 'flashcard', id: card.id, deckId: card.deckId, nome: card.frente, decks: 0, cards: 0 })}
        />
      </article>
    );
  };

  const novoTile = (texto) => (
    <button type="button" className={styles.novoTile} onClick={irParaCriar}>
      <span className={styles.novoIcone}><Icone nome="mais" tamanho={22} /></span>
      {texto}
    </button>
  );

  const chipsFiltro = (
    <div className={styles.filtros} role="group" aria-label="Filtrar por avaliação">
      {FILTROS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`${styles.filtro} ${styles[`filtro_${key.replace('-', '_')}`] ?? ''} ${filtro === key ? styles.filtroAtivo : ''}`}
          onClick={() => atualizarParams({ nota: key === 'todos' ? null : key })}
          aria-pressed={filtro === key}
        >
          {label}<span className={styles.filtroNum}>{contagemFiltro(key)}</span>
        </button>
      ))}
    </div>
  );

  const vazio = (titulo, texto, acao) => (
    <div className={styles.vazio}>
      <div className={styles.vazioPilha} aria-hidden="true"><span /><span /><span /></div>
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {acao}
    </div>
  );

  const semResultados = vazio(
    buscando ? `Nada encontrado para “${busca}”` : 'Nenhum card com essa avaliação',
    buscando && filtro !== 'todos' ? 'Tente outro termo ou tire o filtro.' : 'Tente outro termo ou outro filtro.',
    <button type="button" className={styles.botaoSecundario} onClick={() => atualizarParams({ q: null, nota: null })}>Limpar busca e filtro</button>,
  );

  const conteudo = () => {
    if (!dadosCarregados) {
      return erroDados
        ? <ErroCarregar mensagem={erroDados} onTentar={recarregarDados} />
        : <Carregando texto="Carregando seus LearnDecks..." />;
    }
    if (naoEncontrado) {
      return vazio(
        `Este ${dkId ? 'deck' : 'LearnDeck'} não foi encontrado`,
        'Ele pode ter sido excluído em outro aparelho.',
        <button type="button" className={styles.botaoPrincipal} onClick={() => navigate('/app/decks')}>Ir para Seus LearnDecks</button>,
      );
    }
    if (nivelVazio) {
      const [t, x, b] = {
        learndecks: ['Seu fichário está vazio', 'Crie um LearnDeck para cada assunto que você estuda.', 'Criar LearnDeck'],
        decks: [`${learnDeck?.nome} ainda não tem decks`, 'Divida o assunto em decks: um para cada tema ou capítulo.', 'Criar deck'],
        cards: ['Este deck ainda não tem cards', 'Escreva a pergunta na frente e a resposta no verso.', 'Escrever cards'],
      }[nivel];
      return vazio(t, x, <button type="button" className={styles.botaoPrincipal} onClick={irParaCriar}><Icone nome="mais" tamanho={18} /> {b}</button>);
    }

    if (nivel === 'cards') {
      return (
        <>
          {chipsFiltro}
          {cardsVisiveis.length === 0 ? semResultados : (
            <div className={styles.gradeFichas}>
              {cardsVisiveis.map(renderCard)}
              {!buscando && filtro === 'todos' && novoTile('Novo card')}
            </div>
          )}
        </>
      );
    }

    if (!buscando) {
      return nivel === 'learndecks' ? (
        <div className={styles.gradeFicharios}>
          {learnDecksVisiveis.map(renderLearnDeck)}
          {novoTile('Novo LearnDeck')}
        </div>
      ) : (
        <div className={styles.gradeDecks}>
          {decksVisiveis.map(renderDeck)}
          {novoTile('Novo deck')}
        </div>
      );
    }

    const total = learnDecksVisiveis.length + decksVisiveis.length + cardsPorTexto.length;
    if (total === 0) return semResultados;
    return (
      <div className={styles.resultados}>
        {learnDecksVisiveis.length > 0 && (
          <section aria-label="LearnDecks encontrados">
            <h2 className={styles.grupoTitulo}>LearnDecks <span>{learnDecksVisiveis.length}</span></h2>
            <div className={styles.gradeFicharios}>{learnDecksVisiveis.map(renderLearnDeck)}</div>
          </section>
        )}
        {decksVisiveis.length > 0 && (
          <section aria-label="Decks encontrados">
            <h2 className={styles.grupoTitulo}>Decks <span>{decksVisiveis.length}</span></h2>
            <div className={styles.gradeDecks}>{decksVisiveis.map(renderDeck)}</div>
          </section>
        )}
        {cardsPorTexto.length > 0 && (
          <section aria-label="Cards encontrados">
            <h2 className={styles.grupoTitulo}>Cards <span>{cardsVisiveis.length}</span></h2>
            {chipsFiltro}
            {cardsVisiveis.length === 0
              ? <p className={styles.semCards}>Nenhum card com essa avaliação.</p>
              : <div className={styles.gradeFichas}>{cardsVisiveis.map(renderCard)}</div>}
          </section>
        )}
      </div>
    );
  };

  // ── Cabeçalho do nível ──
  const cardsDoLearnDeck = todosCards.filter((c) => c.mainDeckId === ldId);
  const resumo = {
    learndecks: `${plural(mainDecks.length, 'LearnDeck', 'LearnDecks')} · ${plural(decks.length, 'deck', 'decks')} · ${plural(todosCards.length, 'card', 'cards')}`,
    decks: `${plural(decksDoEscopo.length, 'deck', 'decks')} · ${plural(cardsDoLearnDeck.length, 'card', 'cards')}${cardsDoLearnDeck.length ? ` · ${Math.round(dominio(cardsDoLearnDeck, cardRatings) * 100)}% dominado` : ''}`,
    cards: deck ? `${plural(deck.cards.length, 'card', 'cards')}${deck.cards.length ? ` · ${Math.round(dominio(deck.cards, cardRatings) * 100)}% dominado` : ''}` : '',
  }[nivel];

  const titulo = { learndecks: 'Seus LearnDecks', decks: learnDeck?.nome, cards: deck?.nome }[nivel];
  const placeholder = {
    learndecks: 'Buscar em tudo: LearnDecks, decks e cards',
    decks: `Buscar em ${learnDeck?.nome ?? 'este LearnDeck'}`,
    cards: 'Buscar na pergunta ou na resposta',
  }[nivel];
  const textoNovo = { learndecks: 'Novo LearnDeck', decks: 'Novo deck', cards: 'Novo card' }[nivel];

  return (
    <div
      className={`${styles.page} ${nivel !== 'learndecks' ? styles.pageAssunto : ''}`}
      style={{ '--cor': visualAtual.cor, '--suave': visualAtual.suave, '--escuro': visualAtual.escuro }}
    >
      <div className={styles.container}>
        <header className={styles.cabeca}>
          {nivel !== 'learndecks' && (
            <nav className={styles.trilha} aria-label="Você está em">
              <Link to="/app/decks">Seus LearnDecks</Link>
              <span aria-hidden="true">›</span>
              {nivel === 'cards' ? <Link to={`/app/decks/${ldId}`}>{learnDeck?.nome}</Link> : <span aria-current="page">{learnDeck?.nome}</span>}
              {nivel === 'cards' && <><span aria-hidden="true">›</span><span aria-current="page">{deck?.nome}</span></>}
            </nav>
          )}

          <div className={styles.cabecaLinha}>
            {nivel !== 'learndecks' && learnDeck && (
              <span className={styles.cabecaIcone}>
                <Icone nome={nivel === 'cards' ? 'camadas' : visualAtual.icone} tamanho={28} />
              </span>
            )}
            <div className={styles.cabecaTexto}>
              <h1 className={styles.titulo}>{titulo}</h1>
              {dadosCarregados && !naoEncontrado && <p className={styles.resumo}>{resumo}</p>}
            </div>
            {dadosCarregados && !naoEncontrado && (
              <div className={styles.cabecaAcoes}>
                {nivel === 'cards' && deck?.cards.length > 0 && (
                  <button type="button" className={styles.botaoEstudar} onClick={() => navigate(`/memorizar/${dkId}`)}>
                    <Icone nome="play" tamanho={16} /> Estudar
                  </button>
                )}
                <button type="button" className={styles.botaoPrincipal} onClick={irParaCriar}>
                  <Icone nome="mais" tamanho={18} /> {textoNovo}
                </button>
              </div>
            )}
          </div>

          {dadosCarregados && !naoEncontrado && !nivelVazio && (
            <div className={styles.busca}>
              <Icone nome="busca" tamanho={20} />
              <input
                type="search"
                placeholder={placeholder}
                aria-label={placeholder}
                value={termo}
                onChange={(e) => atualizarParams({ q: e.target.value })}
              />
              {termo && (
                <button type="button" onClick={() => atualizarParams({ q: null })} aria-label="Limpar busca">
                  <Icone nome="fechar" tamanho={16} />
                </button>
              )}
            </div>
          )}
        </header>

        <main className={styles.conteudo}>{conteudo()}</main>
      </div>

      {/* ── Edição ── */}
      {edicao && (
        <div className={styles.modalFundo} onClick={() => !salvandoEdicao && setEdicao(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="titulo-edicao">
            <div className={styles.modalTopo}>
              <h2 id="titulo-edicao">
                {edicao.type === 'flashcard' ? 'Editar card' : edicao.type === 'deck' ? 'Renomear deck' : 'Renomear LearnDeck'}
              </h2>
              <button type="button" className={styles.acao} onClick={() => setEdicao(null)} aria-label="Fechar"><Icone nome="fechar" tamanho={18} /></button>
            </div>
            <form className={styles.modalCorpo} onSubmit={(e) => { e.preventDefault(); salvarEdicao(); }}>
              {edicao.type === 'flashcard' ? (
                <>
                  <label htmlFor="editar-frente">Frente <em>pergunta</em></label>
                  <textarea
                    id="editar-frente"
                    className={styles.modalCampo}
                    value={edicao.frente}
                    onChange={(e) => setEdicao((m) => ({ ...m, frente: e.target.value.slice(0, MAX_TEXTO_CARD) }))}
                    maxLength={MAX_TEXTO_CARD}
                    rows={3}
                    autoFocus
                  />
                  <span className={styles.modalContador}>{edicao.frente.length}/{MAX_TEXTO_CARD}</span>
                  <label htmlFor="editar-verso">Verso <em>resposta</em></label>
                  <textarea
                    id="editar-verso"
                    className={`${styles.modalCampo} ${styles.modalVerso}`}
                    value={edicao.verso}
                    onChange={(e) => setEdicao((m) => ({ ...m, verso: e.target.value.slice(0, MAX_TEXTO_CARD) }))}
                    maxLength={MAX_TEXTO_CARD}
                    rows={3}
                  />
                  <span className={styles.modalContador}>{edicao.verso.length}/{MAX_TEXTO_CARD}</span>
                </>
              ) : (
                <>
                  <label htmlFor="editar-nome">Nome</label>
                  <input
                    id="editar-nome"
                    className={styles.modalCampo}
                    value={edicao.nome}
                    onChange={(e) => setEdicao((m) => ({ ...m, nome: e.target.value.slice(0, MAX_NOME) }))}
                    maxLength={MAX_NOME}
                    autoFocus
                  />
                  <span className={styles.modalContador}>{edicao.nome.length}/{MAX_NOME}</span>
                </>
              )}
              <MensagemErro>{erroEdicao}</MensagemErro>
              <div className={styles.modalBotoes}>
                <button type="button" className={styles.botaoSecundario} onClick={() => setEdicao(null)}>Cancelar</button>
                <button type="submit" className={styles.botaoPrincipal} disabled={!edicaoValida || salvandoEdicao}>
                  {salvandoEdicao ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmação de exclusão ── */}
      {confirmacao && (
        <Dialogo
          titulo={confirmacao.tipo === 'flashcard' ? 'Excluir este card?' : `Excluir “${confirmacao.nome}”?`}
          onFechar={() => !excluindo && setConfirmacao(null)}
          acoes={[
            { label: excluindo ? 'Excluindo...' : 'Excluir', variante: 'perigo', onClick: confirmarExclusao, disabled: excluindo },
            { label: 'Cancelar', variante: 'texto', onClick: () => setConfirmacao(null), disabled: excluindo },
          ]}
        >
          <p>{mensagemExclusao()}</p>
          <p>Essa ação não pode ser desfeita.</p>
          <MensagemErro>{erroExclusao}</MensagemErro>
        </Dialogo>
      )}
    </div>
  );
};

export default VerTodosPage;
