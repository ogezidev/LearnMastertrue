import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Fichario from '@/components/Fichario/Fichario';
import Icone from '@/components/Icone/Icone';
import { Carregando, ErroCarregar, MensagemErro } from '@/components/EstadoTela/EstadoTela';
import { dominio, visualDoAssunto } from '@/utils/assunto';
import Passos from './Passos';
import styles from './Criacao.module.css';

const MAX = 50;

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

const CriarDeckPage = () => {
  const { mainDecks, decks, createDeck, cardRatings, dadosCarregados, erroDados, recarregarDados } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const learnDeckDaUrl = Number(params.get('learndeck')) || null;

  const [nome, setNome] = useState('');
  const [mainDeckId, setMainDeckId] = useState(learnDeckDaUrl);
  const [criados, setCriados] = useState([]); // decks criados nesta visita, mais novo primeiro
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const campoRef = useRef(null);

  // Os LearnDecks chegam do servidor depois da primeira renderização (ex.: ao recarregar a página)
  useEffect(() => {
    if (!dadosCarregados || mainDecks.length === 0) return;
    if (!mainDecks.some((md) => md.id === mainDeckId)) {
      const daUrl = mainDecks.find((md) => md.id === learnDeckDaUrl);
      setMainDeckId((daUrl ?? mainDecks[mainDecks.length - 1]).id);
    }
  }, [dadosCarregados, mainDecks, mainDeckId, learnDeckDaUrl]);

  const learnDeck = mainDecks.find((md) => md.id === mainDeckId);
  const visual = learnDeck ? visualDoAssunto(learnDeck.nome, learnDeck.id) : visualDoAssunto('', null);
  const decksDoLearnDeck = decks.filter((d) => d.mainDeckId === mainDeckId);
  const cardsDoLearnDeck = decksDoLearnDeck.flatMap((d) => d.cards);
  const criadosAqui = criados.filter((c) => c.mainDeckId === mainDeckId);
  const limpo = nome.trim();
  const jaExiste = decksDoLearnDeck.some((d) => d.nome.trim().toLowerCase() === limpo.toLowerCase());

  // Enter cria e já deixa o campo pronto para o próximo deck
  const criar = async () => {
    if (!limpo || !mainDeckId || salvando) return;
    setErro('');
    setSalvando(true);
    try {
      const novo = await createDeck(limpo, mainDeckId);
      setCriados((prev) => [{ id: novo.id, nome: novo.nome, mainDeckId }, ...prev]);
      setNome('');
      requestAnimationFrame(() => campoRef.current?.focus());
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  if (!dadosCarregados) {
    return (
      <div className={styles.page}>
        <Passos atual={2} />
        {erroDados
          ? <ErroCarregar mensagem={erroDados} onTentar={recarregarDados} />
          : <Carregando texto="Carregando seus LearnDecks..." />}
      </div>
    );
  }

  if (mainDecks.length === 0) {
    return (
      <div className={styles.page}>
        <Passos atual={2} />
        <main className={styles.vazio}>
          <div>
            <p>Para criar um deck, primeiro crie o LearnDeck (o assunto) onde ele vai ficar.</p>
            <button className={styles.principal} onClick={() => navigate('/criar/learndeck')}>Criar LearnDeck</button>
          </div>
        </main>
      </div>
    );
  }

  const ultimo = criadosAqui[0];

  return (
    <div className={styles.page} style={{ '--cor': visual.cor }}>
      <Passos atual={2} />

      <main className={styles.palco}>
        <div className={styles.grade}>
          <section className={styles.form}>
            <div>
              <p className={styles.sobretitulo}>Novo deck</p>
              <h1 className={styles.titulo}>Divida {learnDeck?.nome ?? 'o assunto'} em decks</h1>
              <p className={styles.descricao}>
                Um deck para cada tema ou capítulo. Escreva o nome e aperte Enter: dá para criar vários seguidos.
              </p>
            </div>

            <div className={styles.campoGrupo}>
              <span className={styles.rotulo}>LearnDeck</span>
              <div className={styles.sugestoes} role="radiogroup" aria-label="LearnDeck onde o deck será criado">
                {mainDecks.map((md) => {
                  const v = visualDoAssunto(md.nome, md.id);
                  const sel = md.id === mainDeckId;
                  return (
                    <button
                      key={md.id}
                      type="button"
                      role="radio"
                      aria-checked={sel}
                      className={`${styles.sugestao} ${sel ? styles.sugestaoAtiva : ''}`}
                      style={{ '--cor': v.cor, '--suaveCor': v.suave }}
                      onClick={() => { setMainDeckId(md.id); campoRef.current?.focus(); }}
                    >
                      <Icone nome={v.icone} tamanho={16} /> {md.nome}
                    </button>
                  );
                })}
                <button type="button" className={styles.sugestao} onClick={() => navigate('/criar/learndeck')}>
                  <Icone nome="mais" tamanho={16} /> Novo LearnDeck
                </button>
              </div>
            </div>

            <form className={styles.campoGrupo} onSubmit={(e) => { e.preventDefault(); criar(); }}>
              <label className={styles.rotulo} htmlFor="nome-deck">Nome do deck</label>
              <div className={styles.campoLinha}>
                <input
                  id="nome-deck"
                  ref={campoRef}
                  className={styles.campo}
                  value={nome}
                  maxLength={MAX}
                  placeholder={criadosAqui.length ? 'Próximo deck...' : 'Ex.: Trigonometria'}
                  onChange={(e) => { setNome(e.target.value.slice(0, MAX)); setErro(''); }}
                  autoFocus
                  autoComplete="off"
                />
                <span className={`${styles.contador} ${nome.length >= MAX ? styles.contadorLimite : ''}`}>{nome.length}/{MAX}</span>
                <button type="submit" className={styles.principal} disabled={!limpo || salvando}>
                  {salvando ? 'Criando...' : 'Criar'}
                </button>
              </div>
              {jaExiste && <span className={styles.dica}>Já existe um deck com esse nome em {learnDeck?.nome}.</span>}
              <span className={styles.dica}><kbd>Enter</kbd> cria o deck e já deixa pronto para o próximo</span>
            </form>

            <MensagemErro>{erro}</MensagemErro>

            {criadosAqui.length > 0 && (
              <div className={styles.campoGrupo} role="status">
                <span className={styles.rotulo}>Criados agora · {criadosAqui.length}</span>
                <ul className={styles.criados}>
                  {criadosAqui.map((d) => (
                    <li key={d.id} className={styles.criado}>
                      <Icone nome="camadas" tamanho={18} />
                      <span className={styles.criadoNome}>{d.nome}</span>
                      <button type="button" className={styles.criadoAcao} onClick={() => navigate(`/criar/flashcard?deck=${d.id}`)}>
                        <Icone nome="mais" tamanho={14} /> Cards
                      </button>
                    </li>
                  ))}
                </ul>
                <div className={styles.botoes}>
                  <button className={styles.principal} onClick={() => navigate(`/criar/flashcard?deck=${ultimo.id}`)}>
                    Escrever cards em {ultimo.nome} <Icone nome="seta" tamanho={18} />
                  </button>
                  <button className={styles.textoBotao} onClick={() => navigate(`/app/decks/${mainDeckId}`)}>Ver {learnDeck?.nome}</button>
                </div>
              </div>
            )}
          </section>

          <aside className={styles.previa} aria-label={`LearnDeck ${learnDeck?.nome ?? ''}`}>
            <span className={styles.previaRotulo}>No fichário</span>
            <div className={styles.previaFichario}>
              <Fichario
                nome={learnDeck?.nome ?? ''}
                visual={visual}
                meta={`${plural(decksDoLearnDeck.length, 'deck', 'decks')} · ${plural(cardsDoLearnDeck.length, 'card', 'cards')}`}
                etiquetas={[
                  ...(limpo ? [{ chave: 'digitando', texto: limpo, nova: true }] : []),
                  ...[...decksDoLearnDeck].reverse().map((d) => ({ chave: d.id, texto: d.nome, nova: criadosAqui[0]?.id === d.id && !limpo })),
                ]}
                progresso={dominio(cardsDoLearnDeck, cardRatings)}
              />
            </div>
            <p className={styles.previaNota}>
              {limpo ? `"${limpo}" vai entrar aqui.` : 'Os decks aparecem como etiquetas no fichário.'}
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CriarDeckPage;
