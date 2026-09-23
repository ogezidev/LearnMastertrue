import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header/Header';
import { recuperarSenhaApi } from '@/services/api';
import imgLogin from '@/assets/images/ImagemLogin.png';
import styles from './EsqueceuSenhaPage.module.css';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SetaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3 9h12M10 4l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EsqueceuSenhaPage = () => {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!EMAIL_VALIDO.test(email.trim())) {
      setErro('Digite um e-mail válido.');
      return;
    }
    setErro('');
    setEnviando(true);
    try {
      // O servidor responde igual exista ou não a conta, então a tela também
      await recuperarSenhaApi(email.trim());
      setEnviado(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>

          <div className={styles.formCol}>
            {!enviado ? (
              <>
                <div className={`${styles.formHeader} ${styles.fadeIn}`}>
                  <h1 className={styles.title}>Recuperar senha</h1>
                  <p className={styles.subtitle}>Informe seu e-mail cadastrado e enviaremos um link para criar uma nova senha.</p>
                </div>

                <form className={`${styles.form} ${styles.fadeIn}`} onSubmit={handleEnviar} noValidate>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="email-recuperacao">E-mail</label>
                    <input
                      id="email-recuperacao"
                      type="email"
                      className={`${styles.input} ${erro ? styles.inputError : ''}`}
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErro(''); }}
                      autoComplete="email"
                      autoFocus
                    />
                    {erro && <span className={styles.erro} role="alert">{erro}</span>}
                  </div>

                  <button type="submit" className={styles.btnPrimary} disabled={enviando}>
                    {enviando ? 'Enviando...' : 'Enviar link'}
                    {!enviando && <SetaIcon />}
                  </button>

                  <p className={styles.voltarLink}>
                    Lembrou a senha?{' '}
                    <Link to="/entrar" className={styles.link}>Entrar</Link>
                  </p>
                </form>
              </>
            ) : (
              <>
                <div className={`${styles.formHeader} ${styles.fadeIn}`}>
                  <h1 className={styles.title}>Verifique seu e-mail</h1>
                </div>

                <div className={`${styles.sucesso} ${styles.fadeIn}`}>
                  <div className={styles.sucessoIconWrap}>
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
                      <circle cx="26" cy="26" r="24" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2"/>
                      <rect x="14" y="17" width="24" height="18" rx="3" stroke="#2563EB" strokeWidth="2.2"/>
                      <path d="M14 20l12 8 12-8" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className={styles.sucessoMsg} role="status">
                    Se o e-mail <strong>{email.trim()}</strong> estiver cadastrado, você receberá um link
                    para redefinir a senha. O link vale por 30 minutos. Confira também a caixa de spam.
                  </p>
                  <button type="button" className={styles.btnSecondary} onClick={() => setEnviado(false)}>
                    Usar outro e-mail
                  </button>
                  <p className={styles.voltarLink}>
                    <Link to="/entrar" className={styles.link}>Voltar para o login</Link>
                  </p>
                </div>
              </>
            )}
          </div>

          <div className={styles.imageCol}>
            <img src={imgLogin} alt="LearnMaster" className={styles.image} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default EsqueceuSenhaPage;
