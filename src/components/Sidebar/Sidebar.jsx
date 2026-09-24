import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import logo from '@/assets/images/LearnMasterBranca.png';

import iconMemorizarDefault from '@/assets/images/IconMemorizarDefault.png';
import iconMemorizarActive  from '@/assets/images/IconMemorizarActive.png';
import iconCriarDefault     from '@/assets/images/IconCriarDefault.png';
import iconCriarActive      from '@/assets/images/IconCriarActive.png';
import iconVerTodosDefault  from '@/assets/images/IconVerTodosDefault.png';
import iconVerTodosActive   from '@/assets/images/IconVerTodosActive.png';
import iconPerfilDefault    from '@/assets/images/IconPerfilDefault.png';
import iconPerfilActive     from '@/assets/images/IconPerfilActive.png';
import iconMaisDefault      from '@/assets/images/IconMaisDefault.png';
import iconMaisActive       from '@/assets/images/IconMaisActive.png';

const NAV_ITEMS = [
  { label: 'Memorizar', to: '/app',         iconDefault: iconMemorizarDefault, iconActive: iconMemorizarActive, changeIcon: false },
  { label: 'Criar',     to: '/app/criar',   iconDefault: iconCriarDefault,     iconActive: iconCriarActive,     changeIcon: true  },
  { label: 'Ver todos', to: '/app/decks',   iconDefault: iconVerTodosDefault,  iconActive: iconVerTodosActive,  changeIcon: true  },
  { label: 'Perfil',    to: '/app/perfil',  iconDefault: iconPerfilDefault,    iconActive: iconPerfilActive,    changeIcon: true  },
  { label: 'Mais',      to: '/app/mais',    iconDefault: iconMaisDefault,      iconActive: iconMaisActive,      changeIcon: true  },
];

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrapper}>
        <img src={logo} alt="LearnMaster" className={styles.logo} />
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          // "Ver todos" continua ativo dentro de /app/decks/...
          const isActive = item.to === '/app' ? pathname === '/app' : pathname.startsWith(item.to);
          const icon = (item.changeIcon && isActive) ? item.iconActive : item.iconDefault;

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              {isActive && <span className={styles.activeBar} />}

              {/* span com tamanho fixo — impede deslocamento ao trocar ícone */}
              <span className={styles.iconWrapper}>
                <img
                  src={icon}
                  alt=""
                  className={`${styles.navIcon} ${item.extraClass ? styles[item.extraClass] : ''}`}
                />
              </span>

              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;