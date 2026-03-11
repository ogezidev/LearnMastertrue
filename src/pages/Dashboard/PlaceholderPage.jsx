import styles from './PlaceholderPage.module.css';

const PlaceholderPage = ({ title }) => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>{title}</div>
    </div>
  );
};

export default PlaceholderPage;

