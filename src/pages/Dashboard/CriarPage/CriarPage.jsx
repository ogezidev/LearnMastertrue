import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Icone from '@/components/Icone/Icone';
import { visualDoAssunto } from '@/utils/assunto';
import styles from './CriarPage.module.css';

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

// Hub de criação: mostra a hierarquia LearnDeck → Deck → Cards e atalhos para os decks existentes
const CriarPage = () => {
  const { mainDecks, decks } = useApp();
  const navigate = useNavigate();
  const totalCards = decks.reduce((t, d) => t + d.cards.length, 0);

  const etapas = [
    {
      chave: 'learndeck',
      icone: 'pasta',
      titulo: 'LearnDeck',
      texto: 'O assunto. Ex.: Matemática, Inglês.',
      conta: plural(mainDecks.length, 'LearnDeck', 'LearnDecks'),
      rota: '/criar/learndeck',
      liberado: true,
    },
    {
      chave: 'deck',
      icone: 'camadas',
      titulo: 'Deck',
      texto: 'Um tema dentro do assunto. Ex.: Trigonometria.',
      conta: plural(decks.length, 'deck', 'decks'),
      rota: '/criar/deck',
      liberado: mainDecks.length > 0,
      bloqueio: 'Crie um LearnDeck primeiro',
    },
    {
      chave: 'cards',
      icone: 'cards',
      titulo: 'Cards',
      texto: 'Pergunta na frente, resposta no verso.',
      conta: plural(totalCards, 'card', 'cards'),
      rota: '/criar/flashcard',
      liberado: decks.length > 0,
      bloqueio: 'Crie um deck primeiro',
    },
  ];

  // Atalhos: decks com menos cards primeiro (os que mais precisam de conteúdo)
  const atalhos = [...decks].sort((a, b) => a.cards.length - b.cards.length).slice(0, 6);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.cabeca}>
          <h1 className={styles.titulo}>O que você quer criar?</h1>
          <p className={styles.sub}>Tudo no LearnMaster segue esta ordem: o assunto guarda decks, e os decks guardam cards.</p>
        </header>

        <ol className={styles.etapas}>
          {etapas.map((e, i) => (
            <li key={e.chave} className={styles.etapaItem}>
              <button
                type="button"
                className={`${styles.etapa} ${styles[`etapa_${e.chave}`]}`}
                onClick={() => navigate(e.rota)}
                disabled={!e.liberado}
              >
                <span className={styles.etapaNum}>{i + 1}</span>
                <span className={styles.etapaIcone}><Icone nome={e.icone} tamanho={28} /></span>
                <span className={styles.etapaTitulo}>{e.titulo}</span>
                <span className={styles.etapaTexto}>{e.liberado ? e.texto : e.bloqueio}</span>
                <span className={styles.etapaRodape}>
                  <span className={styles.etapaConta}>{e.conta}</span>
                  {e.liberado && <span className={styles.etapaCriar}><Icone nome="mais" tamanho={16} /> Criar</span>}
                </span>
              </button>
              {i < etapas.length - 1 && <span className={styles.seta} aria-hidden="true"><Icone nome="seta" tamanho={22} /></span>}
            </li>
          ))}
        </ol>

        {atalhos.length > 0 && (
          <section className={styles.atalhos} aria-label="Escrever cards em um deck">
            <h2 className={styles.atalhosTitulo}>Escrever cards em</h2>
            <div className={styles.atalhosLista}>
              {atalhos.map((d) => {
                const md = mainDecks.find((m) => m.id === d.mainDeckId);
                const v = visualDoAssunto(md?.nome ?? '', md?.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={styles.atalho}
                    style={{ '--cor': v.cor, '--suave': v.suave }}
                    onClick={() => navigate(`/criar/flashcard?deck=${d.id}`)}
                  >
                    <span className={styles.atalhoIcone}><Icone nome={v.icone} tamanho={18} /></span>
                    <span className={styles.atalhoTexto}>
                      <strong>{d.nome}</strong>
                      <span>{md?.nome} · {plural(d.cards.length, 'card', 'cards')}</span>
                    </span>
                    <Icone nome="mais" tamanho={18} />
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CriarPage;
