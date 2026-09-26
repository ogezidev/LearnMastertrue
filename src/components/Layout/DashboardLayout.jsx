import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar';
import TutorialOverlay from '@/components/TutorialOverlay/TutorialOverlay';
import { useApp } from '@/context/AppContext';
import styles from './DashboardLayout.module.css';

/*
 * O painel azul é o mesmo em Memorizar, Criar, Ver todos, Perfil e Mais:
 * ele fica aqui (e não em cada página), então trocar de aba só troca o conteúdo de dentro.
 */
const DashboardLayout = () => {
  const { tutorialDone, markTutorialDone } = useApp();
  const { pathname } = useLocation();

  // Uma "seção" por aba: navegar dentro de Ver todos também troca o conteúdo com o fade
  const secao = pathname;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.painel}>
          <div className={styles.decoracao} aria-hidden="true">
            <span className={styles.bolhaGrande} />
            <span className={styles.bolhaPequena} />
          </div>
          <div key={secao} className={styles.conteudo}>
            <Outlet />
          </div>
        </div>
      </main>
      {!tutorialDone && <TutorialOverlay onDone={markTutorialDone} />}
    </div>
  );
};

export default DashboardLayout;
