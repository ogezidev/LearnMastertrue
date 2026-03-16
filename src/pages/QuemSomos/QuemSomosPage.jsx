import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './QuemSomosPage.module.css';

const QuemSomosPage = () => {
  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>

          <div className={styles.hero}>
            <span className={styles.tag}>Quem somos</span>
            <h1 className={styles.title}>Feito para quem<br />leva o estudo a sério</h1>
            <p className={styles.subtitle}>
              O LearnMaster nasceu da necessidade de tornar o aprendizado mais eficiente
              e organizado. Combinamos ciência cognitiva com tecnologia para criar a
              melhor experiência de memorização por flashcards.
            </p>
          </div>

          <div className={styles.cards}>
            <div className={styles.card}>
              <span className={styles.cardIcon}>🎯</span>
              <h2 className={styles.cardTitle}>Nossa missão</h2>
              <p className={styles.cardText}>
                Ajudar estudantes a dominar qualquer assunto usando o método de
                repetição espaçada — comprovado pela ciência como a forma mais eficaz
                de fixar conhecimento a longo prazo.
              </p>
            </div>

            <div className={styles.card}>
              <span className={styles.cardIcon}>🚀</span>
              <h2 className={styles.cardTitle}>Nossa visão</h2>
              <p className={styles.cardText}>
                Ser a plataforma de referência para estudantes que buscam resultados
                reais — uma ferramenta que cresce junto com o usuário, do ensino médio
                à pós-graduação.
              </p>
            </div>

            <div className={styles.card}>
              <span className={styles.cardIcon}>💡</span>
              <h2 className={styles.cardTitle}>Nossos valores</h2>
              <p className={styles.cardText}>
                Simplicidade, eficiência e foco no usuário. Acreditamos que uma
                ferramenta de estudos deve sair do caminho e deixar o aprendizado
                acontecer naturalmente.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuemSomosPage;
