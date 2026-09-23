import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar';
import TutorialOverlay from '@/components/TutorialOverlay/TutorialOverlay';
import { useApp } from '@/context/AppContext';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  const { tutorialDone, markTutorialDone, darkMode } = useApp();

  // Aplica dark mode apenas enquanto o dashboard estiver montado
  useEffect(() => {
    document.documentElement.setAttribute('data-dark', darkMode ? 'true' : 'false');
    return () => document.documentElement.setAttribute('data-dark', 'false');
  }, [darkMode]);

  const showTutorial = !tutorialDone;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
      {showTutorial && <TutorialOverlay onDone={markTutorialDone} />}
    </div>
  );
};

export default DashboardLayout;
