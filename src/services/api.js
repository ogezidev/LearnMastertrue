const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// Token de acesso: fica só em memória (nunca no localStorage). O refresh token
// está num cookie httpOnly que o JavaScript não consegue ler.
let accessToken = null;
let refreshEmAndamento = null;
let aoExpirarSessao = null;

export const limparSessaoLocal = () => { accessToken = null; };

// O AppContext registra aqui o que fazer quando a sessão não pode ser renovada
export const definirAoExpirarSessao = (fn) => { aoExpirarSessao = fn; };

export class ApiError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const MENSAGENS_PADRAO = {
  401: 'Sua sessão expirou. Entre novamente.',
  404: 'Item não encontrado.',
  429: 'Muitas tentativas. Tente novamente em alguns minutos.',
};

const enviar = (method, path, body) =>
  fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

const ler = async (res) => {
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.mensagem ?? MENSAGENS_PADRAO[res.status] ?? 'Não foi possível completar a ação. Tente novamente.',
    );
  }
  return data;
};

// Chamadas simultâneas (ex.: StrictMode montando duas vezes) compartilham o mesmo refresh,
// porque cada refresh invalida o cookie anterior.
export const renovarSessao = () => {
  if (!refreshEmAndamento) {
    refreshEmAndamento = enviar('POST', '/auth/refresh')
      .then(ler)
      .then((data) => {
        accessToken = data.accessToken;
        return data;
      })
      .catch((err) => {
        accessToken = null;
        throw err;
      })
      .finally(() => { refreshEmAndamento = null; });
  }
  return refreshEmAndamento;
};

// Requisição autenticada: se o token de acesso expirou (401), renova uma vez e repete
const req = async (method, path, body) => {
  let res;
  try {
    res = await enviar(method, path, body);
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  }
  if (res.status === 401) {
    try {
      await renovarSessao();
    } catch {
      aoExpirarSessao?.();
      throw new ApiError(401, MENSAGENS_PADRAO[401]);
    }
    res = await enviar(method, path, body);
  }
  return ler(res);
};

// Requisição pública (/auth): sem renovação automática
const reqPublica = async (method, path, body) => {
  let res;
  try {
    res = await enviar(method, path, body);
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  }
  return ler(res);
};

const guardarToken = (data) => {
  accessToken = data.accessToken;
  return data;
};

// ── Auth ──────────────────────────────────────────
export const loginApi = (email, senha, lembrar) =>
  reqPublica('POST', '/auth/login', { email, senha, lembrar }).then(guardarToken);

export const cadastrarApi = (nome, email, senha) =>
  reqPublica('POST', '/auth/cadastro', { nome, email, senha }).then(guardarToken);

export const logoutApi = () =>
  reqPublica('POST', '/auth/logout').finally(limparSessaoLocal);

export const recuperarSenhaApi = (email) =>
  reqPublica('POST', '/auth/recuperar', { email });

export const redefinirSenhaApi = (token, novaSenha) =>
  reqPublica('POST', '/auth/redefinir', { token, novaSenha });

// ── Conta ─────────────────────────────────────────
export const atualizarNomeApi = (nome) => req('PATCH', '/usuarios/me', { nome });

export const alterarEmailApi = (email, senhaAtual) =>
  req('PUT', '/usuarios/me/email', { email, senhaAtual });

// Troca a senha e recebe uma sessão nova (as outras sessões são encerradas)
export const alterarSenhaApi = (senhaAtual, novaSenha) =>
  req('PUT', '/usuarios/me/senha', { senhaAtual, novaSenha }).then(guardarToken);

// ── MainDecks ─────────────────────────────────────
// O dono vem do token no servidor; não é mais enviado no corpo
export const createMainDeckApi = (nome) => req('POST', '/maindecks', { nome });

export const getMainDecksApi = () => req('GET', '/maindecks');

export const updateMainDeckApi = (id, nome) => req('PUT', `/maindecks/${id}`, { nome });

export const deleteMainDeckApi = (id) => req('DELETE', `/maindecks/${id}`);

// ── Decks ─────────────────────────────────────────
export const createDeckApi = (nome, mainDeckId) => req('POST', '/decks', { nome, mainDeckId });

export const getDecksApi = () => req('GET', '/decks');

export const updateDeckApi = (id, nome, mainDeckId) => req('PUT', `/decks/${id}`, { nome, mainDeckId });

export const deleteDeckApi = (id) => req('DELETE', `/decks/${id}`);

// ── Flashcards ────────────────────────────────────
export const createFlashcardApi = (frente, verso, deckId) =>
  req('POST', '/flashcards', { frente, verso, deckId });

export const getFlashcardsApi = () => req('GET', '/flashcards');

export const updateFlashcardApi = (id, frente, verso, deckId) =>
  req('PUT', `/flashcards/${id}`, { frente, verso, deckId });

export const deleteFlashcardApi = (id) => req('DELETE', `/flashcards/${id}`);
