// Mock Data - Simula banco de dados ate o backend estar pronto
// Para integrar com backend: substitua por chamadas a API

export const mockUser = {
  id: 1,
  nome: 'Diego',
  email: 'diego@learnmaster.com',
};

export const mockMainDecks = [
  { id: 1, nome: 'Matemática', usuarioId: 1 },
];

export const mockDecks = [
  {
    id: 1,
    nome: 'Trigonometria',
    mainDeckId: 1,
    cards: [
      { id: 1, frente: 'Seno', verso: 'Razao entre cateto oposto e hipotenusa.' },
      { id: 2, frente: 'Cosseno', verso: 'Razao entre cateto adjacente e hipotenusa.' },
      { id: 3, frente: 'Tangente', verso: 'Razao entre seno e cosseno.' },
    ],
  },
  {
    id: 2,
    nome: 'Biologia',
    mainDeckId: 1,
    cards: [
      { id: 4, frente: 'Mitose', verso: 'Divisao celular que gera celulas identicas.' },
      { id: 5, frente: 'Meiose', verso: 'Divisao celular que gera gametas.' },
    ],
  },
];

export const mockProgresso = {
  ultimoDeckId: 1,
  ultimoCardId: 1,
};
