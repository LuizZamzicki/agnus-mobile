# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Este projeto é entregue em PRs por fase (ver `README.md`).

## [Não lançado]

### Área do cliente

- Aba **Conta** vira uma stack própria (`AccountStack`) com menu e sub-telas.
- **Meus dados** (`PUT /users/:id`): editar nome, e-mail e CPF; `AuthContext`
  ganha `updateProfile` e atualiza o usuário em memória na hora.
- **Trocar senha** (`PATCH /users/:id/password`): senha atual + nova (com medidor
  de força) + confirmação; valida "diferente da atual" no cliente e exibe a
  mensagem do back (ex.: senha já usada).
- **Endereços** (CRUD): lista com editar/excluir (confirmação), formulário
  reaproveitando `AddressForm` para criar e editar.
- **Contatos** (CRUD): lista + formulário com tipo (`celular`/`telefone`/`email`/
  `outro`), valor e "principal".
- **Meus pedidos**: lista (`GET /orders?id_usuario=`) com status e total; detalhe
  (`GET /order-items/:id_pedido`) com endereço de entrega e itens.
- `src/api/account.ts` completo (endereços, contatos, perfil, senha);
  `src/hooks/account.ts` (`useAddresses`, `useContacts`, `useOrders`,
  `useOrderItems`).
- Componentes: `MenuRow`, `StatusBadge`; helper `formatarData`.

### Carrinho e checkout

- `src/api/cart.ts`: orquestração do carrinho no cliente (o back não tem "meu
  carrinho") — `ensureCart` (`GET /carts?id_usuario=` ou `POST /carts`),
  `getCartItems`, `addCartItem`, `updateCartItemQuantity`, `removeCartItem`.
- `CartContext` reescrito sobre React Query: query do carrinho + itens por
  `id_carrinho`, mutations de adicionar/alterar/remover que invalidam a lista,
  soma para o badge da tab, limpeza do cache ao deslogar. Adicionar item com a
  mesma cor+grade soma a quantidade (o `POST` do back não faz merge).
- `src/api/orders.ts` + `src/api/account.ts`: `createOrder`, `createOrderItem`,
  `getUserAddresses`, `createUserAddress` (e `getUserOrders`/`getOrderItems` para
  a próxima fase).
- **Carrinho**: seleção por item, `QtyStepper`, remover com `ConfirmDialog`,
  subtotal dos selecionados, "Finalizar compra". Estados de sem sessão / vazio /
  erro / carregando.
- **Checkout**: escolha de endereço (ou `AddressForm` inline quando não há nenhum),
  resumo dos itens, total com frete grátis. `POST /orders` +
  `POST /order-items` por item, sequencial e **não-transacional** — se um item
  falha, mostra o erro e mantém o carrinho. Sucesso remove os itens comprados e
  vai para a confirmação.
- **Confirmação de pedido**: número do pedido, status "aguardando pagamento"
  (não há gateway), atalhos para "Meus pedidos" e a loja.
- Tela de produto: "Adicionar ao carrinho" agora persiste via `CartContext`
  (sem sessão continua indo para o Login).
- Componentes: `QtyStepper`, `Checkbox`, `ConfirmDialog`, `CartItemRow`,
  `AddressForm`; helper `formatarCEP`/`cepValido`.

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
