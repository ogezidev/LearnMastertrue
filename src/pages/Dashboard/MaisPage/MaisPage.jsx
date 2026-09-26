import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import CampoSenha from '@/components/CampoSenha/CampoSenha';
import Icone from '@/components/Icone/Icone';
import SenhaRegras from '@/components/SenhaRegras/SenhaRegras';
import { senhaValida } from '@/utils/senha';
import styles from './MaisPage.module.css';

const SECOES = [
  { chave: 'aparencia', rotulo: 'Aparência', icone: 'lua', desc: 'Tema e leitura' },
  { chave: 'email', rotulo: 'E-mail', icone: 'email', desc: 'Endereço da conta' },
  { chave: 'senha', rotulo: 'Senha', icone: 'cadeado', desc: 'Segurança' },
  { chave: 'sair', rotulo: 'Sair', icone: 'sair', desc: 'Encerrar sessão' },
];

const Interruptor = ({ ligado, onClick, rotulo }) => (
  <button
    type="button"
    role="switch"
    aria-checked={ligado}
    aria-label={rotulo}
    className={`${styles.interruptor} ${ligado ? styles.ligado : ''}`}
    onClick={onClick}
  >
    <span />
  </button>
);

// Configurações: menu à esquerda (sobre o painel azul) e a seção escolhida num cartão à direita
const MaisPage = () => {
  const { user, alterarEmail, alterarSenha, logout, darkMode, toggleDarkMode, dyslexiaFont, toggleDyslexiaFont } = useApp();
  const navigate = useNavigate();
  const [secao, setSecao] = useState('aparencia');
  const [erroPreferencia, setErroPreferencia] = useState('');

  // E-mail
  const [emailNovo, setEmailNovo] = useState('');
  const [emailSenha, setEmailSenha] = useState('');
  const [emailErro, setEmailErro] = useState('');
  const [emailSalvando, setEmailSalvando] = useState(false);
  const [emailOk, setEmailOk] = useState(false);

  // Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [senhaErro, setSenhaErro] = useState('');
  const [senhaSalvando, setSenhaSalvando] = useState(false);
  const [senhaOk, setSenhaOk] = useState(false);

  const [saindo, setSaindo] = useState(false);

  // As preferências são gravadas no banco; se falhar, o interruptor volta e aparece o aviso
  const alternar = async (acao) => {
    setErroPreferencia('');
    try {
      await acao();
    } catch (err) {
      setErroPreferencia(err.message);
    }
  };

  const trocarSecao = (chave) => {
    setSecao(chave);
    setEmailErro(''); setEmailOk(false);
    setSenhaErro(''); setSenhaOk(false);
  };

  // A senha atual é conferida no servidor
  const salvarEmail = async (e) => {
    e.preventDefault();
    const novo = emailNovo.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novo)) return setEmailErro('Digite um e-mail válido.');
    if (!emailSenha) return setEmailErro('Informe sua senha atual.');
    setEmailErro('');
    setEmailSalvando(true);
    try {
      await alterarEmail(novo, emailSenha);
      setEmailOk(true);
      setEmailNovo('');
      setEmailSenha('');
    } catch (err) {
      setEmailErro(err.message);
    } finally {
      setEmailSalvando(false);
    }
  };

  const salvarSenha = async (e) => {
    e.preventDefault();
    if (!senhaAtual) return setSenhaErro('Informe sua senha atual.');
    if (!senhaValida(senhaNova)) return setSenhaErro('A nova senha não atende a todas as regras.');
    if (senhaNova !== senhaConfirm) return setSenhaErro('As senhas não coincidem.');
    setSenhaErro('');
    setSenhaSalvando(true);
    try {
      await alterarSenha(senhaAtual, senhaNova);
      setSenhaOk(true);
      setSenhaAtual(''); setSenhaNova(''); setSenhaConfirm('');
    } catch (err) {
      setSenhaErro(err.message);
    } finally {
      setSenhaSalvando(false);
    }
  };

  // Sai da área logada antes de limpar a sessão; senão a rota protegida redireciona para /entrar
  const sair = async () => {
    setSaindo(true);
    navigate('/');
    await logout();
  };

  const inicial = (user?.nome ?? '?').trim().charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      {/* ── Menu (sobre o azul) ── */}
      <aside className={styles.lateral}>
        <div>
          <h1 className={styles.titulo}>Configurações</h1>
          <p className={styles.subtitulo}>Deixe o LearnMaster do seu jeito</p>
        </div>

        <div className={styles.conta}>
          <span className={styles.avatar} aria-hidden="true">{inicial}</span>
          <span className={styles.contaTexto}>
            <strong>{user?.nome}</strong>
            <span>{user?.email}</span>
          </span>
        </div>

        <nav className={styles.menu} aria-label="Seções das configurações">
          {SECOES.map((s) => (
            <button
              key={s.chave}
              type="button"
              className={`${styles.menuItem} ${secao === s.chave ? styles.menuAtivo : ''} ${s.chave === 'sair' ? styles.menuSair : ''}`}
              onClick={() => trocarSecao(s.chave)}
              aria-current={secao === s.chave ? 'page' : undefined}
            >
              <span className={styles.menuIcone}><Icone nome={s.icone} tamanho={18} /></span>
              <span className={styles.menuTexto}>
                <strong>{s.rotulo}</strong>
                <span>{s.desc}</span>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Seção escolhida ── */}
      <section className={styles.cartao} key={secao} aria-live="polite">
        {secao === 'aparencia' && (
          <>
            <header className={styles.cartaoTopo}>
              <h2>Aparência</h2>
              <p>As escolhas ficam salvas na sua conta e valem em qualquer aparelho.</p>
            </header>

            <div className={styles.opcoes}>
              <div className={`${styles.opcao} ${darkMode ? styles.opcaoLigada : ''}`}>
                <div className={`${styles.previa} ${styles.previaTema}`} aria-hidden="true">
                  <span className={styles.miniClaro}><i /><i /><i /></span>
                  <span className={styles.miniEscuro}><i /><i /><i /></span>
                </div>
                <div className={styles.opcaoTexto}>
                  <strong>Modo noturno</strong>
                  <span>Fundo escuro para estudar à noite e cansar menos a vista.</span>
                </div>
                <Interruptor ligado={darkMode} rotulo="Modo noturno" onClick={() => alternar(toggleDarkMode)} />
              </div>

              <div className={`${styles.opcao} ${dyslexiaFont ? styles.opcaoLigada : ''}`}>
                <div className={`${styles.previa} ${styles.previaFonte}`} aria-hidden="true">
                  <span className={styles.letraNormal}>Aa</span>
                  <span className={styles.letraDislexia}>Aa</span>
                </div>
                <div className={styles.opcaoTexto}>
                  <strong>Fonte para dislexia</strong>
                  <span>Letras mais espaçadas e com formas que não se confundem.</span>
                </div>
                <Interruptor ligado={dyslexiaFont} rotulo="Fonte para dislexia" onClick={() => alternar(toggleDyslexiaFont)} />
              </div>
            </div>
            {erroPreferencia && <p className={styles.erro} role="alert">{erroPreferencia}</p>}
          </>
        )}

        {secao === 'email' && (
          <>
            <header className={styles.cartaoTopo}>
              <h2>E-mail</h2>
              <p>É com ele que você entra no site e no app.</p>
            </header>
            <div className={styles.atual}>
              <Icone nome="email" tamanho={18} />
              <span>Atual: <strong>{user?.email}</strong></span>
            </div>
            <form className={styles.form} onSubmit={salvarEmail} noValidate>
              <label htmlFor="email-novo">Novo e-mail</label>
              <input
                id="email-novo"
                type="email"
                className={styles.campo}
                value={emailNovo}
                onChange={(e) => { setEmailNovo(e.target.value); setEmailErro(''); setEmailOk(false); }}
                placeholder="novo@email.com"
                maxLength={255}
                autoComplete="email"
              />
              <label htmlFor="email-senha-atual">Senha atual</label>
              <CampoSenha
                id="email-senha-atual"
                className={styles.campo}
                value={emailSenha}
                onChange={(e) => { setEmailSenha(e.target.value); setEmailErro(''); }}
                autoComplete="current-password"
              />
              <p className={styles.dica}>Por segurança, confirme sua senha atual.</p>
              {emailErro && <p className={styles.erro} role="alert">{emailErro}</p>}
              {emailOk && <p className={styles.ok} role="status"><Icone nome="check" tamanho={16} /> E-mail atualizado.</p>}
              <button type="submit" className={styles.principal} disabled={emailSalvando}>
                {emailSalvando ? 'Salvando...' : 'Salvar e-mail'}
              </button>
            </form>
          </>
        )}

        {secao === 'senha' && (
          <>
            <header className={styles.cartaoTopo}>
              <h2>Senha</h2>
              <p>Ao trocar a senha, seus outros aparelhos são desconectados.</p>
            </header>
            <form className={styles.form} onSubmit={salvarSenha} noValidate>
              <label htmlFor="senha-atual">Senha atual</label>
              <CampoSenha
                id="senha-atual"
                className={styles.campo}
                value={senhaAtual}
                onChange={(e) => { setSenhaAtual(e.target.value); setSenhaErro(''); setSenhaOk(false); }}
                autoComplete="current-password"
              />
              <div className={styles.duasColunas}>
                <div>
                  <label htmlFor="senha-nova">Nova senha</label>
                  <CampoSenha
                    id="senha-nova"
                    className={styles.campo}
                    value={senhaNova}
                    onChange={(e) => { setSenhaNova(e.target.value); setSenhaErro(''); }}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="senha-confirmar">Confirmar nova senha</label>
                  <CampoSenha
                    id="senha-confirmar"
                    className={`${styles.campo} ${senhaConfirm && senhaNova !== senhaConfirm ? styles.campoErro : ''}`}
                    value={senhaConfirm}
                    onChange={(e) => { setSenhaConfirm(e.target.value); setSenhaErro(''); }}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              {senhaNova.length > 0 && <SenhaRegras senha={senhaNova} />}
              {senhaConfirm && senhaNova !== senhaConfirm && <p className={styles.erro}>As senhas não coincidem.</p>}
              {senhaErro && <p className={styles.erro} role="alert">{senhaErro}</p>}
              {senhaOk && <p className={styles.ok} role="status"><Icone nome="check" tamanho={16} /> Senha alterada. Os outros aparelhos foram desconectados.</p>}
              <button type="submit" className={styles.principal} disabled={senhaSalvando}>
                {senhaSalvando ? 'Salvando...' : 'Alterar senha'}
              </button>
            </form>
          </>
        )}

        {secao === 'sair' && (
          <div className={styles.sair}>
            <span className={styles.sairIcone}><Icone nome="sair" tamanho={28} /></span>
            <h2>Sair da conta?</h2>
            <p>Seus LearnDecks, cards e avaliações continuam salvos. É só entrar de novo quando quiser.</p>
            <div className={styles.sairBotoes}>
              <button type="button" className={styles.perigo} onClick={sair} disabled={saindo}>
                {saindo ? 'Saindo...' : 'Sair da conta'}
              </button>
              <button type="button" className={styles.secundario} onClick={() => trocarSecao('aparencia')}>Cancelar</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MaisPage;
