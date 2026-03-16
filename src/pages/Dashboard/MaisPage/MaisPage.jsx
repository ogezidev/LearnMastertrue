import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import styles from './MaisPage.module.css';

/* ── Toggle switch ── */
const Toggle = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
    onClick={onChange}
  >
    <span className={styles.toggleThumb} />
  </button>
);

/* ── Settings row ── */
const Row = ({ icon, title, desc, control, danger, iconBg }) => (
  <div className={`${styles.row} ${danger ? styles.rowDanger : ''}`}>
    <div className={styles.rowIcon} style={iconBg ? { background: iconBg } : {}}>{icon}</div>
    <div className={styles.rowText}>
      <span className={styles.rowTitle}>{title}</span>
      <span className={styles.rowDesc}>{desc}</span>
    </div>
    <div className={styles.rowControl}>{control}</div>
  </div>
);

/* ── Main page ── */
const MaisPage = () => {
  const { user, updateUser, logout, darkMode, toggleDarkMode, dyslexiaFont, toggleDyslexiaFont } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState('main'); // 'main' | 'email' | 'senha' | 'logout'

  /* ── Email form state ── */
  const [emailInput, setEmailInput] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);

  /* ── Senha form state ── */
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [senhaMsg, setSenhaMsg] = useState(null);

  const handleSaveEmail = async () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@')) return;
    await updateUser({ email: trimmed });
    setEmailSaved(true);
    setTimeout(() => { setEmailSaved(false); setView('main'); setEmailInput(''); }, 1400);
  };

  const handleSaveSenha = async () => {
    if (!senhaAtual || !senhaNova || senhaNova !== senhaConfirm) {
      setSenhaMsg('error');
      return;
    }
    if (senhaAtual !== user?.senha) {
      setSenhaMsg('error');
      return;
    }
    await updateUser({ senha: senhaNova });
    setSenhaMsg('ok');
    setTimeout(() => { setSenhaMsg(null); setView('main'); setSenhaAtual(''); setSenhaNova(''); setSenhaConfirm(''); }, 1600);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const viewTitle = view === 'email' ? 'Alterar E-mail'
    : view === 'senha' ? 'Alterar Senha'
    : view === 'logout' ? 'Confirmar saída'
    : 'Mais opções';

  return (
    <div className={styles.page}>
      <div className={styles.mainCard}>

        {/* ── Header ── */}
        <div className={styles.header}>
          {view !== 'main' && (
            <button className={styles.backBtn} onClick={() => setView('main')}>Voltar</button>
          )}
          <div className={styles.headerText}>
            <h2 className={styles.headerTitle}>{viewTitle}</h2>
            {view === 'main' && (
              <p className={styles.headerSub}>Personalize sua experiência no LearnMaster</p>
            )}
          </div>
        </div>

        {/* ── Panel ── */}
        <div className={styles.panel}>

          {/* ── MAIN VIEW ── */}
          {view === 'main' && (
            <>
              <Row
                iconBg="#f0f4ff"
                icon={<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3C9.13 3 6 6.13 6 10c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.26A7 7 0 0 0 13 3zm-1 14h2v1h-2v-1z" fill="#4A90D9"/><path d="M20 2.5a8.5 8.5 0 0 1-10 8.3A8.5 8.5 0 0 0 21.5 12c0-4.5-3.5-8.2-7.9-8.5A8.55 8.55 0 0 1 20 2.5z" fill="#1E3A5F"/></svg>}
                title="Modo noturno"
                desc="Ative o tema escuro para reduzir o cansaço visual"
                control={<Toggle checked={darkMode} onChange={toggleDarkMode} />}
              />
              <Row
                iconBg="#f5f3ff"
                icon={<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><text x="3" y="20" fontSize="18" fontWeight="800" fill="#7c3aed" fontFamily="serif">A</text></svg>}
                title="Fonte Dislexia"
                desc="Utilize fonte apropriada para pessoas com dislexia"
                control={<Toggle checked={dyslexiaFont} onChange={toggleDyslexiaFont} />}
              />
              <Row
                iconBg="#f0fdf4"
                icon={<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="4" y="6" width="18" height="14" rx="2" stroke="#16a34a" strokeWidth="1.8" fill="none"/><path d="M4 10h18" stroke="#16a34a" strokeWidth="1.8"/><circle cx="8.5" cy="8" r="1" fill="#16a34a"/><circle cx="13" cy="8" r="1" fill="#16a34a"/></svg>}
                title="Alterar E-mail"
                desc={user?.email ?? 'Atualize seu endereço de e-mail'}
                control={
                  <button className={styles.arrowBtn} onClick={() => { setEmailInput(user?.email ?? ''); setView('email'); }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6.5 4l5 5-5 5" stroke="#368BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                }
              />
              <Row
                iconBg="#fff7ed"
                icon={<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="6" y="11" width="14" height="10" rx="2" fill="none" stroke="#ea7c1e" strokeWidth="1.8"/><path d="M9 11V8a4 4 0 0 1 8 0v3" stroke="#ea7c1e" strokeWidth="1.8" strokeLinecap="round"/><circle cx="13" cy="16" r="1.5" fill="#ea7c1e"/></svg>}
                title="Alterar Senha"
                desc="Redefina sua senha de acesso"
                control={
                  <button className={styles.arrowBtn} onClick={() => setView('senha')}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6.5 4l5 5-5 5" stroke="#368BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                }
              />
              <Row
                iconBg="#fff0f0"
                icon={<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M10 6H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3M16.5 17l4-4-4-4M20.5 13H10" stroke="#e03b3b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                title="Logout"
                desc="Saia da sua conta"
                danger
                control={
                  <button className={styles.sairBtn} onClick={() => setView('logout')}>Sair</button>
                }
              />
            </>
          )}

          {/* ── EMAIL FORM ── */}
          {view === 'email' && (
            <div className={styles.form}>
              <div className={styles.formIcon}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="7" width="24" height="18" rx="3" stroke="#368BFF" strokeWidth="2" fill="none"/><path d="M4 11l12 8 12-8" stroke="#368BFF" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <p className={styles.formDesc}>Insira o novo endereço de e-mail que deseja usar na sua conta.</p>
              <label className={styles.formLabel}>Novo e-mail</label>
              <input
                className={styles.formInput}
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="seu@email.com"
                onKeyDown={e => e.key === 'Enter' && handleSaveEmail()}
                autoFocus
              />
              <p className={styles.formHint}>
                Após salvar, o e-mail será atualizado no sistema.
              </p>
              <button
                className={`${styles.formSaveBtn} ${emailSaved ? styles.formSaveBtnOk : ''}`}
                onClick={handleSaveEmail}
              >
                {emailSaved ? '✓ Salvo!' : 'Salvar e-mail'}
              </button>
            </div>
          )}

          {/* ── SENHA FORM ── */}
          {view === 'senha' && (
            <div className={styles.form}>
              <div className={styles.formIcon}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="7" y="14" width="18" height="13" rx="3" stroke="#ea7c1e" strokeWidth="2" fill="none"/><path d="M11 14V10a5 5 0 0 1 10 0v4" stroke="#ea7c1e" strokeWidth="2" strokeLinecap="round"/><circle cx="16" cy="20.5" r="2" fill="#ea7c1e"/></svg>
              </div>
              <p className={styles.formDesc}>Escolha uma senha forte para proteger sua conta.</p>
              <label className={styles.formLabel}>Senha atual</label>
              <input
                className={styles.formInput}
                type="password"
                value={senhaAtual}
                onChange={e => setSenhaAtual(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
              <label className={styles.formLabel}>Nova senha</label>
              <input
                className={styles.formInput}
                type="password"
                value={senhaNova}
                onChange={e => setSenhaNova(e.target.value)}
                placeholder="••••••••"
              />
              <label className={styles.formLabel}>Confirmar nova senha</label>
              <input
                className={`${styles.formInput} ${senhaMsg === 'error' ? styles.formInputError : ''}`}
                type="password"
                value={senhaConfirm}
                onChange={e => { setSenhaConfirm(e.target.value); setSenhaMsg(null); }}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSaveSenha()}
              />
              {senhaMsg === 'error' && <p className={styles.formError}>As senhas não coincidem ou estão em branco.</p>}
              <button
                className={`${styles.formSaveBtn} ${senhaMsg === 'ok' ? styles.formSaveBtnOk : ''}`}
                onClick={handleSaveSenha}
              >
                {senhaMsg === 'ok' ? '✓ Senha alterada!' : 'Salvar senha'}
              </button>
            </div>
          )}

          {/* ── LOGOUT CONFIRM ── */}
          {view === 'logout' && (
            <div className={styles.logoutConfirm}>
              <div className={styles.logoutIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#e03b3b" strokeWidth="2.5" fill="rgba(224,59,59,0.08)"/><path d="M18 10H12a4 4 0 0 0-4 4v20a4 4 0 0 0 4 4h6M30 34l8-8-8-8M38 26H18" stroke="#e03b3b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className={styles.logoutTitle}>Deseja realmente sair?</h3>
              <p className={styles.logoutDesc}>Você será redirecionado para a página inicial. Seu progresso permanece salvo.</p>
              <div className={styles.logoutActions}>
                <button className={styles.logoutCancelBtn} onClick={() => setView('main')}>
                  Cancelar
                </button>
                <button className={styles.logoutConfirmBtn} onClick={handleLogout}>
                  Sim, sair
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MaisPage;
