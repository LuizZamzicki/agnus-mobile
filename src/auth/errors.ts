/**
 * Lançado quando um usuário `administrador` tenta entrar no app do cliente.
 * O painel administrativo é web; o app não libera a loja para admins.
 */
export class AdminNotAllowedError extends Error {
  constructor() {
    super("Esta conta é de administrador. Use o painel web para gerenciar a loja.");
    this.name = "AdminNotAllowedError";
  }
}
