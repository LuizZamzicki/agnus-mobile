// Mesma regra do back (`agnus-back/src/utils/userValidation.ts`).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(email: string): boolean {
  return EMAIL_REGEX.test(String(email ?? "").trim());
}
