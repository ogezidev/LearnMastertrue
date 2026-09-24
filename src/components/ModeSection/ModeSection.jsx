import { useState } from 'react';
import styles from './ModeSection.module.css';
import iconEstudanteDefault from '@/assets/images/IconEstudanteDefault.png';
import iconEstudanteActive from '@/assets/images/IconEstudanteActive.png';
import iconFamiliaDefault from '@/assets/images/IconFamiliaDefault.png';
import iconFamiliaActive from '@/assets/images/IconFamiliaActive.png';
import imgEstudanteFlashcards from '@/assets/images/ImagemEstudanteFlashcards.png';
import imgEstudanteMemorizacao from '@/assets/images/ImagemEstudanteMemorizacao.png';
import imgEstudanteModerno from '@/assets/images/ImagemEstudanteModerno.png';
import imgFamiliaSequencia from '@/assets/images/ImagemFamiliaSequencia.png';
import imgFamiliaComunicacao from '@/assets/images/ImagemFamiliaComunicacao.png';

const MODES = {
  estudante: {
    key: 'estudante',
    label: 'Para estudantes',
    iconDefault: iconEstudanteDefault,
    iconActive:  iconEstudanteActive,
    bgColor: '#72AEFF',
    titleColor: '#0363E3',
    subtitleColor: '#0363E3',
    accordionColor: '#0363E3',
    arrowColor: '#FFFFFF',
    btnActiveBg: '#9CD1FF',
    btnActiveText: '#023A63',
    imageLeft: false,
    title: 'Ferramenta que transforma seus estudos',
    subtitle: 'A LearnMaster se adequa à proposta de flashcards com o intuito de trazer a rapidez e a memorização efetiva.',
    items: [
      {
        id: 'flashcards',
        label: 'Flashcards e decks',
        text: 'Crie e organize seus flashcards em decks temáticos. Estude de forma estruturada e acompanhe seu progresso a cada sessão de revisão.',
        image: imgEstudanteFlashcards,
      },
      {
        id: 'memorizacao',
        label: 'Memorização e rapidez',
        text: 'Utilize técnicas de repetição espaçada para memorizar conteúdos com muito mais eficiência e em menos tempo.',
        image: imgEstudanteMemorizacao,
      },
      {
        id: 'moderno',
        label: 'Moderno e intuitivo',
        text: 'Interface pensada para facilitar sua rotina de estudos. Acesse de qualquer dispositivo e estude quando e onde quiser.',
        image: imgEstudanteModerno,
      },
    ],
  },
  familia: {
    key: 'familia',
    label: 'Para família',
    iconDefault: iconFamiliaDefault,
    iconActive:  iconFamiliaActive,
    bgColor: '#FFE580',
    titleColor: '#831731',
    subtitleColor: '#831731',
    accordionColor: '#831731',
    arrowColor: '#831731',
    btnActiveBg: '#FFE58F',
    btnActiveText: '#831731',
    imageLeft: true,
    title: 'Ferramentas que aproximam filhos do sucesso',
    subtitle: 'A LearnMaster se adequa à proposta de flashcards com o intuito de trazer o sucesso.',
    items: [
      {
        id: 'sequencia',
        label: 'Acompanhamento de sequencia',
        text: 'Acompanhe de perto a sequência de estudos do seu filho. Veja o progresso e o desempenho em tempo real.',
        image: imgFamiliaSequencia,
      },
      {
        id: 'comunicacao',
        label: 'Comunicação com a equipe',
        text: 'Fique conectado com professores e gestores. Receba notificações e atualizações sobre o aprendizado do seu filho.',
        image: imgFamiliaComunicacao,
      },
    ],
  },
};

// ─── AccordionItem ─────────────────────────────────────────────────
const AccordionItem = ({ item, isOpen, onClick, accentColor, arrowColor }) => (
  <div className={styles.accordionItem}>
    <button
      className={`${styles.accordionBtn} ${isOpen ? styles.accordionBtnOpen : ''}`}
      onClick={onClick}
    >
      <span className={styles.accordionLabel} style={{ color: accentColor }}>
        {item.label}
      </span>
      <span
        className={`${styles.accordionArrow} ${isOpen ? styles.arrowOpen : ''}`}
        style={{ color: arrowColor }}
      >
        →
      </span>
    </button>

    <div className={`${styles.accordionBody} ${isOpen ? styles.accordionBodyOpen : ''}`}>
      <p className={styles.accordionText} style={{ color: accentColor }}>
        {item.text}
      </p>
    </div>

    <div className={styles.accordionDivider} style={{ background: accentColor }} />
  </div>
);

// ─── ModeSection ───────────────────────────────────────────────────
const ModeSection = () => {
  const [activeMode, setActiveMode] = useState('estudante');
  const [openItem, setOpenItem]     = useState(null);
  const [imgVisible, setImgVisible] = useState(true);

  const mode = MODES[activeMode];

  const handleModeChange = (modeKey) => {
    if (modeKey === activeMode) return;
    setImgVisible(false);
    setTimeout(() => {
      setActiveMode(modeKey);
      setOpenItem(null);
      setImgVisible(true);
    }, 220);
  };

  const handleAccordion = (id) => {
    setImgVisible(false);
    setTimeout(() => {
      setOpenItem((prev) => (prev === id ? null : id));
      setImgVisible(true);
    }, 180);
  };

  const currentImage = openItem
    ? mode.items.find((i) => i.id === openItem)?.image
    : mode.items[0]?.image;

  // imageBlock: altura = 100% do textCol (via align-items: stretch no pai)
  const imageBlock = (
    <div className={`${styles.imageBlock} ${imgVisible ? styles.imgVisible : styles.imgHidden}`}>
      <img
        src={currentImage}
        alt="LearnMaster preview"
        className={styles.previewImage}
      />
    </div>
  );

  return (
    <section className={styles.section}>

      {/* Cabeçalho */}
      <div className={styles.header}>
        <h2 className={styles.mainTitle}>Memorize no melhor lugar</h2>
        <p className={styles.mainSubtitle}>
          Flashcards, Decks, LearnDecks: a jornada do aprendizado totalmente personalizada por você.
        </p>
      </div>

      {/* Botões de modo */}
      <div className={styles.modeButtons}>
        {Object.values(MODES).map((m) => {
          const isActive = activeMode === m.key;
          return (
            <button
              key={m.key}
              className={`${styles.modeBtn} ${isActive ? styles.modeBtnActive : ''}`}
              style={
                isActive
                  ? { background: m.btnActiveBg, color: m.btnActiveText, borderColor: m.btnActiveBg }
                  : {}
              }
              onClick={() => handleModeChange(m.key)}
            >
              <img
                src={isActive ? m.iconActive : m.iconDefault}
                alt=""
                className={styles.modeBtnIcon}
              />
              <span className={styles.modeBtnLabel}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Painel */}
      <div className={styles.panel} style={{ background: mode.bgColor }}>

        {mode.imageLeft && imageBlock}

        {/* Coluna de texto */}
        <div className={styles.textCol}>
          <h3 className={styles.panelTitle} style={{ color: mode.titleColor }}>
            {mode.title}
          </h3>
          <p className={styles.panelSubtitle} style={{ color: mode.subtitleColor }}>
            {mode.subtitle}
          </p>
          <div className={styles.accordionList}>
            {mode.items.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openItem === item.id}
                onClick={() => handleAccordion(item.id)}
                accentColor={mode.accordionColor}
                arrowColor={mode.arrowColor}
              />
            ))}
          </div>
        </div>

        {!mode.imageLeft && imageBlock}

      </div>
    </section>
  );
};

export default ModeSection;
