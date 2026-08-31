# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Este projeto é entregue em PRs por fase (ver `README.md`).

## [Não lançado]

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
