import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Dialogo from '@/components/Dialogo/Dialogo';
import { Carregando, ErroCarregar, MensagemErro } from '@/components/EstadoTela/EstadoTela';
import styles from './VerTodosPage.module.css';

const MAX_NOME = 50;
const MAX_TEXTO_CARD = 200;

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

// Níveis de avaliação (a avaliação atual de um card é a mais recente)
const NIVEIS = {
  dificil: { label: 'Difícil', tag: styles.tagDificil, chip: styles.chipDificil },
  bom:     { label: 'Bom',     tag: styles.tagBom,     chip: styles.chipBom },
  facil:   { label: 'Fácil',   tag: styles.tagFacil,   chip: styles.chipFacil },
};
const FILTROS = [
  { key: 'todos',        label: 'Todos',        chip: styles.chipTodos },
  { key: 'dificil',      label: 'Difícil',      chip: styles.chipDificil },
  { key: 'bom',          label: 'Bom',          chip: styles.chipBom },
  { key: 'facil',        label: 'Fácil',        chip: styles.chipFacil },
  { key: 'nao-avaliado', label: 'Não avaliado', chip: styles.chipNaoAvaliado },
];

// Busca sem diferenciar maiúsculas nem acentos ("matematica" acha "Matemática")
const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

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

// Trecho do verso ao redor do termo, para cards que só batem pelo verso
const trecho = (texto, termo) => {
  const i = normalizar(texto).indexOf(normalizar(termo));
  if (i === -1) return texto;
  const ini = Math.max(0, i - 30);
  const fim = Math.min(texto.length, i + termo.length + 30);
  return `${ini > 0 ? '…' : ''}${texto.slice(ini, fim)}${fim < texto.length ? '…' : ''}`;
};

const PALETTE = ['#F87171','#FB923C','#FBBF24','#4ADE80','#60A5FA','#818CF8','#C084FC','#F472B6','#34D399'];
function getColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

