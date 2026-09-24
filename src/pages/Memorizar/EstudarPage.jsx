import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Carregando, ErroCarregar, MensagemErro } from '@/components/EstadoTela/EstadoTela';
import styles from './EstudarPage.module.css';

// Apenas três níveis; as teclas 1, 2 e 3 também avaliam
const NIVEIS = [
  { key: 'dificil', label: 'Difícil', tecla: '1', style: styles.ratingDificil },
  { key: 'bom',     label: 'Bom',     tecla: '2', style: styles.ratingBom },
  { key: 'facil',   label: 'Fácil',   tecla: '3', style: styles.ratingFacil },
];

const tamanhoTexto = (texto) =>
  texto.length > 140 ? styles.textoPequeno : texto.length > 70 ? styles.textoMedio : '';

const EstudarPage = () => {
  const { deckId } = useParams();
  const { decks, mainDecks, rateCard, dadosCarregados, erroDados, recarregarDados } = useApp();
  const navigate = useNavigate();

  const deck = decks.find((d) => d.id === Number(deckId));
  const cards = deck?.cards ?? [];
  const learnDeck = mainDecks.find((md) => md.id === deck?.mainDeckId);

  // A sessão sempre começa no primeiro card do deck
  const [index, setIndex] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [sessao, setSessao] = useState({}); // { cardId: nivel } avaliados nesta sessão
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const total = cards.length;
  const card = cards[Math.min(index, total - 1)];
  const ultimo = index === total - 1;

  const finalizar = (resultado = sessao) => {
    navigate(`/memorizar/${deckId}/concluido`, {
      state: { deckId: Number(deckId), deckNome: deck.nome, total, sessao: resultado },
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
  const progresso = Math.round(((index + 1) / total) * 100);

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <button className={styles.headerBtn} onClick={sair}>Sair</button>

        <div className={styles.headerCenter}>
          <span className={styles.deckTitle}>
            {learnDeck ? `${learnDeck.nome} › ` : ''}{deck.nome}
          </span>
          <span className={styles.contador} aria-live="polite">Card {index + 1} de {total}</span>
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

        <span className={styles.headerSpacer} aria-hidden="true" />
      </header>

      {/* ── Card ── */}
      <main className={styles.main}>
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
            <div className={styles.cardFront} aria-hidden={revelado}>
              <span className={styles.cardLabel}>Frente</span>
              <p className={`${styles.cardText} ${tamanhoTexto(card.frente)}`}>{card.frente}</p>
              {!revelado && <span className={styles.cardHint}>Toque ou aperte espaço para revelar</span>}
            </div>

            <div className={styles.cardBack} aria-hidden={!revelado}>
              <span className={styles.cardLabelBack}>Verso</span>
              <p className={`${styles.cardTextBack} ${tamanhoTexto(card.verso)}`}>{card.verso}</p>
            </div>
          </div>
        </div>

        {/* ── Avaliação (depois de revelar) ── */}
        <div className={styles.avaliacao}>
          {revelado ? (
            <>
              <p className={styles.pergunta}>Como foi lembrar deste card?</p>
              <div className={styles.ratingBtns}>
                {NIVEIS.map(({ key, label, tecla, style }) => (
                  <button
                    key={key}
                    className={`${styles.ratingBtn} ${style} ${nivelNaSessao === key ? styles.ratingEscolhido : ''}`}
                    onClick={() => avaliar(key)}
                    disabled={salvando}
                    aria-pressed={nivelNaSessao === key}
                  >
                    {label}
                    <span className={styles.tecla} aria-hidden="true">{tecla}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button className={styles.revelarBtn} onClick={revelar}>Revelar verso</button>
          )}
          {salvando && <p className={styles.salvando} role="status">Salvando avaliação...</p>}
          <MensagemErro>{erro}</MensagemErro>
        </div>

        {/* ── Navegação ── */}
        <nav className={styles.navegacao} aria-label="Navegar entre os cards">
          <button className={styles.navBtn} onClick={anterior} disabled={index === 0 || salvando}>← Anterior</button>
          <button className={styles.navBtn} onClick={proximo} disabled={salvando}>{ultimo ? 'Concluir' : 'Avançar →'}</button>
        </nav>
      </main>
    </div>
  );
};

export default EstudarPage;
