import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header/Header';
import styles from './LoginPage.module.css';
import imgLogin from '@/assets/images/ImagemLogin.png';

const LoginPage = () => {
  const [lembrar, setLembrar] = useState(false);
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

          {/* Coluna esquerda — formulário */}
          <div className={styles.formCol}>
            <div className={styles.formHeader}>
              <h1 className={styles.title}>Entrar</h1>
              <p className={styles.subtitle}>Seja bem vindo!</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldGroup}>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Email"
                />
              </div>

              <div className={styles.fieldGroup}>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Senha"
                />
              </div>

              <button type="submit" className={styles.btnEntrar}>
                Entrar
              </button>

              <div className={styles.formFooter}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={lembrar}
                    onChange={() => setLembrar(!lembrar)}
                    className={styles.checkbox}
                  />
                  Continuar logado
                </label>
                <a href="#" className={styles.linkEsqueceu}>Esqueceu a senha?</a>
              </div>
            </form>

            <p className={styles.cadastroLink}>
              Não tem uma conta?{' '}
              <Link to="/cadastro" className={styles.link}>Cadastre-se</Link>
            </p>
          </div>

          {/* Coluna direita — card azul */}
          <div className={styles.imageCol}>
            <img
              src={imgLogin}
              alt="LearnMaster"
              className={styles.image}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default LoginPage;
