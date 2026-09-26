import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Carregando, ErroCarregar, MensagemErro } from '@/components/EstadoTela/EstadoTela';
import Icone from '@/components/Icone/Icone';
import { visualDoAssunto } from '@/utils/assunto';
import styles from './EstudarPage.module.css';

// Apenas três níveis; as teclas 1, 2 e 3 também avaliam
const NIVEIS = [
  { key: 'dificil', label: 'Difícil', desc: 'Não lembrei',         tecla: '1', style: styles.ratingDificil },
  { key: 'bom',     label: 'Bom',     desc: 'Lembrei com esforço', tecla: '2', style: styles.ratingBom },
  { key: 'facil',   label: 'Fácil',   desc: 'Lembrei na hora',     tecla: '3', style: styles.ratingFacil },
];

const tamanhoTexto = (texto) =>
  texto.length > 140 ? styles.textoPequeno : texto.length > 70 ? styles.textoMedio : '';

const EstudarPage = () => {
  const { deckId } = useParams();
  const { decks, mainDecks, rateCard, cardRatings, dadosCarregados, erroDados, recarregarDados } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const deck = decks.find((d) => d.id === Number(deckId));
  // ?so=1,2,3 estuda só esses cards (ex.: "Rever os difíceis" na conclusão)
  const somente = (params.get('so') ?? '').split(',').map(Number).filter(Boolean);
  const cards = (deck?.cards ?? []).filter((c) => somente.length === 0 || somente.includes(c.id));
  const learnDeck = mainDecks.find((md) => md.id === deck?.mainDeckId);

  // A sessão sempre começa no primeiro card do deck
  const [index, setIndex] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [sessao, setSessao] = useState({}); // { cardId: nivel } avaliados nesta sessão
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [inicio] = useState(() => Date.now());

  // Avaliações de antes desta sessão, para a conclusão mostrar o que melhorou ou piorou
  const anteriores = useRef(null);
  if (dadosCarregados && !anteriores.current) anteriores.current = { ...cardRatings };

  const total = cards.length;
  const card = cards[Math.min(index, total - 1)];
  const ultimo = index === total - 1;

  const finalizar = (resultado = sessao) => {
    navigate(`/memorizar/${deckId}/concluido`, {
      state: {
        deckId: Number(deckId),
        deckNome: deck.nome,
        learnDeckNome: learnDeck?.nome ?? '',
        total,
        sessao: resultado,
        cardIds: cards.map((c) => c.id),
        anteriores: anteriores.current ?? {},
        duracaoMs: Date.now() - inicio,
        parcial: somente.length > 0,
      },
    });
  };

  const irPara = (i) => {
    setIndex(i);
    setRevelado(false);
    setErro('');
  };

  const anterior = () => {
    if (salvando) return;
    if (index > 0) irPara(index - 1);
  };

  const proximo = () => {
    if (salvando) return;
    if (ultimo) finalizar();
    else irPara(index + 1);
  };

  const revelar = () => setRevelado(true);

  // A avaliação é gravada no banco antes de passar para o próximo card
  const avaliar = async (nivel) => {
    if (!revelado || salvando || !card) return;
    setSalvando(true);
    setErro('');
    try {
      await rateCard(card.id, nivel);
      const novaSessao = { ...sessao, [card.id]: nivel };
      setSessao(novaSessao);
      if (ultimo) finalizar(novaSessao);
      else irPara(index + 1);
    } catch (err) {
      setErro(`${err.message} Tente avaliar de novo.`);
    } finally {
      setSalvando(false);
    }
  };

  // Atalhos: espaço/Enter revela, 1-2-3 avaliam, ← → navegam
  const atalhos = useRef({});
  atalhos.current = { revelar, avaliar, anterior, proximo, revelado };
  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const a = atalhos.current;
      if ((e.key === ' ' || e.key === 'Enter') && !a.revelado && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        a.revelar();
      } else if (['1', '2', '3'].includes(e.key)) {
        a.avaliar(NIVEIS[Number(e.key) - 1].key);
      } else if (e.key === 'ArrowLeft') {
        a.anterior();
      } else if (e.key === 'ArrowRight') {
        a.proximo();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, []);

  const sair = () => navigate(`/memorizar/${deckId}`);

  if (!dadosCarregados || !deck || total === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.headerBtn} onClick={() => navigate(deck ? `/memorizar/${deckId}` : '/memorizar?escolher')}>Sair</button>
        </header>
        {!dadosCarregados
          ? (erroDados
            ? <ErroCarregar mensagem={erroDados} onTentar={recarregarDados} />
            : <Carregando texto="Preparando os cards..." />)
          : (
            <div className={styles.emptyCenter}>
              <p>{deck ? 'Este deck não tem cards para estudar.' : 'Este deck não foi encontrado.'}</p>
              <button className={styles.navBtn} onClick={() => navigate('/memorizar?escolher')}>Escolher outro deck</button>
            </div>
          )}
      </div>
    );
  }

  const nivelNaSessao = sessao[card.id];
  const nivelAnterior = anteriores.current?.[card.id];
  const progresso = Math.round(((index + 1) / total) * 100);
  // Cards que ainda vêm depois: aparecem como fichas empilhadas atrás
  const restantes = Math.min(total - index - 1, 2);
  const visual = visualDoAssunto(learnDeck?.nome ?? deck.nome, learnDeck?.id);
  const corDoAssunto = { '--cor': visual.cor, '--cor-suave': visual.suave, '--cor-escura': visual.escuro };

  return (
    <div className={styles.page} style={corDoAssunto}>

      {/* ── Topo ── */}
      <header className={styles.header}>
        <button className={styles.headerBtn} onClick={sair}>
          <Icone nome="voltar" tamanho={18} />
          <span>Sair</span>
        </button>

        <div className={styles.headerCenter}>
          <span className={styles.deckTitle}>
            <span className={styles.deckIcone}><Icone nome={visual.icone} tamanho={14} /></span>
            <span className={styles.deckNome}>{learnDeck ? `${learnDeck.nome} › ` : ''}{deck.nome}</span>
          </span>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-label="Progresso da sessão"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={index + 1}
          >
            <div className={styles.progressFill} style={{ width: `${progresso}%` }} />
          </div>
        </div>

        <span className={styles.contador} aria-live="polite">
          <strong>{index + 1}</strong> de {total}
        </span>
      </header>

      {/* ── Card no centro da tela ── */}
      <main className={styles.main}>
        <div className={styles.palco}>
          <button
            type="button"
            className={styles.seta}
            onClick={anterior}
            disabled={index === 0 || salvando}
            aria-label="Card anterior"
          >
            <Icone nome="voltar" tamanho={20} />
          </button>

          <div className={`${styles.pilha} ${styles[`pilha${restantes}`]}`}>
            <div
              key={card.id}
              className={styles.cardScene}
              onClick={revelar}
              role="button"
              tabIndex={0}
              aria-label={revelado ? 'Verso revelado' : 'Revelar o verso do card'}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !revelado) {
                  e.preventDefault();
                  e.stopPropagation();
                  revelar();
                }
              }}
            >
              <div className={`${styles.cardInner} ${revelado ? styles.cardInnerFlipped : ''}`}>
                {/* Frente: ficha branca com a faixa do assunto */}
                <div className={styles.cardFront} aria-hidden={revelado}>
                  <div className={styles.cardTopo}>
                    <span className={styles.selo}>
                      <Icone nome={visual.icone} tamanho={14} />
                      Pergunta
                    </span>
                    {nivelAnterior && (
                      <span className={`${styles.ultima} ${styles[`ultima_${nivelAnterior}`]}`}>
                        Última vez: {NIVEIS.find((n) => n.key === nivelAnterior)?.label}
                      </span>
                    )}
                  </div>
                  <div className={styles.cardCorpo}>
                    <p className={`${styles.cardText} ${tamanhoTexto(card.frente)}`}>{card.frente}</p>
                  </div>
                  <div className={styles.cardRodape}>
                    {!revelado && (
                      <span className={styles.cardHint}>
                        <span className={styles.hintTeclado}><kbd>Espaço</kbd> ou clique para virar</span>
                        <span className={styles.hintToque}>Toque para virar</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Verso: cor do assunto, com a pergunta repetida em cima */}
                <div className={styles.cardBack} aria-hidden={!revelado}>
                  <div className={styles.cardTopo}>
                    <span className={`${styles.selo} ${styles.seloVerso}`}>
                      <Icone nome="check" tamanho={14} />
                      Resposta
                    </span>
                  </div>
                  <div className={styles.cardCorpo}>
                    <p className={styles.lembrete}>{card.frente}</p>
                    <p className={`${styles.cardTextBack} ${tamanhoTexto(card.verso)}`}>{card.verso}</p>
                  </div>
                  <div className={styles.cardRodape} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.seta}
            onClick={proximo}
            disabled={salvando}
            aria-label={ultimo ? 'Concluir' : 'Próximo card'}
          >
            <Icone nome={ultimo ? 'check' : 'seta'} tamanho={20} />
          </button>
        </div>

        {/* ── Avaliação (depois de virar) ── */}
        <div className={styles.avaliacao}>
          {revelado ? (
            <>
              <p className={styles.pergunta}>Como foi lembrar?</p>
              <div className={styles.ratingBtns}>
                {NIVEIS.map(({ key, label, desc, tecla, style }) => (
                  <button
                    key={key}
                    className={`${styles.ratingBtn} ${style} ${nivelNaSessao === key ? styles.ratingEscolhido : ''}`}
                    onClick={() => avaliar(key)}
                    disabled={salvando}
                    aria-pressed={nivelNaSessao === key}
                  >
                    <span className={styles.ratingPonto} aria-hidden="true" />
                    <span className={styles.ratingTexto}>
                      <strong>{label}</strong>
                      <span>{desc}</span>
                    </span>
                    <kbd className={styles.tecla} aria-hidden="true">{tecla}</kbd>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button className={styles.revelarBtn} onClick={revelar}>
              <Icone nome="girar" tamanho={18} />
              Virar card
            </button>
          )}
          {salvando && <p className={styles.salvando} role="status">Salvando avaliação...</p>}
          <MensagemErro>{erro}</MensagemErro>
        </div>
      </main>
    </div>
  );
};

export default EstudarPage;
