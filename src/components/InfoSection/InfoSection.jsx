import styles from './InfoSection.module.css';

const infoBlocks = [
  {
    title: 'Melhora da organização',
    subtitle: 'na rotina de estudos',
  },
  {
    title: 'Aumento na memorização',
    subtitle: 'com métodos eficazes',
  },
  {
    title: 'Modelo de estudo personalizado',
    subtitle: 'personalizado pelo estudante',
  },
];

const InfoSection = () => {
  return (
    <section className={styles.infoSection}>
      <div className={styles.container}>
        <div className={styles.textCol}>
          <p className={styles.description}>
          A LearnMaster é uma plataforma digital que ajuda estudantes a aprender e memorizar melhor.
          </p>
        </div>

        <div className={styles.blocksCol}>
          {infoBlocks.map((block, index) => (
            <div key={index} className={styles.infoBlock}>
              <h3 className={styles.blockTitle}>{block.title}</h3>
              <p className={styles.blockSubtitle}>{block.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.divider} />
    </section>
  );
};

export default InfoSection;
