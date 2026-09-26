import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Carregando, ErroCarregar, MensagemErro } from '@/components/EstadoTela/EstadoTela';
import styles from './CriarFlashcardPage.module.css';

const MAX = 200; // mesmo limite do banco
const LOTE = 5;  // o servidor aceita até 5 cards por requisição

// "pergunta ; resposta" ou "pergunta<TAB>resposta" (colado do Excel/Planilhas)
const lerLista = (texto) => {
  const validos = [];
  const invalidos = [];
  texto.split(/\r?\n/).forEach((linha, i) => {
    if (!linha.trim()) return;
    const sep = linha.includes('\t') ? '\t' : ';';
    const pos = linha.indexOf(sep);
    const frente = pos >= 0 ? linha.slice(0, pos).trim() : '';
    const verso = pos >= 0 ? linha.slice(pos + 1).trim() : '';
    if (!frente || !verso) invalidos.push({ linha: i + 1, texto: linha, motivo: 'falta o ";" entre pergunta e resposta' });
    else if (frente.length > MAX || verso.length > MAX) invalidos.push({ linha: i + 1, texto: linha, motivo: `passa de ${MAX} caracteres` });
    else validos.push({ frente, verso });
  });
  return { validos, invalidos };
};

const CriarFlashcardPage = () => {
  const { mainDecks, decks, createCards, updateCard, deleteCard, dadosCarregados, erroDados, recarregarDados } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const deckDaUrl = Number(params.get('deck')) || null;

  const [deckId, setDeckId] = useState(deckDaUrl);
  const [frente, setFrente] = useState('');
  const [verso, setVerso] = useState('');
  const [lado, setLado] = useState('frente');
  const [editando, setEditando] = useState(null); // card salvo sendo corrigido
  const [criados, setCriados] = useState([]); // { id, frente, verso, deckId } desta visita, mais novo primeiro
  const [recente, setRecente] = useState(null); // id do último salvo (animação na pilha)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [listaAberta, setListaAberta] = useState(false);
  const [textoLista, setTextoLista] = useState('');
  const [importando, setImportando] = useState(false);
  const frenteRef = useRef(null);
  const versoRef = useRef(null);

  // Os decks chegam do servidor depois da primeira renderização (ex.: ao recarregar a página)
  useEffect(() => {
    if (!dadosCarregados || decks.length === 0) return;
    if (!decks.some((d) => d.id === deckId)) {
      const daUrl = decks.find((d) => d.id === deckDaUrl);
      setDeckId((daUrl ?? decks[0]).id);
    }
  }, [dadosCarregados, decks, deckId, deckDaUrl]);

  // O campo do lado visível sempre recebe o foco (depois da animação de virar)
  useEffect(() => {
    const t = setTimeout(() => (lado === 'frente' ? frenteRef : versoRef).current?.focus(), 260);
    return () => clearTimeout(t);
  }, [lado, editando]);

  const deck = decks.find((d) => d.id === deckId);
  const learnDeck = mainDecks.find((md) => md.id === deck?.mainDeckId);
  const daSessao = criados.filter((c) => c.deckId === deckId);
  const lista = lerLista(textoLista);

  const limpar = () => {
    setFrente('');
    setVerso('');
    setEditando(null);
    setLado('frente');
    setErro('');
  };

  const virar = () => {
    if (lado === 'frente' && !frente.trim()) {
      setErro('Escreva a pergunta antes de virar o card.');
      return;
    }
    setErro('');
    setLado((l) => (l === 'frente' ? 'verso' : 'frente'));
  };

  const salvar = async () => {
    if (salvando || !deckId) return;
    const f = frente.trim();
    const v = verso.trim();
    if (!f) { setLado('frente'); setErro('Escreva a pergunta na frente do card.'); return; }
    if (!v) { setLado('verso'); setErro('Escreva a resposta no verso do card.'); return; }
    setSalvando(true);
    setErro('');
    try {
      if (editando) {
        await updateCard(editando.deckId, editando.id, f, v);
        setCriados((prev) => prev.map((c) => (c.id === editando.id ? { ...c, frente: f, verso: v } : c)));
        setRecente(editando.id);
      } else {
        const [novo] = await createCards(deckId, [{ frente: f, verso: v }]);
        setCriados((prev) => [{ ...novo, deckId }, ...prev]);
        setRecente(novo.id);
      }
      limpar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  // Enter na frente vira; Enter no verso salva; Shift+Enter quebra a linha; Esc volta para a frente
  const teclas = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (lado === 'frente') virar();
      else salvar();
    } else if (e.key === 'Escape' && lado === 'verso') {
      e.preventDefault();
      setLado('frente');
    }
  };

  const editar = (card) => {
    setEditando(card);
    setFrente(card.frente);
    setVerso(card.verso);
    setLado('frente');
    setErro('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const excluir = async (card) => {
    try {
      await deleteCard(card.deckId, card.id);
      setCriados((prev) => prev.filter((c) => c.id !== card.id));
      if (editando?.id === card.id) limpar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setConfirmandoExclusao(null);
    }
  };

  // Cria os cards da lista em grupos de 5; para no primeiro erro e mantém o que faltou
  const importar = async () => {
    if (!deckId || lista.validos.length === 0 || importando) return;
    setImportando(true);
    setErro('');
    const pendentes = [...lista.validos];
    let criadosAgora = 0;
    try {
      while (pendentes.length) {
        const grupo = pendentes.slice(0, LOTE);
        const novos = await createCards(deckId, grupo);
        pendentes.splice(0, grupo.length);
        criadosAgora += novos.length;
        setCriados((prev) => [...novos.map((n) => ({ ...n, deckId })).reverse(), ...prev]);
      }
      // As linhas com problema ficam no campo para corrigir
      const sobras = lista.invalidos.map((i) => i.texto).join('\n');
      setTextoLista(sobras);
      setListaAberta(!!sobras);
    } catch (err) {
      setErro(`${criadosAgora} ${criadosAgora === 1 ? 'card criado' : 'cards criados'}. Os outros não foram salvos: ${err.message}`);
      setTextoLista(pendentes.map((p) => `${p.frente} ; ${p.verso}`).join('\n'));
    } finally {
      setImportando(false);
    }
  };

  const header = (
    <header className={styles.header}>
      <button className={styles.voltar} onClick={() => navigate(-1)}>← Voltar</button>
      {deck && (
        <label className={styles.deckEscolha}>
          <span className={styles.deckRotulo}>Criando em</span>
          <select
            className={styles.deckSelect}
            value={deckId ?? ''}
            onChange={(e) => { setDeckId(Number(e.target.value)); limpar(); }}
            aria-label="Deck onde os cards serão criados"
          >
            {mainDecks.map((md) => {
              const filhos = decks.filter((d) => d.mainDeckId === md.id);
              if (filhos.length === 0) return null;
              return (
                <optgroup key={md.id} label={md.nome}>
                  {filhos.map((d) => <option key={d.id} value={d.id}>{md.nome} › {d.nome}</option>)}
                </optgroup>
              );
            })}
          </select>
        </label>
      )}
      <span className={styles.espaco} />
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
        <main className={styles.semDeck}>
          <p>Para criar cards, primeiro crie um deck.</p>
          <button className={styles.botaoPrincipal} onClick={() => navigate('/criar/deck')}>Criar deck</button>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {header}

      <main className={styles.layout}>
        {/* ── Mesa: o card sendo escrito ── */}
        <section className={styles.mesa} aria-label="Novo card">
          <div className={styles.mesaTopo}>
            <h1 className={styles.titulo}>{editando ? 'Corrigindo card' : 'Escreva no card'}</h1>
            {editando && (
              <button type="button" className={styles.linkBotao} onClick={limpar}>Cancelar edição</button>
            )}
          </div>

          <div className={`${styles.cena} ${salvando ? styles.saindo : ''}`}>
            <div className={`${styles.card} ${lado === 'verso' ? styles.virado : ''}`}>
              <div className={`${styles.face} ${styles.faceFrente}`} aria-hidden={lado !== 'frente'}>
                <span className={styles.faceRotulo}>Frente <em>pergunta</em></span>
                <textarea
                  ref={frenteRef}
                  className={styles.faceCampo}
                  value={frente}
                  maxLength={MAX}
                  placeholder="Ex.: Qual é o valor do seno de 30°?"
                  onChange={(e) => { setFrente(e.target.value.slice(0, MAX)); setErro(''); }}
                  onKeyDown={teclas}
                  tabIndex={lado === 'frente' ? 0 : -1}
                  aria-label="Frente do card (pergunta)"
                />
                <span className={`${styles.faceContador} ${frente.length >= MAX ? styles.limite : ''}`}>{frente.length}/{MAX}</span>
              </div>
              <div className={`${styles.face} ${styles.faceVerso}`} aria-hidden={lado !== 'verso'}>
                <span className={styles.faceRotulo}>Verso <em>resposta</em></span>
                <p className={styles.faceLembrete} title={frente}>{frente}</p>
                <textarea
                  ref={versoRef}
                  className={styles.faceCampo}
                  value={verso}
                  maxLength={MAX}
                  placeholder="Ex.: 1/2 (ou 0,5)"
                  onChange={(e) => { setVerso(e.target.value.slice(0, MAX)); setErro(''); }}
                  onKeyDown={teclas}
                  tabIndex={lado === 'verso' ? 0 : -1}
                  aria-label="Verso do card (resposta)"
                />
                <span className={`${styles.faceContador} ${verso.length >= MAX ? styles.limite : ''}`}>{verso.length}/{MAX}</span>
              </div>
            </div>
          </div>

          <div className={styles.controles}>
            <button type="button" className={styles.botaoSecundario} onClick={virar}>
              {lado === 'frente' ? 'Virar para o verso' : 'Voltar para a frente'}
            </button>
            <button
              type="button"
              className={styles.botaoPrincipal}
              onClick={salvar}
              disabled={salvando || !frente.trim() || !verso.trim()}
            >
              {salvando ? 'Salvando...' : editando ? 'Salvar correção' : 'Salvar card'}
            </button>
          </div>
          <p className={styles.atalhos}>
            <kbd>Enter</kbd> {lado === 'frente' ? 'vira o card' : 'salva'} · <kbd>Shift</kbd>+<kbd>Enter</kbd> nova linha
            {lado === 'verso' && <> · <kbd>Esc</kbd> volta</>}
          </p>
          <MensagemErro>{erro}</MensagemErro>
          <span className={styles.srOnly} aria-live="polite">{lado === 'frente' ? 'Frente do card' : 'Verso do card'}</span>

          {/* ── Vários de uma vez ── */}
          <div className={styles.lista}>
            <button
              type="button"
              className={styles.listaAbrir}
              onClick={() => setListaAberta((a) => !a)}
              aria-expanded={listaAberta}
            >
              {listaAberta ? '− Fechar lista' : '+ Colar vários cards de uma vez'}
            </button>
            {listaAberta && (
              <div className={styles.listaPainel}>
                <p className={styles.listaAjuda}>
                  Uma linha por card, com <strong>;</strong> separando pergunta e resposta.
                  Também funciona colar duas colunas do Excel ou do Google Planilhas.
                </p>
                <textarea
                  className={styles.listaCampo}
                  value={textoLista}
                  onChange={(e) => setTextoLista(e.target.value)}
                  placeholder={'Seno de 30° ; 1/2\nCosseno de 60° ; 1/2\nTangente de 45° ; 1'}
                  rows={6}
                  aria-label="Lista de cards, um por linha"
                />
                {lista.invalidos.length > 0 && (
                  <ul className={styles.listaErros}>
                    {lista.invalidos.slice(0, 4).map((i) => (
                      <li key={i.linha}>Linha {i.linha}: {i.motivo}</li>
                    ))}
                    {lista.invalidos.length > 4 && <li>e mais {lista.invalidos.length - 4} linhas com problema</li>}
                  </ul>
                )}
                <button
                  type="button"
                  className={styles.botaoPrincipal}
                  onClick={importar}
                  disabled={lista.validos.length === 0 || importando}
                >
                  {importando
                    ? 'Criando...'
                    : lista.validos.length === 0
                      ? 'Criar cards'
                      : `Criar ${lista.validos.length} ${lista.validos.length === 1 ? 'card' : 'cards'}`}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Pilha: o que já foi criado ── */}
        <aside className={styles.pilha} aria-label="Cards criados agora">
          <div className={styles.pilhaTopo}>
            <div>
              <p className={styles.pilhaTitulo}>{learnDeck?.nome} › {deck?.nome}</p>
              <p className={styles.pilhaSub}>
                {deck?.cards.length ?? 0} {deck?.cards.length === 1 ? 'card no deck' : 'cards no deck'}
                {daSessao.length > 0 && <> · <strong>+{daSessao.length} agora</strong></>}
              </p>
            </div>
          </div>

          {daSessao.length === 0 ? (
            <div className={styles.pilhaVazia}>
              <div className={styles.pilhaFantasma} aria-hidden="true" />
              <p>Os cards que você salvar vão se empilhando aqui.</p>
            </div>
          ) : (
            <ol className={styles.pilhaLista}>
              {daSessao.map((c) => (
                <li
                  key={c.id}
                  className={`${styles.mini} ${c.id === recente ? styles.miniNovo : ''} ${editando?.id === c.id ? styles.miniEditando : ''}`}
                >
                  <p className={styles.miniFrente}>{c.frente}</p>
                  <p className={styles.miniVerso}>{c.verso}</p>
                  {confirmandoExclusao === c.id ? (
                    <div className={styles.miniAcoes}>
                      <span>Excluir este card?</span>
                      <button type="button" className={styles.miniPerigo} onClick={() => excluir(c)}>Excluir</button>
                      <button type="button" onClick={() => setConfirmandoExclusao(null)}>Não</button>
                    </div>
                  ) : (
                    <div className={styles.miniAcoes}>
                      <button type="button" onClick={() => editar(c)}>Editar</button>
                      <button type="button" onClick={() => setConfirmandoExclusao(c.id)}>Excluir</button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}

          <div className={styles.pilhaRodape}>
            <button
              type="button"
              className={styles.botaoPrincipal}
              onClick={() => navigate(`/memorizar/${deckId}`)}
              disabled={!deck?.cards.length}
            >
              Estudar este deck
            </button>
            <button
              type="button"
              className={styles.botaoSecundario}
              onClick={() => navigate(`/app/decks/${deck?.mainDeckId}/${deckId}`)}
            >
              Concluir
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CriarFlashcardPage;
