# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Este projeto é entregue em PRs por fase (ver `README.md`).

## [Não lançado]

### Login com Google

- Botão **"Continuar com Google"** na tela de login
  (`@react-native-google-signin/google-signin`): pega um `id_token` nativo do
  Google e o backend (`POST /auth/google/token`, novo no `agnus-back`) troca por
  sessão JWT, criando ou vinculando o usuário pelo e-mail. `AuthContext` ganha
  `signInWithGoogle()` e `googleEnabled`; `signOut()` também desloga do Google.
  Contas `administrador` continuam barradas (`AdminNotAllowedError`).
- Client IDs vêm de `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` /
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` (via
  `app.config.ts` → `extra`). O `WEB_CLIENT_ID` é o mesmo `GOOGLE_CLIENT_ID` do
  back. Sem o `WEB_CLIENT_ID` o botão não aparece; no **iOS** ele também só
  aparece se houver `IOS_CLIENT_ID` (login nativo do Google no iOS exige client
  próprio), então dá pra habilitar só no Android.
- **Passa a exigir dev build** quando habilitado (módulo nativo) — sem as
  variáveis o app continua 100% Expo Go. Setup do Google Cloud no `README.md`.

### Checkout

- Corrige "Não foi possível concluir o pedido: Item do carrinho nao encontrado":
  a limpeza do carrinho depois de criar o pedido virou **best-effort** — se um
  item do carrinho já não existe no back, o pedido não é mais reprovado (evita
  também pedido duplicado num retry). `removeCartItem` trata `404` como sucesso.
- Checkout revalida o carrinho ao abrir (`refetch`), pra não finalizar sobre
  itens defasados do cache offline. `useCart().refetch` agora tem identidade
  estável.

### Produto

- A tela de produto abre com a **primeira cor e o primeiro tamanho já
  selecionados** (só marca o que ainda não foi escolhido, então pull-to-refresh
  não desfaz a seleção do usuário).
- **Carrossel "Você também pode gostar"** no fim da tela: produtos da mesma
  categoria (ou mais vendidos, quando o produto não tem categoria), sem o produto
  atual, no máximo 10. Hook `useRelatedProducts`; tocar num card empilha uma nova
  tela de produto (`navigation.push`).
- Adicionar ao carrinho não usa mais `Alert.alert`: agora um **toast** animado
  (entra com mola, ícone, nome do produto em destaque, chip de ação "Ver carrinho"
  e barra de progresso que esvazia até sumir). Toca pra fechar. Componente
  reutilizável `ToastProvider` / `useToast()` (`src/components/Toast.tsx`),
  temático, com variante de erro.

### Tema claro/escuro

- **Modo claro/escuro dinâmico**: por padrão segue o tema do sistema
  (`userInterfaceStyle: "automatic"` + `useColorScheme`), com opção de fixar em
  **Sistema / Claro / Escuro** na Conta → **Aparência** (`AppearanceScreen`). A
  preferência é salva no `AsyncStorage` (`agnus.theme-preference`).
- Infra em `src/theme`: `ThemeProvider`, `useTheme()` (tema resolvido para JSX),
  `useThemePreference()` e `useThemedStyles(makeStyles)` para folhas de estilo que
  reagem ao tema; `useNavigationTheme()` para o React Navigation. Paletas
  `lightColors` / `darkColors` e `typography` derivada das cores.
- Todos os componentes/telas migrados de `import { colors }` estático para
  `const styles = useThemedStyles(makeStyles)` + `makeStyles = ({ colors }: Theme) => StyleSheet.create(...)`.

### Endereços — formulário

- **Primeiro endereço entra como principal**: quando o usuário ainda não tem
  endereços, o toggle "principal" já vem ligado e travado.
- **UF vira combobox** (`Select`): lista dos 27 estados num modal, sem digitação
  livre.
- **Cidade com autocomplete** (`Autocomplete` + IBGE): ao digitar aparece uma
  lista de até 5 municípios válidos da UF selecionada (acima do campo); tocar
  seleciona e completa; digitar o nome completo correto seleciona sozinho; cidade
  fora da lista é recusada no envio. Municípios vêm da API pública do IBGE
  (`localidades/estados/{UF}/municipios`), cacheados pelo React Query. Sem lista
  carregada (offline), o campo aceita o texto como está.

### Infra

- **Expo SDK 54 → 57** (`react-native` 0.81 → 0.86, `react` 19.1 → 19.2,
  `typescript` `~5.9` → `~6.0`, `eslint-config-expo` `~10` → `~57`, `netinfo` 11 →
  12). O Expo Go da App Store só instala a SDK mais recente e o projeto tinha sido
  fixado na 54 pra rodar no Expo Go da época — quando o Expo Go do aparelho
  atualizou pra 57, a 54 deixou de abrir. `expo install --fix` alinhou as libs
  gerenciadas; `expo-doctor` sem apontamentos. `app.config.ts` ganhou os plugins
  `expo-image` e `expo-status-bar` (agora obrigatórios). Ajustes de código pela
  regra `react-hooks` mais rígida do `eslint-config-expo` 57: `Animated.Value` do
  toast via `useState` em vez de `useRef().current`; a pré-seleção de cor/tamanho
  na tela de produto passou a ser derivada no render em vez de `setState` num
  efeito.
- Antes disso o projeto tinha sido **fixado na SDK 54** (gerado pelo
  `create-expo-app` na 57) pra rodar no Expo Go.

### Polimento

- **Offline básico**: cache do React Query persistido no `AsyncStorage` (24h) via
  `PersistQueryClientProvider`; `gcTime` de 24h e `refetchOnReconnect`. Telas já
  visitadas abrem com os últimos dados sem rede.
- `OfflineBanner`: faixa no topo quando o aparelho perde conexão (`NetInfo`).
- `ErrorBoundary` em volta da navegação — erro de render não deixa tela branca.
- Splash controlado (`expo-splash-screen`): fica na tela até o `/auth/me` do boot
  resolver, sem flash.
- Pull-to-refresh também na tela de Produto e no detalhe de pedido.
- Acessibilidade: `accessibilityRole="header"` nos títulos de tela e nos estados
  de vazio/erro (os componentes interativos já tinham role/label/state).
- `eas.json` com perfis `development` / `preview` / `production` e README com o
  passo a passo do `eas build`.

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
