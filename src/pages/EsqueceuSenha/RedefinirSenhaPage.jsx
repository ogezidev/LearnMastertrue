import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header/Header';
import SenhaRegras from '@/components/SenhaRegras/SenhaRegras';
import { redefinirSenhaApi } from '@/services/api';
import { senhaValida } from '@/utils/senha';
import imgLogin from '@/assets/images/ImagemLogin.png';
import styles from './EsqueceuSenhaPage.module.css';

// Aberta pelo link do e-mail: /redefinir-senha?token=...
const RedefinirSenhaPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const podeEnviar = senhaValida(senha) && senha === confirmacao && !salvando;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (!senhaValida(senha)) return;
    setErro('');
    setSalvando(true);
    try {
      await redefinirSenhaApi(token, senha);
      setConcluido(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const conteudo = () => {
    if (!token) {
      return (
        <>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>Link inválido</h1>
            <p className={styles.subtitle}>Este link de redefinição está incompleto ou expirou.</p>
          </div>
          <Link to="/esqueceu-senha" className={styles.btnPrimary}>Pedir um novo link</Link>
        </>
      );
    }

    if (concluido) {
      return (
        <>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>Tudo certo!</h1>
          </div>
          <div className={`${styles.sucesso} ${styles.fadeIn}`}>
            <div className={styles.sucessoIconWrap}>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                <circle cx="26" cy="26" r="24" fill="#EFF8F0" stroke="#22c55e" strokeWidth="2"/>
                <path d="M14 26l8 8 16-16" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.sucessoMsg} role="status">
              Sua senha foi redefinida. Por segurança, todas as sessões abertas foram encerradas.
            </p>
            <button className={styles.btnPrimary} onClick={() => navigate('/entrar')}>
              Ir para o login
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className={`${styles.formHeader} ${styles.fadeIn}`}>
          <h1 className={styles.title}>Nova senha</h1>
          <p className={styles.subtitle}>Escolha uma senha segura para sua conta.</p>
        </div>

        <form className={`${styles.form} ${styles.fadeIn}`} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="nova-senha">Nova senha</label>
            <input
              id="nova-senha"
              type="password"
              className={styles.input}
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(''); }}
              autoComplete="new-password"
              autoFocus
            />
            {senha.length > 0 && <SenhaRegras senha={senha} />}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="confirmar-senha">Confirmar nova senha</label>
            <input
              id="confirmar-senha"
              type="password"
              className={`${styles.input} ${confirmacao && senha !== confirmacao ? styles.inputError : ''}`}
              value={confirmacao}
              onChange={(e) => { setConfirmacao(e.target.value); setErro(''); }}
              autoComplete="new-password"
            />
            {confirmacao && senha !== confirmacao && (
              <span className={styles.erro}>As senhas não coincidem.</span>
            )}
          </div>

          {erro && <span className={styles.erro} role="alert">{erro}</span>}

          <button type="submit" className={styles.btnPrimary} disabled={!podeEnviar}>
            {salvando ? 'Salvando...' : 'Redefinir senha'}
          </button>

          <p className={styles.voltarLink}>
            Link expirado?{' '}
            <Link to="/esqueceu-senha" className={styles.link}>Pedir um novo</Link>
          </p>
        </form>
      </>
    );
  };

  return (
    <div className={styles.pagina}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.formCol}>{conteudo()}</div>
          <div className={styles.imageCol}>
            <img src={imgLogin} alt="LearnMaster" className={styles.image} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RedefinirSenhaPage;
