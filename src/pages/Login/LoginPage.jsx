import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header/Header';
import styles from './LoginPage.module.css';
import imgLogin from '@/assets/images/ImagemLogin.png';

const LoginPage = () => {
  const { login, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) return;
    setErro('');
    setLoading(true);
    try {
      await login(email.trim(), senha.trim(), lembrar);
      navigate('/app');
    } catch {
      setErro('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                />
              </div>

              {erro && <p className={styles.erro}>{erro}</p>}

              <button type="submit" className={styles.btnEntrar} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
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
                <Link to="/esqueceu-senha" className={styles.linkEsqueceu}>Esqueceu a senha?</Link>
              </div>
            </form>

            <p className={styles.cadastroLink}>
              Não tem uma conta?{' '}
              <Link to="/cadastro" className={styles.link}>Cadastre-se</Link>
            </p>
          </div>

          {/* Coluna direita — imagem */}
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
