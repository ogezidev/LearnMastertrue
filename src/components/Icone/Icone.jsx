// Ícones de traço (24x24) usados na interface; sem biblioteca externa
const TRACOS = {
  // Assuntos
  calculadora: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" />
    </>
  ),
  codigo: <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />,
  atomo: (
    <>
      <circle cx="12" cy="12" r="1" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  frasco: <path d="M9 3h6M10 3v6L4.6 18.6A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.4-2.4L14 9V3M7 15h10" />,
  folha: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" />
    </>
  ),
  predio: <path d="M3 21h18M5 21V10M19 21V10M9.5 21V10M14.5 21V10M2 10l10-7 10 7Z" />,
  globo: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </>
  ),
  idioma: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  livro: <path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2ZM22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8Z" />,
  musica: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  paleta: (
    <>
      <path d="M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2.5a2 2 0 0 0-1.5 3.3c.4.5.5 1 .5 1.2 0 .9-1.2 1.5-2.5 1.5Z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="12" cy="7" r="1" />
      <circle cx="16.5" cy="10" r="1" />
    </>
  ),
  lampada: <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />,
  grafico: <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />,
  balanca: <path d="M12 3v18M6 21h12M3 7h18M6 7l-3 7a3 3 0 0 0 6 0ZM18 7l-3 7a3 3 0 0 0 6 0Z" />,

  // Interface
  mais: <path d="M12 5v14M5 12h14" />,
  busca: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  lapis: <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  lixeira: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />,
  voltar: <path d="M19 12H5M12 19l-7-7 7-7" />,
  seta: <path d="M5 12h14M12 5l7 7-7 7" />,
  camadas: (
    <>
      <path d="m12 2 10 5-10 5L2 7Z" />
      <path d="m2 12 10 5 10-5M2 17l10 5 10-5" />
    </>
  ),
  pasta: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
  cards: (
    <>
      <rect x="3" y="7" width="14" height="14" rx="2" />
      <path d="M7 3h12a2 2 0 0 1 2 2v12" />
    </>
  ),
  fechar: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6 9 17l-5-5" />,
  girar: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </>
  ),
};

const PREENCHIDOS = {
  play: <path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5Z" />,
};

const Icone = ({ nome, tamanho = 20, className, titulo }) => {
  const preenchido = PREENCHIDOS[nome];
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill={preenchido ? 'currentColor' : 'none'}
      stroke={preenchido ? 'none' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={titulo ? undefined : 'true'}
      role={titulo ? 'img' : undefined}
    >
      {titulo && <title>{titulo}</title>}
      {preenchido ?? TRACOS[nome] ?? TRACOS.livro}
    </svg>
  );
};

export default Icone;
