import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';

// As páginas públicas (landing, login...) continuam sempre claras
const AREA_LOGADA = ['/app', '/criar', '/memorizar'];

const AplicarTema = () => {
  const { darkMode } = useApp();
  const { pathname } = useLocation();
  const escuro = darkMode && AREA_LOGADA.some((p) => pathname.startsWith(p));

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', escuro ? 'true' : 'false');
  }, [escuro]);

  return null;
};

const PrivateRoute = ({ children }) => {
  const { user, verificandoSessao } = useApp();
  if (verificandoSessao) {
    return (
      <div className="app-carregando" role="status" aria-live="polite">
        <span className="app-carregando-spinner" aria-hidden="true" />
        Carregando...
      </div>
    );
  }
  return user ? children : <Navigate to="/entrar" replace />;
};
import LandingPage from '@/pages/Landing/LandingPage';
import ContatoPage from '@/pages/Contato/ContatoPage';
import LoginPage from '@/pages/Login/LoginPage';
import CadastroPage from '@/pages/Cadastro/CadastroPage';
import EsqueceuSenhaPage from '@/pages/EsqueceuSenha/EsqueceuSenhaPage';
import QuemSomosPage from '@/pages/QuemSomos/QuemSomosPage';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import HomePage from '@/pages/Dashboard/HomePage';
import CriarPage from '@/pages/Dashboard/CriarPage/CriarPage';
import CriarLearnDeckPage from '@/pages/Criar/CriarLearnDeckPage';
import CriarDeckPage from '@/pages/Criar/CriarDeckPage';
import CriarFlashcardPage from '@/pages/Criar/CriarFlashcardPage';
import VerTodosPage from '@/pages/Dashboard/VerTodosPage/VerTodosPage';
import PerfilPage from '@/pages/Dashboard/PerfilPage/PerfilPage';
import MaisPage from '@/pages/Dashboard/MaisPage/MaisPage';
import EscolherDeckPage from '@/pages/Memorizar/EscolherDeckPage';
import IntroPage from '@/pages/Memorizar/IntroPage';
import EstudarPage from '@/pages/Memorizar/EstudarPage';
import ConclusaoPage from '@/pages/Memorizar/ConclusaoPage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AplicarTema />
        <Routes>
          <Route path="/"                  element={<LandingPage />} />
          <Route path="/contato"           element={<ContatoPage />} />
          <Route path="/entrar"            element={<LoginPage />} />
          <Route path="/cadastro"          element={<CadastroPage />} />
          <Route path="/esqueceu-senha"    element={<EsqueceuSenhaPage />} />
          <Route path="/quem-somos"        element={<QuemSomosPage />} />
          <Route path="/criar/learndeck"   element={<PrivateRoute><CriarLearnDeckPage /></PrivateRoute>} />
          <Route path="/criar/deck"        element={<PrivateRoute><CriarDeckPage /></PrivateRoute>} />
          <Route path="/criar/flashcard"   element={<PrivateRoute><CriarFlashcardPage /></PrivateRoute>} />
          <Route path="/memorizar"         element={<PrivateRoute><EscolherDeckPage /></PrivateRoute>} />
          <Route path="/memorizar/:deckId" element={<PrivateRoute><IntroPage /></PrivateRoute>} />
          <Route path="/memorizar/:deckId/estudar"   element={<PrivateRoute><EstudarPage /></PrivateRoute>} />
          <Route path="/memorizar/:deckId/concluido" element={<PrivateRoute><ConclusaoPage /></PrivateRoute>} />
          <Route path="/app" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<HomePage />} />
            <Route path="criar"   element={<CriarPage />} />
            <Route path="decks"   element={<VerTodosPage />} />
            <Route path="decks/:learnDeckId" element={<VerTodosPage />} />
            <Route path="decks/:learnDeckId/:deckId" element={<VerTodosPage />} />
            <Route path="perfil"  element={<PerfilPage />} />
            <Route path="mais"    element={<MaisPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