// Div clicável que também abre com Enter/Espaço
const ativarComTeclado = (acao) => (e) => {
  if (e.target !== e.currentTarget) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    acao();
  }
};

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

  // O nível atual vem da URL: o botão Voltar do navegador sobe um nível e recarregar mantém a tela
  const ldId = learnDeckId ? Number(learnDeckId) : null;
  const dkId = deckId ? Number(deckId) : null;
  const nivel = dkId ? 'cards' : ldId ? 'decks' : 'learndecks';

  // Busca e filtro também ficam na URL
  const termo = params.get('q') ?? '';
  const filtro = FILTROS.some((f) => f.key === params.get('nota')) ? params.get('nota') : 'todos';
  const buscando = termo.trim().length > 0;

  const atualizarParams = (novos) => {
    const p = new URLSearchParams(params);
    Object.entries(novos).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p, { replace: true });
  };

  const [zoomCard, setZoomCard] = useState(null);
  const [zoomRevealed, setZoomRevealed] = useState(false);

  // editModal: { type: 'learndeck'|'deck'|'flashcard', id, deckId?, nome?, frente?, verso? }
  const [editModal, setEditModal] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');

  // confirmacao: { tipo, id, deckId?, nome, decks, cards }
  const [confirmacao, setConfirmacao] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');

  const learnDeck = mainDecks.find((m) => m.id === ldId);
  const deck = decks.find((d) => d.id === dkId && d.mainDeckId === ldId);
  const naoEncontrado = dadosCarregados && ((ldId && !learnDeck) || (dkId && !deck));

  const nomeLearnDeck = (id) => mainDecks.find((m) => m.id === id)?.nome ?? '';

  // Todos os cards com o caminho até eles (para busca, edição e exclusão)
  const todosCards = useMemo(
    () => decks.flatMap((d) => d.cards.map((c, i) => ({
      ...c, posicao: i + 1, deckId: d.id, deckNome: d.nome, mainDeckId: d.mainDeckId,
    }))),
    [decks],
  );

  const casa = (texto) => normalizar(texto).includes(normalizar(termo.trim()));
  const nivelDoCard = (card) => cardRatings[card.id] ?? null;
  const passaFiltro = (card) =>
    filtro === 'todos' || (filtro === 'nao-avaliado' ? !nivelDoCard(card) : nivelDoCard(card) === filtro);

  // ── O que aparece em cada nível ──
  const learnDecksVisiveis = nivel === 'learndecks'
    ? mainDecks.filter((m) => !buscando || casa(m.nome))
    : [];

  const decksDoEscopo = nivel === 'learndecks' ? decks : decks.filter((d) => d.mainDeckId === ldId);
  const decksVisiveis = nivel === 'cards' ? [] : decksDoEscopo.filter((d) => !buscando || casa(d.nome));

  const cardsDoEscopo = nivel === 'cards'
    ? todosCards.filter((c) => c.deckId === dkId)
    : nivel === 'decks' ? todosCards.filter((c) => c.mainDeckId === ldId) : todosCards;
  // Cards aparecem dentro de um deck, ou nos resultados de busca dos outros níveis
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

  const caminhoPai = nivel === 'cards' ? `/app/decks/${ldId}` : '/app/decks';

  const limparBusca = () => atualizarParams({ q: null, nota: null });

  // ── Exclusão (mostra quantos itens vão junto) ──
  const pedirExclusaoMainDeck = (e, md) => {
    e.stopPropagation();
    const filhos = decks.filter((d) => d.mainDeckId === md.id);
    const cards = filhos.reduce((soma, d) => soma + d.cards.length, 0);
    setErroExclusao('');
    setConfirmacao({ tipo: 'learndeck', id: md.id, nome: md.nome, decks: filhos.length, cards });
  };

  const pedirExclusaoDeck = (e, d) => {
    e.stopPropagation();
    setErroExclusao('');
    setConfirmacao({ tipo: 'deck', id: d.id, nome: d.nome, decks: 0, cards: d.cards.length });
  };

  const pedirExclusaoCard = (card) => {
    setErroExclusao('');
    setConfirmacao({ tipo: 'flashcard', id: card.id, deckId: card.deckId, nome: card.frente, decks: 0, cards: 0 });
  };

  const confirmarExclusao = async () => {
    if (!confirmacao || excluindo) return;
    setExcluindo(true);
    setErroExclusao('');
    try {
      if (confirmacao.tipo === 'learndeck') await deleteMainDeck(confirmacao.id);
      else if (confirmacao.tipo === 'deck') await deleteDeck(confirmacao.id);
      else {
        await deleteCard(confirmacao.deckId, confirmacao.id);
        if (zoomCard?.id === confirmacao.id) setZoomCard(null);
      }
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
      return `Isso apagará ${plural(confirmacao.decks, 'deck', 'decks')} e ${plural(confirmacao.cards, 'flashcard', 'flashcards')}.`;
    }
    if (confirmacao.tipo === 'deck') {
      return confirmacao.cards === 0
        ? 'O deck está vazio.'
        : `Isso apagará ${plural(confirmacao.cards, 'flashcard', 'flashcards')}.`;
    }
    return 'O card e o histórico de avaliações dele serão apagados.';
  };

  // ── Edição ──
  const abrirEdicao = (dados) => {
    setErroEdicao('');
    setEditModal(dados);
  };

  const openEditMainDeck = (e, md) => {
    e.stopPropagation();
    abrirEdicao({ type: 'learndeck', id: md.id, nome: md.nome });
  };

  const openEditDeck = (e, d) => {
    e.stopPropagation();
    abrirEdicao({ type: 'deck', id: d.id, nome: d.nome });
  };

  const openEditCard = (card) => {
    abrirEdicao({ type: 'flashcard', id: card.id, deckId: card.deckId, frente: card.frente, verso: card.verso });
  };

  const edicaoValida = editModal && (editModal.type === 'flashcard'
    ? editModal.frente.trim() && editModal.verso.trim()
    : editModal.nome.trim());

  const handleSaveEdit = async () => {
    if (!edicaoValida || salvandoEdicao) return;
    setSalvandoEdicao(true);
    setErroEdicao('');
    try {
      if (editModal.type === 'learndeck') {
        await updateMainDeck(editModal.id, editModal.nome.trim());
      } else if (editModal.type === 'deck') {
        await updateDeck(editModal.id, editModal.nome.trim());
      } else {
        await updateCard(editModal.deckId, editModal.id, editModal.frente.trim(), editModal.verso.trim());
      }
      setEditModal(null);
    } catch (err) {
      setErroEdicao(err.message);
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const openZoom = (card) => {
    setZoomCard(card);
    setZoomRevealed(false);
  };

  // ── Cabeçalho ──
  const itensBreadcrumb = [
    { label: 'Seus LearnDecks', to: '/app/decks' },
    ...(learnDeck ? [{ label: learnDeck.nome, to: `/app/decks/${learnDeck.id}` }] : []),
    ...(deck ? [{ label: deck.nome }] : []),
  ];

  const tituloNivel = { learndecks: 'Seus LearnDecks', decks: learnDeck?.nome ?? '', cards: deck?.nome ?? '' }[nivel];

  const placeholderBusca = {
    learndecks: 'Buscar LearnDecks, decks e cards...',
    decks: `Buscar decks e cards em ${learnDeck?.nome ?? 'este LearnDeck'}...`,
    cards: 'Buscar na frente ou no verso dos cards...',
  }[nivel];

  const irParaCriar = () => navigate(
    nivel === 'cards' ? `/criar/flashcard?deck=${dkId}`
      : nivel === 'decks' ? `/criar/deck?learndeck=${ldId}`
      : '/criar/learndeck',
  );

  // ── Peças da lista ──
  const renderLearnDeck = (md, i) => {
    const qtdDecks = decks.filter((d) => d.mainDeckId === md.id).length;
    const abrir = () => navigate(`/app/decks/${md.id}`);
    return (
      <div
        key={md.id}
        className={styles.albumTile}
        onClick={abrir}
        onKeyDown={ativarComTeclado(abrir)}
        role="button"
        tabIndex={0}
        aria-label={`Abrir LearnDeck ${md.nome}`}
        style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}
      >
        <div className={styles.albumCover} style={{ background: getColor(md.nome) }}>
          <span className={styles.albumInitial}>{md.nome[0]?.toUpperCase()}</span>
        </div>
        <div className={styles.albumInfo}>
          <span className={styles.albumName}><Destaque texto={md.nome} termo={termo.trim()} /></span>
          <span className={styles.albumMeta}>{plural(qtdDecks, 'deck', 'decks')}</span>
        </div>
        <div className={styles.albumActions}>
          <button className={styles.tileEditBtn} onClick={(e) => openEditMainDeck(e, md)} title="Editar" aria-label={`Editar ${md.nome}`}>✎</button>
          <button className={styles.tileDeleteBtn} onClick={(e) => pedirExclusaoMainDeck(e, md)} title="Excluir" aria-label={`Excluir ${md.nome}`}>✕</button>
        </div>
      </div>
    );
  };

  const renderDeck = (d, i) => {
    const abrir = () => navigate(`/app/decks/${d.mainDeckId}/${d.id}`);
    return (
      <div
        key={d.id}
        className={styles.albumTile}
        onClick={abrir}
        onKeyDown={ativarComTeclado(abrir)}
        role="button"
        tabIndex={0}
        aria-label={`Abrir deck ${d.nome}`}
        style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}
      >
        <div className={styles.albumCover} style={{ background: getColor(d.nome) }}>
          <span className={styles.albumInitial}>{d.nome[0]?.toUpperCase()}</span>
        </div>
        <div className={styles.albumInfo}>
          <span className={styles.albumName}><Destaque texto={d.nome} termo={termo.trim()} /></span>
          <span className={styles.albumMeta}>
            {nivel === 'learndecks' && `${nomeLearnDeck(d.mainDeckId)} · `}
            {plural(d.cards.length, 'card', 'cards')}
          </span>
        </div>
        <div className={styles.albumActions}>
          <button className={styles.tileEditBtn} onClick={(e) => openEditDeck(e, d)} title="Editar" aria-label={`Editar ${d.nome}`}>✎</button>
          <button className={styles.tileDeleteBtn} onClick={(e) => pedirExclusaoDeck(e, d)} title="Excluir" aria-label={`Excluir ${d.nome}`}>✕</button>
        </div>
      </div>
    );
  };

  const renderCard = (card, i) => {
    const nivelCard = nivelDoCard(card);
    const info = nivelCard ? NIVEIS[nivelCard] : null;
    const soNoVerso = buscando && !casa(card.frente) && casa(card.verso);
    return (
      <div
        key={card.id}
        className={styles.flashCard}
        onClick={() => openZoom(card)}
        onKeyDown={ativarComTeclado(() => openZoom(card))}
        role="button"
        tabIndex={0}
        aria-label={`Ver card: ${card.frente}`}
        style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
      >
        <div className={styles.cardTopo}>
          <span className={`${styles.tagNivel} ${info ? info.tag : styles.tagNaoAvaliado}`}>
            {info ? info.label : 'Não avaliado'}
          </span>
          <div className={styles.cardActions}>
            <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); openEditCard(card); }} title="Editar" aria-label="Editar card">✎</button>
            <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); pedirExclusaoCard(card); }} title="Excluir" aria-label="Excluir card">✕</button>
          </div>
        </div>
        {nivel !== 'cards' && (
          <span className={styles.cardCaminho}>{nomeLearnDeck(card.mainDeckId)} › {card.deckNome}</span>
        )}
        <p className={styles.flashName}><Destaque texto={card.frente} termo={termo.trim()} /></p>
        {soNoVerso && (
          <p className={styles.cardTrecho}>
            Verso: <Destaque texto={trecho(card.verso, termo.trim())} termo={termo.trim()} />
          </p>
        )}
        <span className={styles.cardHint}>
          {nivel === 'cards' ? `#${card.posicao} · ` : ''}Clique para ver →
        </span>
      </div>
    );
  };

  const chipsFiltro = (
    <div className={styles.filterChips} role="group" aria-label="Filtrar por avaliação">
      {FILTROS.map(({ key, label, chip }) => (
        <button
          key={key}
          className={`${styles.chip} ${chip} ${filtro === key ? styles.chipActive : ''}`}
          onClick={() => atualizarParams({ nota: key === 'todos' ? null : key })}
          aria-pressed={filtro === key}
        >
          {label}
          <span className={styles.chipCount}>{contagemFiltro(key)}</span>
        </button>
      ))}
    </div>
  );

  const semResultados = (
    <div className={styles.emptyState}>
      <p className={styles.emptyMsg}>
        {buscando ? `Nada encontrado para “${termo.trim()}”` : 'Nenhum card com essa avaliação.'}
        {buscando && filtro !== 'todos' && ' com esse filtro'}
      </p>
      <button className={styles.emptyBtn} onClick={limparBusca}>Limpar busca e filtro</button>
    </div>
  );

  const conteudo = () => {
    if (!dadosCarregados) {
      return erroDados
        ? <ErroCarregar mensagem={erroDados} onTentar={recarregarDados} />
        : <Carregando texto="Carregando seus LearnDecks..." />;
    }

    if (naoEncontrado) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyMsg}>Este {dkId ? 'deck' : 'LearnDeck'} não foi encontrado. Ele pode ter sido excluído.</p>
          <button className={styles.emptyBtn} onClick={() => navigate('/app/decks')}>Ir para Seus LearnDecks</button>
        </div>
      );
    }

    if (nivelVazio) {
      const msg = {
        learndecks: 'Você ainda não tem LearnDecks.',
        decks: 'Este LearnDeck ainda não tem decks.',
        cards: 'Este deck ainda não tem cards.',
      }[nivel];
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyMsg}>{msg}</p>
          <button className={styles.emptyBtn} onClick={irParaCriar}>Criar agora</button>
        </div>
      );
    }

    // Dentro de um deck: só cards (com busca e filtro)
    if (nivel === 'cards') {
      return (
        <>
          {chipsFiltro}
          {cardsVisiveis.length === 0
            ? semResultados
            : <div className={styles.flashGrid}>{cardsVisiveis.map(renderCard)}</div>}
        </>
      );
    }

    // Sem busca: só o nível atual
    if (!buscando) {
      return nivel === 'learndecks'
        ? <div className={styles.albumGrid}>{learnDecksVisiveis.map(renderLearnDeck)}</div>
        : <div className={styles.albumGrid}>{decksVisiveis.map(renderDeck)}</div>;
    }

    // Com busca: resultados agrupados
    const total = learnDecksVisiveis.length + decksVisiveis.length + cardsPorTexto.length;
    if (total === 0) return semResultados;

    return (
      <div className={styles.resultados}>
        {nivel === 'learndecks' && learnDecksVisiveis.length > 0 && (
          <section aria-label="LearnDecks encontrados">
            <h3 className={styles.grupoTitulo}>LearnDecks ({learnDecksVisiveis.length})</h3>
            <div className={styles.albumGrid}>{learnDecksVisiveis.map(renderLearnDeck)}</div>
          </section>
        )}
        {decksVisiveis.length > 0 && (
          <section aria-label="Decks encontrados">
            <h3 className={styles.grupoTitulo}>Decks ({decksVisiveis.length})</h3>
            <div className={styles.albumGrid}>{decksVisiveis.map(renderDeck)}</div>
          </section>
        )}
        {cardsPorTexto.length > 0 && (
          <section aria-label="Cards encontrados">
            <h3 className={styles.grupoTitulo}>Cards ({cardsVisiveis.length})</h3>
            {chipsFiltro}
            {cardsVisiveis.length === 0
              ? <p className={styles.noResults}>Nenhum card com essa avaliação.</p>
              : <div className={styles.flashGrid}>{cardsVisiveis.map(renderCard)}</div>}
          </section>
        )}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.mainCard}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {nivel !== 'learndecks' && (
              <button className={styles.backBtn} onClick={() => navigate(caminhoPai)}>← Voltar</button>
            )}
          </div>

          <div className={styles.headerCenter}>
            {nivel !== 'learndecks' && (
              <Breadcrumb className={styles.breadcrumbClaro} itens={itensBreadcrumb} />
            )}
            <h2 className={styles.headerTitle}>{tituloNivel}</h2>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.headerActions}>
              {!naoEncontrado && (
                <button className={styles.createBtn} onClick={irParaCriar}>
                  {{ learndecks: '+ LearnDeck', decks: '+ Deck', cards: '+ Cards' }[nivel]}
                </button>
              )}
              {nivel === 'cards' && deck && deck.cards.length > 0 && (
                <button
                  className={styles.playBtn}
                  onClick={() => navigate(`/memorizar/${dkId}`)}
                  title="Estudar este deck"
                  aria-label="Estudar este deck"
                >▶</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Busca ── */}
        {dadosCarregados && !naoEncontrado && !nivelVazio && (
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon} aria-hidden="true">⌕</span>
              <input
                className={styles.searchInput}
                type="search"
                placeholder={placeholderBusca}
                aria-label={placeholderBusca}
                value={termo}
                onChange={(e) => atualizarParams({ q: e.target.value })}
              />
              {termo && (
                <button className={styles.searchClear} onClick={() => atualizarParams({ q: null })} aria-label="Limpar busca">✕</button>
              )}
            </div>
          </div>
        )}

        {/* ── Conteúdo ── */}
        <div className={styles.gridWrapper}>{conteudo()}</div>
      </div>

      {/* ── Card aberto ── */}
      {zoomCard && (
        <div className={styles.zoomOverlay} onClick={() => setZoomCard(null)}>
          <div className={styles.zoomModal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Card">
            <div className={styles.zoomHeader}>
              <span className={styles.zoomIndex}>{nomeLearnDeck(zoomCard.mainDeckId)} › {zoomCard.deckNome}</span>
              <div className={styles.zoomHeaderActions}>
                <button className={styles.zoomEditBtn} onClick={() => { setZoomCard(null); openEditCard(zoomCard); }}>
                  ✎ Editar
                </button>
                <button className={styles.zoomDeleteBtn} onClick={() => pedirExclusaoCard(zoomCard)}>
                  Excluir
                </button>
                <button className={styles.zoomCloseBtn} onClick={() => setZoomCard(null)} aria-label="Fechar">✕</button>
              </div>
            </div>

            <div className={styles.zoomBody}>
              <div className={styles.zoomFrente}>
                <span className={styles.zoomSideLabel}>Frente</span>
                <p className={styles.zoomText}>{zoomCard.frente}</p>
              </div>

              {!zoomRevealed ? (
                <button className={styles.revealBtn} onClick={() => setZoomRevealed(true)}>
                  Mostrar verso
                </button>
              ) : (
                <div className={styles.zoomVerso}>
                  <span className={styles.zoomSideLabelVerso}>Verso</span>
                  <p className={styles.zoomTextVerso}>{zoomCard.verso}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edição ── */}
      {editModal && (
        <div className={styles.modalOverlay} onClick={() => setEditModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="titulo-edicao">

            <div className={styles.modalHeader}>
              <h3 id="titulo-edicao" className={styles.modalTitle}>
                {editModal.type === 'flashcard' ? 'Editar Flashcard'
                  : editModal.type === 'deck' ? 'Editar Deck'
                  : 'Editar LearnDeck'}
              </h3>
              <button className={styles.modalClose} onClick={() => setEditModal(null)} aria-label="Fechar">✕</button>
            </div>

            <div className={styles.modalBody}>
              {editModal.type === 'flashcard' ? (
                <>
                  <label className={styles.modalLabel} htmlFor="editar-frente">Frente</label>
                  <textarea
                    id="editar-frente"
                    className={styles.modalTextarea}
                    value={editModal.frente}
                    onChange={(e) => setEditModal((m) => ({ ...m, frente: e.target.value.slice(0, MAX_TEXTO_CARD) }))}
                    placeholder="Frente do card..."
                    maxLength={MAX_TEXTO_CARD}
                    rows={3}
                  />
                  <span className={styles.modalContador}>{editModal.frente.length}/{MAX_TEXTO_CARD}</span>
                  <label className={styles.modalLabel} htmlFor="editar-verso">Verso</label>
                  <textarea
                    id="editar-verso"
                    className={`${styles.modalTextarea} ${styles.modalTextareaVerso}`}
                    value={editModal.verso}
                    onChange={(e) => setEditModal((m) => ({ ...m, verso: e.target.value.slice(0, MAX_TEXTO_CARD) }))}
                    placeholder="Verso do card..."
                    maxLength={MAX_TEXTO_CARD}
                    rows={3}
                  />
                  <span className={styles.modalContador}>{editModal.verso.length}/{MAX_TEXTO_CARD}</span>
                </>
              ) : (
                <>
                  <label className={styles.modalLabel} htmlFor="editar-nome">Nome</label>
                  <input
                    id="editar-nome"
                    className={styles.modalInput}
                    value={editModal.nome}
                    onChange={(e) => setEditModal((m) => ({ ...m, nome: e.target.value.slice(0, MAX_NOME) }))}
                    placeholder="Nome..."
                    maxLength={MAX_NOME}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    autoFocus
                  />
                  <span className={styles.modalContador}>{editModal.nome.length}/{MAX_NOME}</span>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setEditModal(null)}>Cancelar</button>
              <button className={styles.modalSave} onClick={handleSaveEdit} disabled={!edicaoValida || salvandoEdicao}>
                {salvandoEdicao ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
            {erroEdicao && <div className={styles.modalErro}><MensagemErro>{erroEdicao}</MensagemErro></div>}
          </div>
        </div>
      )}

      {/* ── Confirmação de exclusão ── */}
      {confirmacao && (
        <Dialogo
          icone="🗑️"
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
