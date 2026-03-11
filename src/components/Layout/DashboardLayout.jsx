import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => (
  <div className={styles.layout}>
    <Sidebar />
    <main className={styles.main}>
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout;
