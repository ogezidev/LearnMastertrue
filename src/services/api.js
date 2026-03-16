const BASE_URL = 'http://localhost:8080';

const req = async (method, path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // DELETE returns 200 with no body
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// ── Auth ──────────────────────────────────────────
export const loginApi = (email, senha) =>
  req('POST', '/usuarios/login', { email, senha });

export const cadastrarApi = (nome, email, senha) =>
  req('POST', '/usuarios', { nome, email, senha });

export const updateUsuarioApi = (id, fields) =>
  req('PUT', `/usuarios/${id}`, fields);

// ── MainDecks ─────────────────────────────────────
export const createMainDeckApi = (nome, usuarioId) =>
  req('POST', '/maindecks', { nome, usuarioId });

export const getMainDecksApi = () => req('GET', '/maindecks');

export const updateMainDeckApi = (id, nome, usuarioId) =>
  req('PUT', `/maindecks/${id}`, { id, nome, usuarioId });

export const deleteMainDeckApi = (id) => req('DELETE', `/maindecks/${id}`);

// ── Decks ─────────────────────────────────────────
export const createDeckApi = (nome, mainDeckId, usuarioId) =>
  req('POST', '/decks', { nome, mainDeckId, usuarioId });

export const getDecksApi = () => req('GET', '/decks');

export const updateDeckApi = (id, nome, mainDeckId, usuarioId) =>
  req('PUT', `/decks/${id}`, { id, nome, mainDeckId, usuarioId });

export const deleteDeckApi = (id) => req('DELETE', `/decks/${id}`);

// ── Flashcards ────────────────────────────────────
export const createFlashcardApi = (frente, verso, deckId, usuarioId) =>
  req('POST', '/flashcards', { nome: frente, frente, verso, deckId, usuarioId });

export const getFlashcardsApi = () => req('GET', '/flashcards');

export const updateFlashcardApi = (id, frente, verso, deckId, usuarioId) =>
  req('PUT', `/flashcards/${id}`, { id, nome: frente, frente, verso, deckId, usuarioId });

export const deleteFlashcardApi = (id) => req('DELETE', `/flashcards/${id}`);
