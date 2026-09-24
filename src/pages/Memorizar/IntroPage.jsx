import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Carregando, ErroCarregar } from '@/components/EstadoTela/EstadoTela';
import styles from './IntroPage.module.css';

// Antes de começar: LearnDeck, deck e quantidade de cards
const IntroPage = () => {
  const { deckId } = useParams();
  const { decks, mainDecks, definirUltimoDeck, dadosCarregados, erroDados, recarregarDados } = useApp();
  const navigate = useNavigate();
  const [iniciando, setIniciando] = useState(false);

  const deck = decks.find((d) => d.id === Number(deckId));
  const mainDeck = mainDecks.find((md) => md.id === deck?.mainDeckId);

  const topo = (
    <div className={styles.topo}>
      <button className={styles.backBtn} onClick={() => navigate('/app')}>Voltar</button>
    </div>
  );

  // Grava o último deck estudado; se falhar, o estudo segue mesmo assim
  const estudar = async () => {
    setIniciando(true);
    try {
      await definirUltimoDeck(deck.id);
    } catch {
      /* não impede o estudo */
    }
    navigate(`/memorizar/${deck.id}/estudar`);
  };

  if (!dadosCarregados) {
    return (
      <div className={styles.page}>
        {topo}
        {erroDados
          ? <ErroCarregar mensagem={erroDados} onTentar={recarregarDados} />
          : <Carregando texto="Carregando o deck..." />}
      </div>
    );
  }

  if (!deck) {
    return (
      <div className={styles.page}>
        {topo}
        <main className={styles.center}>
          <p className={styles.emptyMsg}>Este deck não foi encontrado. Ele pode ter sido excluído.</p>
          <button className={styles.studyBtn} onClick={() => navigate('/memorizar?escolher')}>Escolher um deck</button>
        </main>
      </div>
    );
  }

  if (deck.cards.length === 0) {
    return (
      <div className={styles.page}>
        {topo}
        <main className={styles.center}>
          {mainDeck && <span className={styles.badge}>{mainDeck.nome}</span>}
          <h1 className={styles.deckName}>{deck.nome}</h1>
          <p className={styles.emptyMsg}>Este deck ainda não tem flashcards.</p>
          <button className={styles.studyBtn} onClick={() => navigate(`/criar/flashcard?deck=${deck.id}`)}>
            Criar flashcards
          </button>
          <button className={styles.linkBtn} onClick={() => navigate('/memorizar?escolher')}>Estudar outro deck</button>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {topo}

      <main className={styles.center}>
        {mainDeck && <span className={styles.badge}>{mainDeck.nome}</span>}
        <h1 className={styles.deckName}>{deck.nome}</h1>
        <p className={styles.cardCount}>
          {deck.cards.length} {deck.cards.length === 1 ? 'flashcard' : 'flashcards'}
        </p>
        <button className={styles.studyBtn} onClick={estudar} disabled={iniciando}>
          {iniciando ? 'Preparando...' : 'Estudar agora'}
        </button>
        <button className={styles.linkBtn} onClick={() => navigate('/memorizar?escolher')}>Trocar deck</button>
      </main>

      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />
    </div>
  );
};

export default IntroPage;
