import { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './PerfilPage.module.css';

const PerfilPage = () => {
  const { user, atualizarNome, mainDecks, decks, dadosCarregados } = useApp();
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameErro, setNameErro] = useState('');
  const [salvandoNome, setSalvandoNome] = useState(false);

  const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
  };

  const startEditName = () => {
    setNameInput(user?.nome ?? '');
    setNameErro('');
    setEditingName(true);
  };

  // Salva no servidor; o novo nome aparece em todo o sistema pelo contexto
  const saveEditName = async () => {
    if (salvandoNome) return;
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === user?.nome) {
      setEditingName(false);
      return;
    }
    setSalvandoNome(true);
    try {
      await atualizarNome(trimmed);
      setNameErro('');
      setEditingName(false);
    } catch (err) {
      setNameErro(err.message);
    } finally {
      setSalvandoNome(false);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') saveEditName();
    if (e.key === 'Escape') { setEditingName(false); setNameErro(''); }
  };

  const initials = user?.nome
    ? user.nome.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const stats = [
    {
      icon: (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <rect x="5"  y="7"  width="24" height="4.5" rx="2.25" fill="white" opacity="0.9"/>
          <rect x="5"  y="15" width="24" height="4.5" rx="2.25" fill="white" opacity="0.7"/>
          <rect x="5"  y="23" width="24" height="4.5" rx="2.25" fill="white" opacity="0.5"/>
        </svg>
      ),
      value: mainDecks.length,
      label: 'LearnDecks',
    },
    {
      icon: (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <rect x="7"  y="9"  width="22" height="17" rx="4" fill="white" opacity="0.45"/>
          <rect x="5"  y="7"  width="22" height="17" rx="4" fill="white" opacity="0.75"/>
          <rect x="9"  y="12" width="14" height="3"  rx="1.5" fill="#368BFF"/>
          <rect x="9"  y="18" width="9"  height="3"  rx="1.5" fill="#368BFF" opacity="0.55"/>
        </svg>
      ),
      value: decks.length,
      label: 'Decks',
    },
    {
      icon: (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <rect x="9"  y="11" width="20" height="15" rx="3.5" fill="white" opacity="0.45"/>
          <rect x="7"  y="9"  width="20" height="15" rx="3.5" fill="white" opacity="0.75"/>
          <rect x="11" y="13" width="12" height="3"  rx="1.5" fill="#368BFF"/>
          <rect x="11" y="19" width="8"  height="3"  rx="1.5" fill="#368BFF" opacity="0.55"/>
        </svg>
      ),
      value: totalCards,
      label: 'Flashcards',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.mainCard}>

        {/* Avatar flutuando acima do card */}
        <div className={styles.avatarWrap} onClick={handleAvatarClick} title="Alterar foto">
          <div className={styles.avatarRing}>
            {avatarUrl
              ? <img className={styles.avatarImg} src={avatarUrl} alt="Avatar" />
              : <span className={styles.avatarInitials}>{initials}</span>
            }
          </div>
          <div className={styles.avatarOverlay}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" fill="white"/>
              <path d="M9.5 3L8.17 4.5H5A2.5 2.5 0 0 0 2.5 7v11A2.5 2.5 0 0 0 5 20.5h14A2.5 2.5 0 0 0 21.5 18V7A2.5 2.5 0 0 0 19 4.5h-3.17L14.5 3h-5z" fill="white" opacity="0.7"/>
            </svg>
            <span>Alterar foto</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileChange}
          />
        </div>

        {/* Conteúdo do card */}
        <div className={styles.cardContent}>

          {/* Nome editável */}
          <div className={styles.nameRow}>
            {editingName ? (
              <input
                className={styles.nameInput}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={saveEditName}
                autoFocus
                maxLength={40}
              />
            ) : (
              <h2 className={styles.userName}>{user?.nome ?? 'Usuário'}</h2>
            )}
            <button
              className={`${styles.editNameBtn} ${editingName ? styles.editNameBtnActive : ''}`}
              onClick={editingName ? saveEditName : startEditName}
              title={editingName ? 'Salvar' : 'Editar nome'}
            >
              {editingName
                ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 8.5l3.5 3.5 7.5-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 1.5a1.5 1.5 0 0 1 2.12 2.12L4.5 11.75 1.5 12.5l.75-3L10.5 1.5z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              }
            </button>
          </div>

          {nameErro && <p className={styles.nameErro} role="alert">{nameErro}</p>}

          {user?.email && <p className={styles.userEmail}>{user.email}</p>}

          <div className={styles.divider} />

          <div className={styles.statsRow}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statTile}>
                <div className={styles.statIcon}>{s.icon}</div>
                <div className={styles.statValue}>{dadosCarregados ? s.value : '–'}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PerfilPage;
