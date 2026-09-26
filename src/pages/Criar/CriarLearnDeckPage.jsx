import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Fichario from '@/components/Fichario/Fichario';
import Icone from '@/components/Icone/Icone';
import { MensagemErro } from '@/components/EstadoTela/EstadoTela';
import { visualDoAssunto } from '@/utils/assunto';
import Passos from './Passos';
import styles from './Criacao.module.css';

const MAX = 50;
const SUGESTOES = ['Matemática', 'Português', 'Inglês', 'História', 'Biologia', 'Física', 'Química', 'Programação'];

const CriarLearnDeckPage = () => {
  const { mainDecks, createMainDeck } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [criado, setCriado] = useState(null);
  const campoRef = useRef(null);

  const limpo = nome.trim();
  const jaExiste = mainDecks.some((m) => m.nome.trim().toLowerCase() === limpo.toLowerCase());
  const primeiro = mainDecks.length === 0 && !criado;

  // A prévia fica azul até existir; depois usa a cor fixa do LearnDeck
  const visual = criado ? visualDoAssunto(criado.nome, criado.id) : visualDoAssunto(limpo, null);

  const criar = async () => {
    if (!limpo || salvando) return;
    setErro('');
    setSalvando(true);
    try {
      setCriado(await createMainDeck(limpo));
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const criarOutro = () => {
    setCriado(null);
    setNome('');
    requestAnimationFrame(() => campoRef.current?.focus());
  };

  return (
    <div className={styles.page}>
      <Passos atual={1} />

      <main className={styles.palco}>
        <div className={styles.grade}>
          <section className={styles.form}>
            {!criado ? (
              <>
                <div>
                  <p className={styles.sobretitulo}>{primeiro ? 'Seu primeiro LearnDeck' : 'Novo LearnDeck'}</p>
                  <h1 className={styles.titulo}>O que você vai estudar?</h1>
                  <p className={styles.descricao}>
                    O LearnDeck é o fichário de um assunto. Dentro dele ficam os decks, e dentro dos decks, os cards.
                  </p>
                </div>

                <form
                  className={styles.campoGrupo}
                  onSubmit={(e) => { e.preventDefault(); criar(); }}
                >
                  <label className={styles.rotulo} htmlFor="nome-learndeck">Nome do assunto</label>
                  <div className={styles.campoLinha}>
                    <input
                      id="nome-learndeck"
                      ref={campoRef}
                      className={styles.campo}
                      value={nome}
                      maxLength={MAX}
                      placeholder="Ex.: Matemática"
                      onChange={(e) => { setNome(e.target.value.slice(0, MAX)); setErro(''); }}
                      autoFocus
                      autoComplete="off"
                    />
                    <span className={`${styles.contador} ${nome.length >= MAX ? styles.contadorLimite : ''}`}>{nome.length}/{MAX}</span>
                    <button type="submit" className={styles.principal} disabled={!limpo || salvando}>
                      {salvando ? 'Criando...' : 'Criar'}
                    </button>
                  </div>
                  {jaExiste && <span className={styles.dica}>Você já tem um LearnDeck com esse nome.</span>}
                  <span className={styles.dica}><kbd>Enter</kbd> cria o LearnDeck</span>
                </form>

                <div className={styles.campoGrupo}>
                  <span className={styles.rotulo}>Sugestões</span>
                  <div className={styles.sugestoes}>
                    {SUGESTOES.map((s) => {
                      const v = visualDoAssunto(s, SUGESTOES.indexOf(s));
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`${styles.sugestao} ${limpo === s ? styles.sugestaoAtiva : ''}`}
                          style={{ '--cor': v.cor, '--suaveCor': v.suave }}
                          onClick={() => { setNome(s); setErro(''); campoRef.current?.focus(); }}
                        >
                          <Icone nome={v.icone} tamanho={16} /> {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <MensagemErro>{erro}</MensagemErro>
              </>
            ) : (
              <div className={styles.sucesso} role="status">
                <span className={styles.sucessoSelo}><Icone nome="check" tamanho={15} /> LearnDeck criado</span>
                <h1 className={styles.titulo}>{criado.nome} está pronto.</h1>
                <p className={styles.descricao}>
                  Agora crie os decks dentro dele, por exemplo um para cada capítulo ou tema.
                </p>
                <div className={styles.botoes}>
                  <button className={styles.principal} onClick={() => navigate(`/criar/deck?learndeck=${criado.id}`)}>
                    Criar decks em {criado.nome} <Icone nome="seta" tamanho={18} />
                  </button>
                  <button className={styles.secundario} onClick={criarOutro}>Criar outro LearnDeck</button>
                  <button className={styles.textoBotao} onClick={() => navigate('/app/decks')}>Ver meus LearnDecks</button>
                </div>
              </div>
            )}
          </section>

          <aside className={styles.previa} aria-label="Prévia do LearnDeck">
            <span className={styles.previaRotulo}>{criado ? 'Criado' : 'Prévia'}</span>
            <div className={styles.previaFichario}>
              <Fichario
                nome={criado?.nome ?? (limpo || 'Nome do assunto')}
                vazio={!criado && !limpo}
                visual={visual}
                meta={criado ? 'Nenhum deck ainda' : '0 decks · 0 cards'}
                progresso={0}
              />
            </div>
            {!criado && <p className={styles.previaNota}>O ícone muda conforme o assunto que você escreve.</p>}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CriarLearnDeckPage;
