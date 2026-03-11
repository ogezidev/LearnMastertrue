import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import LandingPage from '@/pages/Landing/LandingPage';
import ContatoPage from '@/pages/Contato/ContatoPage';
import LoginPage from '@/pages/Login/LoginPage';
import CadastroPage from '@/pages/Cadastro/CadastroPage';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import HomePage from '@/pages/Dashboard/HomePage';
import PlaceholderPage from '@/pages/Dashboard/PlaceholderPage';
import CriarPage from '@/pages/Dashboard/CriarPage/CriarPage';
import CriarLearnDeckPage from '@/pages/Criar/CriarLearnDeckPage';
import CriarDeckPage from '@/pages/Criar/CriarDeckPage';
import CriarFlashcardPage from '@/pages/Criar/CriarFlashcardPage';
import VerTodosPage from '@/pages/Dashboard/VerTodosPage/VerTodosPage';
import IntroPage from '@/pages/Memorizar/IntroPage';
import EstudarPage from '@/pages/Memorizar/EstudarPage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/contato"  element={<ContatoPage />} />
          <Route path="/entrar"   element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/criar/learndeck" element={<CriarLearnDeckPage />} />
          <Route path="/criar/deck" element={<CriarDeckPage />} />
          <Route path="/criar/flashcard" element={<CriarFlashcardPage />} />
          <Route path="/memorizar/:deckId" element={<IntroPage />} />
          <Route path="/memorizar/:deckId/estudar" element={<EstudarPage />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="criar" element={<CriarPage />} />
            <Route path="decks" element={<VerTodosPage />} />
            <Route path="perfil" element={<PlaceholderPage title="Perfil — em breve" />} />
            <Route path="mais" element={<PlaceholderPage title="Mais — em breve" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
