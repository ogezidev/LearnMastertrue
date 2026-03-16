import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header/Header';
import ImagemCadastro from '@/assets/images/ImagemCadastro.png';
import styles from './CadastroPage.module.css';

const senhaRules = [
  { id: 'min',     label: 'Mínimo 8 caracteres',            test: (s) => s.length >= 8 },
  { id: 'max',     label: 'Máximo 64 caracteres',            test: (s) => s.length <= 64 },
  { id: 'upper',   label: 'Uma letra maiúscula',             test: (s) => /[A-Z]/.test(s) },
  { id: 'lower',   label: 'Uma letra minúscula',             test: (s) => /[a-z]/.test(s) },
  { id: 'number',  label: 'Um número',                       test: (s) => /[0-9]/.test(s) },
  { id: 'special', label: 'Um caractere especial (!@#...)',  test: (s) => /[^A-Za-z0-9]/.test(s) },
];

export default function Cadastro() {
  const { cadastrar, user } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const senhaValida = senhaRules.every(r => r.test(senha));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senha.trim()) return;
    if (!senhaValida) return;
    setErro('');
    setLoading(true);
    try {
      await cadastrar(nome.trim(), email.trim(), senha.trim());
      navigate('/app');
    } catch {
      setErro('Erro ao criar conta. Tente novamente.');
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
                  placeholder="Nome"
                  className={styles.input}
                  value={nome}
                  onChange={e => setNome(e.target.value)}
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
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <input
                  type="password"
                  placeholder="Senha"
                  className={styles.input}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  onFocus={() => setSenhaFocused(true)}
                  required
                />
                {(senhaFocused && senha.length > 0) && (
                  <ul className={styles.senhaRules}>
                    {senhaRules.map(rule => (
                      <li
                        key={rule.id}
                        className={rule.test(senha) ? styles.ruleOk : styles.ruleFail}
                      >
                        {rule.test(senha) ? '✓' : '✗'} {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {erro && <p className={styles.erro}>{erro}</p>}

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
