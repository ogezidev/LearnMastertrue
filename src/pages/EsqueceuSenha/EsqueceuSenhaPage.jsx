import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header/Header';
import imgLogin from '@/assets/images/ImagemLogin.png';
import styles from './EsqueceuSenhaPage.module.css';

/* Gera um código de 6 dígitos */
const gerarCodigo = () => String(Math.floor(100000 + Math.random() * 900000));

const EsqueceuSenhaPage = () => {
  const navigate = useNavigate();

  /* step: 'email' → 'codigo' → 'senha' → 'sucesso' */
  const [step, setStep] = useState('email');
  const [animating, setAnimating] = useState(false);

  /* Campos */
  const [email, setEmail]         = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [codigoReal, setCodigoReal]   = useState('');
  const [senhaNova, setSenhaNova]     = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');

  /* Erros */
  const [erroEmail, setErroEmail]   = useState('');
  const [erroCodigo, setErroCodigo] = useState('');
  const [erroSenha, setErroSenha]   = useState('');

  /* Contagem regressiva de reenvio */
  const [reenvioTimer, setReenvioTimer] = useState(0);

  const irPara = (novoStep) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(novoStep);
      setAnimating(false);
    }, 250);
  };

  const iniciarTimer = () => {
    setReenvioTimer(60);
    const id = setInterval(() => {
      setReenvioTimer((t) => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  /* ── Step 1: enviar e-mail ── */
  const handleEnviarEmail = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErroEmail('Digite um e-mail válido.');
      return;
    }
    const codigo = gerarCodigo();
    setCodigoReal(codigo);
    setErroEmail('');
    iniciarTimer();
    irPara('codigo');
  };

  /* ── Step 2: verificar código ── */
  const handleVerificarCodigo = (e) => {
    e.preventDefault();
    if (codigoInput.trim() !== codigoReal) {
      setErroCodigo('Código inválido. Verifique seu e-mail e tente novamente.');
      return;
    }
    setErroCodigo('');
    irPara('senha');
  };

  const handleReenviar = () => {
    if (reenvioTimer > 0) return;
    const codigo = gerarCodigo();
    setCodigoReal(codigo);
    setCodigoInput('');
    setErroCodigo('');
    iniciarTimer();
  };

  /* ── Step 3: nova senha ── */
  const handleRedefinirSenha = (e) => {
    e.preventDefault();
    if (senhaNova.length < 6) {
      setErroSenha('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senhaNova !== senhaConfirm) {
      setErroSenha('As senhas não coincidem.');
      return;
    }
    setErroSenha('');
    irPara('sucesso');
  };

  /* ── Labels dos steps ── */
  const stepLabels = {
    email: { num: 1, titulo: 'Recuperar senha', sub: 'Informe seu e-mail cadastrado' },
    codigo:{ num: 2, titulo: 'Verificar código', sub: `Código enviado para ${email}` },
    senha: { num: 3, titulo: 'Nova senha',       sub: 'Escolha uma senha segura' },
    sucesso: { num: 3, titulo: 'Tudo certo!',    sub: 'Sua senha foi redefinida' },
  };
  const current = stepLabels[step];

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── Coluna esquerda — formulário ── */}
          <div className={styles.formCol}>

            {/* Indicador de progresso */}
            {step !== 'sucesso' && (
              <div className={styles.progress}>
                {[1, 2, 3].map((n) => (
                  <div key={n} className={styles.progressItem}>
                    <div className={`${styles.progressDot} ${current.num > n ? styles.progressDone : current.num === n ? styles.progressActive : ''}`}>
                      {current.num > n ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : n}
                    </div>
                    {n < 3 && <div className={`${styles.progressLine} ${current.num > n ? styles.progressLineDone : ''}`} />}
                  </div>
                ))}
              </div>
            )}

            <div className={`${styles.formHeader} ${animating ? styles.fadeOut : styles.fadeIn}`}>
              <h1 className={styles.title}>{current.titulo}</h1>
              <p className={styles.subtitle}>{current.sub}</p>
            </div>

            {/* ── STEP EMAIL ── */}
            {step === 'email' && (
              <form className={`${styles.form} ${animating ? styles.fadeOut : styles.fadeIn}`} onSubmit={handleEnviarEmail}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>E-mail</label>
                  <input
                    type="email"
                    className={`${styles.input} ${erroEmail ? styles.inputError : ''}`}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErroEmail(''); }}
                    autoFocus
                  />
                  {erroEmail && <span className={styles.erro}>{erroEmail}</span>}
                </div>

                <button type="submit" className={styles.btnPrimary}>
                  Enviar código
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 9h12M10 4l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <p className={styles.voltarLink}>
                  Lembrou a senha?{' '}
                  <Link to="/entrar" className={styles.link}>Entrar</Link>
                </p>
              </form>
            )}

            {/* ── STEP CÓDIGO ── */}
            {step === 'codigo' && (
              <form className={`${styles.form} ${animating ? styles.fadeOut : styles.fadeIn}`} onSubmit={handleVerificarCodigo}>

                {/* Banner de demo (remover após integrar backend) */}
                <div className={styles.demoBanner}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#2563EB" strokeWidth="1.5"/>
                    <path d="M8 7v5M8 5v.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>
                    <strong>Demo:</strong> código para testes →{' '}
                    <span className={styles.codigoDemo}>{codigoReal}</span>
                  </span>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Código de verificação</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className={`${styles.input} ${styles.inputCodigo} ${erroCodigo ? styles.inputError : ''}`}
                    placeholder="000000"
                    value={codigoInput}
                    onChange={(e) => { setCodigoInput(e.target.value.replace(/\D/g, '')); setErroCodigo(''); }}
                    autoFocus
                  />
                  {erroCodigo && <span className={styles.erro}>{erroCodigo}</span>}
                </div>

                <button type="submit" className={styles.btnPrimary} disabled={codigoInput.length < 6}>
                  Verificar código
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 9h12M10 4l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className={styles.reenvioRow}>
                  <span className={styles.reenvioText}>Não recebeu?</span>
                  <button
                    type="button"
                    className={`${styles.reenvioBtn} ${reenvioTimer > 0 ? styles.reenvioBtnDisabled : ''}`}
                    onClick={handleReenviar}
                    disabled={reenvioTimer > 0}
                  >
                    {reenvioTimer > 0 ? `Reenviar em ${reenvioTimer}s` : 'Reenviar código'}
                  </button>
                </div>

                <button type="button" className={styles.btnSecondary} onClick={() => irPara('email')}>
                  Voltar
                </button>
              </form>
            )}

            {/* ── STEP SENHA ── */}
            {step === 'senha' && (
              <form className={`${styles.form} ${animating ? styles.fadeOut : styles.fadeIn}`} onSubmit={handleRedefinirSenha}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Nova senha</label>
                  <input
                    type="password"
                    className={`${styles.input} ${erroSenha ? styles.inputError : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    value={senhaNova}
                    onChange={(e) => { setSenhaNova(e.target.value); setErroSenha(''); }}
                    autoFocus
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Confirmar nova senha</label>
                  <input
                    type="password"
                    className={`${styles.input} ${erroSenha ? styles.inputError : ''}`}
                    placeholder="Repita a senha"
                    value={senhaConfirm}
                    onChange={(e) => { setSenhaConfirm(e.target.value); setErroSenha(''); }}
                  />
                  {erroSenha && <span className={styles.erro}>{erroSenha}</span>}
                </div>

                {/* Indicador de força da senha */}
                {senhaNova.length > 0 && (
                  <div className={styles.forcaSenha}>
                    <div className={styles.forcaBarras}>
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className={`${styles.forcaBarra} ${
                            senhaNova.length >= n * 3
                              ? n <= 1 ? styles.forcaFraca
                              : n <= 2 ? styles.forcaMedia
                              : styles.forcaForte
                              : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className={styles.forcaLabel}>
                      {senhaNova.length < 4 ? 'Muito fraca'
                        : senhaNova.length < 7 ? 'Fraca'
                        : senhaNova.length < 10 ? 'Boa'
                        : 'Forte'}
                    </span>
                  </div>
                )}

                <button type="submit" className={styles.btnPrimary}>
                  Redefinir senha
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 9h12M10 4l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            )}

            {/* ── STEP SUCESSO ── */}
            {step === 'sucesso' && (
              <div className={`${styles.sucesso} ${animating ? styles.fadeOut : styles.fadeIn}`}>
                <div className={styles.sucessoIconWrap}>
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                    <circle cx="26" cy="26" r="24" fill="#EFF8F0" stroke="#22c55e" strokeWidth="2"/>
                    <path d="M14 26l8 8 16-16" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className={styles.sucessoMsg}>
                  Sua senha foi redefinida com sucesso! Agora você pode entrar com a nova senha.
                </p>
                <button className={styles.btnPrimary} onClick={() => navigate('/entrar')}>
                  Ir para o login
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 9h12M10 4l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}

          </div>

          {/* ── Coluna direita — imagem ── */}
          <div className={styles.imageCol}>
            <img src={imgLogin} alt="LearnMaster" className={styles.image} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default EsqueceuSenhaPage;
