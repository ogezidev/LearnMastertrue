# LearnMaster — Frontend

Plataforma de estudo com flashcards (TCC). Hierarquia: **LearnDeck → Deck → Flashcard**
(ex.: Matemática → Trigonometria → "O que é seno?").

- **Stack:** React 18 + Vite 5 + React Router 7, JavaScript, CSS Modules
- **Backend:** Spring Boot (repositório `tccv2`), em `http://localhost:8080`

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. O backend precisa estar rodando (veja o README do backend).
Para apontar para outro endereço de API, crie um `.env` com `VITE_API_URL=https://...`.

## Funcionalidades

| Área | O que faz |
|---|---|
| Conta | Cadastro com regras de senha visíveis, login com "Continuar logado", recuperação de senha por código de 6 dígitos enviado por e-mail (30 min, uso único), troca de nome, e-mail e senha (exigem a senha atual) |
| Sessão | Token de acesso só em memória + refresh token em cookie httpOnly; renovação automática; logout invalida a sessão no servidor |
| Criar | LearnDecks e decks com breadcrumb e "Deseja prosseguir?". Cards escritos direto no card: Enter vira, Enter no verso salva, e o card entra numa pilha com editar/excluir. Também dá para colar uma lista (`pergunta ; resposta` ou duas colunas do Excel). Limites de 50 (nomes) e 200 (frente/verso) |
| Ver todos | Navegação pela URL (`/app/decks/:learnDeck/:deck`), busca global (nomes, frente e verso, sem diferenciar acentos), filtro Difícil / Bom / Fácil / Não avaliado, editar e excluir com confirmação da quantidade afetada |
| Memorizar | Abre o último deck estudado; "Card X de Y"; revelar, voltar e avançar; avaliação Difícil/Bom/Fácil salva no banco; atalhos (espaço, 1-2-3, setas) |
| Conclusão | Relatório da revisão: tempo, distribuição por nível, o que subiu ou caiu desde a última avaliação e a lista de cards por nível. "Rever os difíceis" estuda só esses cards |
| Perfil e Mais | Avatar com a inicial do nome, contagens, modo noturno e fonte para dislexia salvos na conta |
| Tutorial | Aparece no primeiro acesso e não volta depois de concluído (salvo no banco) |

Responsivo e verificado em 1366×768, 768×1024 e 375×667 (no celular a barra lateral vira barra inferior).

## Estrutura

```
src/
├── App.jsx                 rotas, rota protegida e tema
├── context/AppContext.jsx  sessão, dados do usuário e ações (criar, avaliar, preferências...)
├── services/api.js         chamadas à API (token em memória, refresh automático)
├── utils/senha.js          regras de senha (as mesmas do backend)
├── components/             Breadcrumb, Dialogo, EstadoTela, SenhaRegras, Sidebar, TutorialOverlay...
└── pages/
    ├── Login, Cadastro, EsqueceuSenha (e-mail → código + nova senha)
    ├── Criar/              LearnDeck, Deck e Flashcards
    ├── Dashboard/          Início, Criar, Ver todos, Perfil, Mais
    └── Memorizar/          Escolher deck, Antes de começar, Estudo, Conclusão
```
