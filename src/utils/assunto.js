// Identidade visual de cada LearnDeck (a mesma regra do app mobile):
// ícone pelo assunto do nome e cor fixa pelo id

const PALETA = [
  { cor: '#368BFF', suave: '#EAF3FF', escuro: '#2563EB' },
  { cor: '#8B5CF6', suave: '#F3EEFF', escuro: '#7C3AED' },
  { cor: '#10B981', suave: '#E8FBF3', escuro: '#059669' },
  { cor: '#F97316', suave: '#FFF3EA', escuro: '#EA580C' },
  { cor: '#EC4899', suave: '#FDEEF6', escuro: '#DB2777' },
  { cor: '#14B8A6', suave: '#E6FAF7', escuro: '#0D9488' },
];

// Palavras (sem acento, minúsculas) -> ícone de components/Icone
const ICONES = [
  [/matemat|algebra|calculo|geometr|trigonom|estatist|aritm/, 'calculadora'],
  [/program|javascript|java\b|python|codigo|react|html|css|sql|software|algorit/, 'codigo'],
  [/fisic|mecanic|cinemat|optica|eletric/, 'atomo'],
  [/quimic/, 'frasco'],
  [/biolog|ciencia|genetic|anatom|medic/, 'folha'],
  [/histori/, 'predio'],
  [/geograf|mapa|pais/, 'globo'],
  [/ingles|espanhol|frances|alemao|idioma|lingua|english/, 'idioma'],
  [/portugues|literat|redac|gramat|leitura/, 'livro'],
  [/music/, 'musica'],
  [/arte|desenho|design/, 'paleta'],
  [/filosof|sociolog/, 'lampada'],
  [/econom|financ|contab/, 'grafico'],
  [/direito|lei\b/, 'balanca'],
];

export const semAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const iconeDoAssunto = (nome) => ICONES.find(([re]) => re.test(semAcento(nome ?? '')))?.[1] ?? 'livro';

// id ausente (prévia antes de criar): usa o azul da marca
export const visualDoAssunto = (nome, id) => ({
  icone: iconeDoAssunto(nome),
  ...(id == null ? PALETA[0] : PALETA[Math.abs(id) % PALETA.length]),
});

// Parte dos cards já avaliada como Bom ou Fácil (0 a 1)
export const dominio = (cards, avaliacoes) => {
  if (!cards.length) return 0;
  return cards.filter((c) => avaliacoes[c.id] === 'bom' || avaliacoes[c.id] === 'facil').length / cards.length;
};

export const contarNiveis = (cards, avaliacoes) => {
  const c = { total: cards.length, dificil: 0, bom: 0, facil: 0, novos: 0 };
  cards.forEach((card) => {
    const n = avaliacoes[card.id];
    if (n) c[n] += 1;
    else c.novos += 1;
  });
  return c;
};
