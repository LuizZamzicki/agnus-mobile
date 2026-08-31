# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Este projeto é entregue em PRs por fase (ver `README.md`).

## [Não lançado]

### Autenticação

- Tela de Login/Cadastro em abas (`SegmentedTabs`), com `react-hook-form` + `zod`.
- **Login**: e-mail + senha, mostrar/ocultar senha, banner de erro (mensagem do back
  aparece como está — inclui aviso de reuso de senha antiga).
- **Cadastro**: nome, e-mail, CPF (formatado e validado com dígito verificador — mesma
  regra do back), senha com medidor de força e checklist (`evaluatePasswordStrength`),
  confirmação de senha. Sucesso volta para a aba de login com o e-mail preenchido.
- `AuthContext.signIn` recusa contas `administrador` (`AdminNotAllowedError`): limpa o
  token, não abre sessão e a tela mostra "use o painel web". O boot (`/auth/me`)
  também desloga se a conta for admin.
- `AccountScreen` sem sessão passa a oferecer "Entrar ou cadastrar".
- Componentes reutilizáveis: `TextField`, `PasswordField`, `PasswordStrengthMeter`,
  `SegmentedTabs`, `FormBanner`.

### Catálogo (sem login)

- `src/api/products.ts`: `getCatalog` (paginado), `getBestSellers`, `getProduct`,
  `getProductColors/Grades/Photos/Reviews`, `getProductBundle` (`Promise.all` das 5
  chamadas, já que `GET /products/:id` não traz relações) e `getCategories`.
- Tipos da API em `src/types/product.ts` (campos DECIMAL tipados como `string | number`;
  `codigo_rgb` no formato `rgb(r,g,b)`).
- `src/lib/produtos.ts` portado do web: `parseJsonSeguro`, `normalizarUrlImagem`,
  `imagemPrincipal`, `corDeFundo`, `precoComVariacoes`, `mediaAvaliacoes`.
- Hooks React Query (`src/hooks/products.ts`): `useCatalog` (infinite query),
  `useBestSellers`, `useCategories`, `useProductBundle`.
- **Início**: hero, atalhos de categoria, trilhos horizontais de "Mais vendidos" e
  "Destaques do catálogo", pull-to-refresh.
- **Catálogo**: busca com debounce (`q=`), filtro por categoria, grade de 2 colunas
  com scroll infinito, pull-to-refresh, estados de loading/erro/vazio/fim-da-lista.
- **Produto**: carrossel de fotos com indicadores, preço com acréscimo de cor/grade
  ("a partir de" sem seleção), descrição, `ColorPicker` e `SizePicker` (obrigatórios),
  média e lista de avaliações, barra fixa "Adicionar ao carrinho" (sem login → manda
  para o Login; carrinho em si entra na próxima fase).
- Componentes: `ProductCard`, `Price`, `Rating`, `PhotoCarousel`, `ColorPicker`,
  `SizePicker`, `CategoryChips`, `SearchBar`, `ErrorState`.

### Fase 0 — Setup

- Scaffold Expo (managed) + React Native + TypeScript (`expo-template-blank-typescript`).
- `app.config.ts` expõe `extra.apiUrl` a partir de `EXPO_PUBLIC_API_URL`; `.env.example`.
- Ferramentas espelhando o `agnus-composer`: ESLint (config Expo) + Prettier, Husky
  (`pre-commit` = lint-staged, `commit-msg` = commitlint, `pre-push` = typecheck),
  lint-staged, commitlint (Conventional Commits).
- `src/api/client.ts`: `request<T>` com resolução de URL, `Authorization: Bearer`
  a partir do SecureStore, parse seguro de corpo vazio e `ApiError { status, message }`.
- Libs portadas de `agnus-front/src/utils/`: `assetUrl`, `formatarMoeda`, `cpf`,
  `passwordStrength`.
- Providers: React Query, `AuthContext` (JWT no SecureStore + reidratação via
  `/auth/me` no boot), `CartContext` (esqueleto).
- Navegação: `RootNavigator` (native-stack: Tabs + Product + Login modal + NotFound)
  e `Tabs` (Início · Catálogo · Carrinho · Conta) com badge de quantidade;
  `linking` com prefixo `agnusapp://`. Telas placeholder substituídas por fase.
- Componentes base: `Screen`, `Button`, `EmptyState`; tema claro (`src/theme`).
- `.github/` com template de PR e workflow de CI (lint + typecheck).
- `.gitattributes` normaliza fim de linha para LF.
- Deps: `expo-secure-store`, `expo-constants`, `expo-image`, `expo-font`,
  `@expo/vector-icons`, `react-navigation` (native-stack + bottom-tabs) e libs
  nativas (`react-native-screens`, `-safe-area-context`, `-gesture-handler`),
  `@tanstack/react-query`, `react-hook-form` + `zod` + `@hookform/resolvers`.
