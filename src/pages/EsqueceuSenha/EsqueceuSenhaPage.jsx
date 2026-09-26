import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header/Header';
import SenhaRegras from '@/components/SenhaRegras/SenhaRegras';
import { recuperarSenhaApi, redefinirSenhaApi } from '@/services/api';
import { senhaValida } from '@/utils/senha';
import imgLogin from '@/assets/images/ImagemLogin.png';
import styles from './EsqueceuSenhaPage.module.css';
import CampoSenha from '@/components/CampoSenha/CampoSenha';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODIGO_VALIDO = /^\d{6}$/;

const SetaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3 9h12M10 4l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Etapas: 'email' (pede o código) → 'codigo' (código + nova senha) → 'concluido'
const EsqueceuSenhaPage = () => {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const emailLimpo = email.trim();

  const pedirCodigo = async () => {
    setErro('');
    setAviso('');
    setEnviando(true);
    try {
      // O servidor responde igual exista ou não a conta, então a tela também
      await recuperarSenhaApi(emailLimpo);
      return true;
    } catch (err) {
      setErro(err.message);
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    if (!EMAIL_VALIDO.test(emailLimpo)) {
      setErro('Digite um e-mail válido.');
      return;
    }
    if (await pedirCodigo()) setEtapa('codigo');
  };

  const handleReenviar = async () => {
    if (enviando) return;
    setCodigo('');
    if (await pedirCodigo()) setAviso('Enviamos um novo código. O anterior deixou de valer.');
  };

  const trocarEmail = () => {
    setEtapa('email');
    setCodigo('');
    setSenha('');
    setConfirmacao('');
    setErro('');
    setAviso('');
  };

  const podeRedefinir = CODIGO_VALIDO.test(codigo) && senhaValida(senha) && senha === confirmacao && !enviando;

  const handleRedefinir = async (e) => {
    e.preventDefault();
    if (!CODIGO_VALIDO.test(codigo)) {
      setErro('Digite o código de 6 dígitos.');
      return;
    }
    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (!senhaValida(senha)) return;
    setErro('');
    setAviso('');
    setEnviando(true);
    try {
      await redefinirSenhaApi(emailLimpo, codigo, senha);
      setEtapa('concluido');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const etapaEmail = (
    <>
      <div className={`${styles.formHeader} ${styles.fadeIn}`}>
        <h1 className={styles.title}>Recuperar senha</h1>
        <p className={styles.subtitle}>Informe seu e-mail cadastrado e enviaremos um código para criar uma nova senha.</p>
      </div>

      <form className={`${styles.form} ${styles.fadeIn}`} onSubmit={handleEnviarEmail} noValidate>
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
          {enviando ? 'Enviando...' : 'Enviar código'}
          {!enviando && <SetaIcon />}
        </button>

        <p className={styles.voltarLink}>
          Lembrou a senha?{' '}
          <Link to="/entrar" className={styles.link}>Entrar</Link>
        </p>
      </form>
    </>
  );

  const etapaCodigo = (
    <>
      <div className={`${styles.formHeader} ${styles.fadeIn}`}>
        <h1 className={styles.title}>Digite o código</h1>
        <p className={styles.subtitle}>
          Se <strong>{emailLimpo}</strong> estiver cadastrado, enviamos um código de 6 dígitos.
          Ele vale por 30 minutos. Confira também a caixa de spam.
        </p>
      </div>

      <form className={`${styles.form} ${styles.fadeIn}`} onSubmit={handleRedefinir} noValidate>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="codigo-recuperacao">Código</label>
          <input
            id="codigo-recuperacao"
            type="text"
            inputMode="numeric"
            className={`${styles.input} ${styles.inputCodigo}`}
            placeholder="000000"
            value={codigo}
            onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6)); setErro(''); }}
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="nova-senha">Nova senha</label>
          <CampoSenha
            id="nova-senha"
            className={styles.input}
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErro(''); }}
            autoComplete="new-password"
          />
          {senha.length > 0 && <SenhaRegras senha={senha} />}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="confirmar-senha">Confirmar nova senha</label>
          <CampoSenha
            id="confirmar-senha"
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
        {aviso && <span className={styles.aviso} role="status">{aviso}</span>}

        <button type="submit" className={styles.btnPrimary} disabled={!podeRedefinir}>
          {enviando ? 'Aguarde...' : 'Redefinir senha'}
        </button>

        <p className={styles.voltarLink}>
          Não recebeu?{' '}
          <button type="button" className={styles.linkBotao} onClick={handleReenviar} disabled={enviando}>
            Reenviar código
          </button>
          {' · '}
          <button type="button" className={styles.linkBotao} onClick={trocarEmail}>
            Usar outro e-mail
          </button>
        </p>
      </form>
    </>
  );

  const etapaConcluido = (
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

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>

          <div className={styles.formCol}>
            {etapa === 'email' && etapaEmail}
            {etapa === 'codigo' && etapaCodigo}
            {etapa === 'concluido' && etapaConcluido}
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
