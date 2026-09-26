import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header/Header';
import SenhaRegras from '@/components/SenhaRegras/SenhaRegras';
import { senhaValida as validarSenha } from '@/utils/senha';
import ImagemCadastro from '@/assets/images/ImagemCadastro.png';
import styles from './CadastroPage.module.css';
import CampoSenha from '@/components/CampoSenha/CampoSenha';

export default function Cadastro() {
  const { cadastrar, user } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const senhaValida = validarSenha(senha);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senhaValida) return;
    setErro('');
    setLoading(true);
    try {
      // A senha vai exatamente como foi digitada (sem trim)
      await cadastrar(nome.trim(), email.trim(), senha);
      navigate('/app');
    } catch (err) {
      setErro(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          {/* Coluna esquerda — imagem */}
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

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldGroup}>
                <input
                  type="text"
                  placeholder="Nome completo"
                  className={styles.input}
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <input
                  type="email"
                  placeholder="Email"
                  className={styles.input}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  maxLength={255}
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <CampoSenha
                  placeholder="Senha"
                  className={styles.input}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {senha.length > 0 && <SenhaRegras senha={senha} />}
              </div>

              {erro && <p className={styles.erro} role="alert">{erro}</p>}

              <button type="submit" className={styles.btnCriar} disabled={loading || !senhaValida}>
                {loading ? 'Criando...' : 'Criar'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
