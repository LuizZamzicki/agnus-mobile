# agnus-mobile

App mobile (Expo + React Native + TypeScript) da **área do cliente** do Agnus.
Consome a API existente (`agnus-composer/agnus-back`) por HTTP. Sem nada do painel `/admin`.

> 🚧 Entregue em PRs por fase. Ver `CHANGELOG.md`.

## Stack

- Expo (managed) + React Native + TypeScript
- `expo-router` (roteamento por arquivos em `app/`)
- `@tanstack/react-query` + cliente `fetch` tipado (`src/lib/api.ts`)
- `expo-secure-store` (JWT) + `AuthContext`
- `CartContext` para o carrinho
- `react-hook-form` + `zod`
- `expo-image`
- ESLint (config Expo) + Prettier · Husky + lint-staged · commitlint (Conventional Commits)

## Pré-requisitos

- Node 20+
- App **Expo Go** no celular, ou um emulador Android / simulador iOS
- A API do Agnus rodando (ver abaixo)

## Subir a API local

```bash
cd ../agnus-composer
docker compose up -d --build
# API em http://localhost:3000 (rotas na raiz: /products, /auth/login, ...)
```

## Configurar o ambiente

```bash
cp .env.example .env
```

Ajuste `EXPO_PUBLIC_API_URL` conforme onde o app roda — a URL aponta **direto para o
backend** (o prefixo `/api` é só do nginx do web, não use aqui):

| Onde                 | URL                                  |
| -------------------- | ------------------------------------ |
| iOS simulator / web  | `http://localhost:3000`              |
| **Android emulator** | `http://10.0.2.2:3000`               |
| Device físico        | `http://<IP-da-sua-maquina>:3000`    |
| Produção             | confirmar domínio público com o time |

## Rodar

```bash
npm install
npx expo start
```

- `a` abre no Android, `i` no iOS, `w` no navegador.
- Ou escaneie o QR code com o Expo Go (device físico → use o IP da máquina na URL).

Tudo roda no **Expo Go** — nenhuma dependência exige dev build.

## Login com Google

Opcional (ligado por padrão; `EXPO_PUBLIC_GOOGLE_LOGIN=false` esconde o botão).
Fluxo **web via navegador** (`expo-auth-session` + `expo-web-browser`), então
**funciona no Expo Go** no iOS e no Android — sem client OAuth no app, sem dev
build, sem conta Apple.

Como funciona: o app abre `GET {API}/auth/google?redirect=<url-do-app>` no
navegador; o backend faz o OAuth com o Google (usando o client Web dele) e, no
callback, redireciona pra `<url-do-app>?token=…`. O app lê o `token` e hidrata a
sessão com `/auth/me`.

Requisitos no **`agnus-back`** (o app não precisa de nada além da API):

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` /
  `GOOGLE_OAUTH_SCOPES` / `GOOGLE_STATE_SECRET` configurados (já usados no login
  web).
- O `GET /auth/google` aceita `?redirect=` e só repassa esquemas do allowlist
  (`exp://`, `exp+`, `agnusapp://`, `http://localhost`, `http://127.0.0.1`) — o
  resto cai no `FRONTEND_URL` normal.
- No Google Cloud Console, o **redirect URI autorizado** do client Web continua
  sendo só o `GOOGLE_REDIRECT_URI` do backend; o Google nunca vê o `exp://`.

## Build de teste (EAS)

`eas.json` traz os perfis `development`, `preview` e `production`. Para um APK
interno de teste:

```bash
npm i -g eas-cli   # uma vez
eas login
eas build --profile preview --platform android
```

Ajuste `EXPO_PUBLIC_API_URL` no perfil (`eas.json`) antes de buildar.

## Offline

O cache do React Query é persistido no `AsyncStorage` (24h), então ao reabrir o
app sem rede as telas já visitadas mostram os últimos dados; uma faixa no topo
avisa que está offline. Ações de escrita (carrinho, checkout, conta) precisam de
conexão.

## Scripts

| Script                            | O quê                     |
| --------------------------------- | ------------------------- |
| `npm start`                       | Expo dev server           |
| `npm run android` / `ios` / `web` | abre direto na plataforma |
| `npm run lint`                    | ESLint                    |
| `npm run typecheck`               | `tsc --noEmit`            |
| `npm run format`                  | Prettier `--write`        |

## Estrutura

```text
app/
  _layout.tsx            providers + <Stack> raiz
  +not-found.tsx
  produto/[id].tsx
  login.tsx
  checkout.tsx
  pedido/[id_pedido].tsx
  (tabs)/
    _layout.tsx           <Tabs>
    index.tsx              Início
    catalogo.tsx
    carrinho.tsx
    conta/
      _layout.tsx           <Stack> da conta
      index.tsx
      perfil.tsx
      senha.tsx
      enderecos/
      contatos/
      pedidos/
      aparencia.tsx

src/
  actions/     módulos por recurso (fetch tipado via lib/api.ts)
  types/       tipos da API
  contexts/    AuthContext, CartContext, errors
  lib/         api.ts (cliente fetch), secureStorage.ts (JWT), env, format, cpf, ...
  query/       QueryClient
  hooks/       produtos/, categorias/, enderecos/, contatos/, pedidos/, localidades/
  components/  kit de UI genérico (Button, EmptyState, ...) + subpastas por feature
               (produtos/, carrinho/, conta/, layout/, auth/)
  theme/       cores, spacing, tipografia
```

## Fases

| Fase | Conteúdo                                                                           |
| ---- | ---------------------------------------------------------------------------------- |
| 0    | Setup: scaffold, ferramentas, `api/client.ts`, libs portadas, providers, navegação |
| 1    | Catálogo (sem login): Início, Catálogo, Produto                                    |
| 2    | Autenticação: Login/Cadastro, SecureStore, guarda de rota                          |
| 3    | Carrinho + Checkout                                                                |
| 4    | Conta: dados, senha, endereços, contatos, pedidos                                  |
| 5    | Polimento: estados de rede, pull-to-refresh, acessibilidade, ícone/splash          |

## Convenções

- Commits: **Conventional Commits** (validado por commitlint no `commit-msg`).
- `pre-commit` roda lint-staged (ESLint + Prettier nos arquivos staged).
- `pre-push` roda `npm run typecheck`.
- Nunca commitar `.env` nem segredos. O JWT vive só no SecureStore.
- Não alterar `agnus-back` / `agnus-front`.
