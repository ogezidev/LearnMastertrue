import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header/Header';
import ImagemCadastro from '@/assets/images/ImagemCadastro.png';
import styles from './CadastroPage.module.css';



export default function Cadastro() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          {/* Coluna esquerda — imagem (espelhado do login) */}
          <div className={styles.imageCol}>
            <img
              src={ImagemCadastro}
              alt="A rapidez que você encontra apenas na Learnmaster"
              className={styles.image}
            />
          </div>

          {/* Coluna direita — formulário */}
          <div className={styles.formCol}>
            <div className={styles.formHeader}>
              <h1 className={styles.title}>Cadastro</h1>
              <p className={styles.subtitle}>Seja bem vindo!</p>
            </div>

            <form
              className={styles.form}
              onSubmit={handleSubmit}
            >
              <div className={styles.fieldGroup}>
                <input
                  type="text"
                  placeholder="Nome"
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <input
                  type="email"
                  placeholder="Email"
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <input
                  type="password"
                  placeholder="Senha"
                  className={styles.input}
                />
              </div>

              <button type="submit" className={styles.btnCriar}>
                Criar
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
