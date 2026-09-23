import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Dialogo from '@/components/Dialogo/Dialogo';
import { Carregando, ErroCarregar, MensagemErro } from '@/components/EstadoTela/EstadoTela';
import styles from './CriarFlashcardPage.module.css';

const MAX = 200;
const MAX_CARDS = 5; // por vez nesta tela; não limita o tamanho do deck

let proximaChave = 0;
const linhaVazia = () => ({ chave: `card-${++proximaChave}`, frente: '', verso: '' });

const CriarFlashcardPage = () => {
  const { mainDecks, decks, createCards, dadosCarregados, erroDados, recarregarDados } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const deckDaUrl = Number(params.get('deck')) || null;

  const [deckId, setDeckId] = useState(deckDaUrl);
  const [linhas, setLinhas] = useState(() => [linhaVazia()]);
  const [selecionada, setSelecionada] = useState(0);
  const [lado, setLado] = useState('frente');
  const [virando, setVirando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [salvos, setSalvos] = useState(null); // quantidade salva: abre o "Deseja prosseguir?"
  const listaRef = useRef(null);

  // Os decks chegam do servidor depois da primeira renderização (ex.: ao recarregar a página)
  useEffect(() => {
    if (!dadosCarregados || decks.length === 0) return;
    if (!decks.some((d) => d.id === deckId)) {
      const daUrl = decks.find((d) => d.id === deckDaUrl);
      setDeckId((daUrl ?? decks[0]).id);
    }
  }, [dadosCarregados, decks, deckId, deckDaUrl]);

  const deck = decks.find((d) => d.id === deckId);
  const learnDeck = mainDecks.find((md) => md.id === deck?.mainDeckId);

  const completas = linhas.filter((l) => l.frente.trim() && l.verso.trim());
  const incompletas = linhas
    .map((l, i) => ({ ...l, numero: i + 1 }))
    .filter((l) => Boolean(l.frente.trim()) !== Boolean(l.verso.trim()));

  const atual = linhas[selecionada] ?? linhas[0];

  const alterar = (i, campo, valor) => {
    const cortado = valor.slice(0, MAX);
    setLinhas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [campo]: cortado } : l)));
    setErro('');
  };

  // Ao digitar num campo, a prévia mostra aquele card e aquele lado
  const focar = (i, campo) => {
    setSelecionada(i);
    setLado(campo);
  };

  const adicionar = () => {
    if (linhas.length >= MAX_CARDS) return;
    setLinhas((prev) => [...prev, linhaVazia()]);
    setSelecionada(linhas.length);
    setLado('frente');
    // foca a frente do card novo depois de renderizar
    requestAnimationFrame(() => {
      listaRef.current?.querySelectorAll('textarea[data-campo="frente"]')[linhas.length]?.focus();
    });
  };

  const remover = (i) => {
    setLinhas((prev) => prev.filter((_, idx) => idx !== i));
    setSelecionada((s) => Math.max(0, s >= i ? s - 1 : s));
  };

  const virar = () => {
    setVirando(true);
    setTimeout(() => {
      setLado((l) => (l === 'frente' ? 'verso' : 'frente'));
      setVirando(false);
    }, 180);
  };

  const salvar = async () => {
    if (incompletas.length > 0) {
      setErro(`Preencha a frente e o verso do card ${incompletas.map((l) => l.numero).join(', ')}.`);
      return;
    }
    if (completas.length === 0 || !deckId || salvando) return;
    setErro('');
    setSalvando(true);
    try {
      const novos = await createCards(
        deckId,
        completas.map((l) => ({ frente: l.frente.trim(), verso: l.verso.trim() })),
      );
      setSalvos(novos.length);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const adicionarMais = () => {
    setSalvos(null);
    setLinhas([linhaVazia()]);
    setSelecionada(0);
    setLado('frente');
  };

  const header = (
    <header className={styles.header}>
      <button className={styles.backBtn} onClick={() => navigate('/app/criar')}>Voltar</button>
      <div className={styles.steps} aria-hidden="true">
        <span className={styles.stepDone}>✓</span>
        <span className={styles.stepDivider}>—</span>
        <span className={styles.stepDone}>✓</span>
        <span className={styles.stepDivider}>—</span>
        <span className={styles.stepActive}>3</span>
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
          : <Carregando texto="Carregando seus decks..." />}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className={styles.page}>
        {header}
        <main className={styles.vazio}>
          <p className={styles.vazioMsg}>Você precisa criar um Deck antes de criar Flashcards.</p>
          <button className={styles.botaoPrincipal} onClick={() => navigate('/criar/deck')}>
            Criar Deck
          </button>
        </main>
      </div>
    );
  }

  const textoPrevia = lado === 'frente' ? atual.frente : atual.verso;
  const tamanhoPrevia = textoPrevia.length > 120 ? styles.textoPequeno : textoPrevia.length > 60 ? styles.textoMedio : '';

  return (
    <div className={styles.page}>
      {header}

      <div className={styles.layout}>
        <div className={styles.topo}>
          <Breadcrumb
            itens={[
              { label: 'Criar', to: '/app/criar' },
              { label: learnDeck?.nome ?? 'LearnDeck' },
              { label: deck?.nome ?? 'Deck' },
              { label: 'Novos cards' },
            ]}
          />
          <p className={styles.stepLabel}>Passo 3 de 3 · Flashcards</p>
          <h1 className={styles.title}>Crie seus Flashcards</h1>

          <div className={styles.deckRow}>
            <label className={styles.deckLabel} htmlFor="deck-destino">Deck</label>
            <select
              id="deck-destino"
              className={styles.deckSelect}
              value={deckId ?? ''}
              onChange={(e) => setDeckId(Number(e.target.value))}
            >
              {mainDecks.map((md) => {
                const filhos = decks.filter((d) => d.mainDeckId === md.id);
                if (filhos.length === 0) return null;
                return (
                  <optgroup key={md.id} label={md.nome}>
                    {filhos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                  </optgroup>
                );
              })}
            </select>
          </div>
        </div>

        {/* ── Lista de até 5 cards ── */}
        <section className={styles.lista} ref={listaRef} aria-label="Cards a criar">
          {linhas.map((linha, i) => (
            <div
              key={linha.chave}
              className={`${styles.linha} ${i === selecionada ? styles.linhaAtiva : ''}`}
            >
              <div className={styles.linhaTopo}>
                <span className={styles.numero}>{i + 1}</span>
                <span className={styles.linhaTitulo}>Card {i + 1}</span>
                {linhas.length > 1 && (
                  <button
                    type="button"
                    className={styles.remover}
                    onClick={() => remover(i)}
                    aria-label={`Remover card ${i + 1}`}
                  >
                    Remover
                  </button>
                )}
              </div>

              {['frente', 'verso'].map((campo) => (
                <div key={campo} className={styles.campo}>
                  <label className={styles.campoLabel} htmlFor={`${linha.chave}-${campo}`}>
                    {campo === 'frente' ? 'Frente' : 'Verso'}
                  </label>
                  <textarea
                    id={`${linha.chave}-${campo}`}
                    data-campo={campo}
                    className={`${styles.textarea} ${campo === 'verso' ? styles.textareaVerso : ''}`}
                    placeholder={campo === 'frente' ? 'Ex: O que é seno?' : 'Ex: Cateto oposto ÷ hipotenusa'}
                    maxLength={MAX}
                    rows={2}
                    value={linha[campo]}
                    onChange={(e) => alterar(i, campo, e.target.value)}
                    onFocus={() => focar(i, campo)}
                    autoFocus={i === 0 && campo === 'frente'}
                  />
                  <span className={`${styles.contador} ${linha[campo].length >= MAX ? styles.contadorLimite : ''}`}>
                    {linha[campo].length}/{MAX}
                  </span>
                </div>
              ))}
            </div>
          ))}

          <button
            type="button"
            className={styles.adicionar}
            onClick={adicionar}
            disabled={linhas.length >= MAX_CARDS}
          >
            {linhas.length >= MAX_CARDS
              ? `Limite de ${MAX_CARDS} cards por vez`
              : `+ Adicionar card (${linhas.length} de ${MAX_CARDS})`}
          </button>
        </section>

        {/* ── Prévia do card selecionado ── */}
        <aside className={styles.previa} aria-label="Prévia do card">
          <p className={styles.previaTitulo}>Prévia do card {selecionada + 1}</p>
          <div
            className={`${styles.cartao} ${lado === 'verso' ? styles.cartaoVerso : ''} ${virando ? styles.virando : ''}`}
            aria-live="polite"
          >
            <span className={styles.cartaoLado}>{lado === 'frente' ? 'Frente' : 'Verso'}</span>
            <p className={`${styles.cartaoTexto} ${tamanhoPrevia} ${!textoPrevia ? styles.cartaoVazio : ''}`}>
              {textoPrevia || (lado === 'frente' ? 'A frente do card aparece aqui' : 'O verso do card aparece aqui')}
            </p>
          </div>
          <button type="button" className={styles.virar} onClick={virar}>
            ↻ Virar
          </button>
        </aside>

        <div className={styles.rodape}>
          <MensagemErro>{erro}</MensagemErro>
          <button
            type="button"
            className={styles.botaoPrincipal}
            onClick={salvar}
            disabled={completas.length === 0 || salvando}
          >
            {salvando
              ? 'Salvando...'
              : completas.length <= 1 ? 'Salvar card' : `Salvar ${completas.length} cards`}
          </button>
        </div>
      </div>

      {salvos !== null && (
        <Dialogo
          icone="🎉"
          titulo={salvos === 1 ? '1 card salvo!' : `${salvos} cards salvos!`}
          onFechar={adicionarMais}
          acoes={[
            { label: 'Adicionar mais cards', variante: 'primario', onClick: adicionarMais },
            { label: 'Estudar este deck', variante: 'secundario', onClick: () => navigate(`/memorizar/${deckId}`) },
            { label: 'Concluir', variante: 'texto', onClick: () => navigate('/app/criar') },
          ]}
        >
          <p>
            Adicionados a {learnDeck?.nome ? `${learnDeck.nome} › ` : ''}{deck?.nome}
            {' '}(agora com {deck?.cards.length ?? 0} {deck?.cards.length === 1 ? 'card' : 'cards'}).
            Deseja prosseguir?
          </p>
        </Dialogo>
      )}
    </div>
  );
};

export default CriarFlashcardPage;
