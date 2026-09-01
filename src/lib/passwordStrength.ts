/**
 * Avaliação de força de senha. Portado de
 * `agnus-front/src/utils/passwordStrength.js`.
 */

export type StrengthLabel = "muito_fraca" | "fraca" | "media" | "forte" | "muito_forte";

export interface StrengthCheck {
  id: string;
  label: string;
  passed: boolean;
}

export interface PasswordStrength {
  score: number;
  label: StrengthLabel;
  percentage: number;
  isValid: boolean;
  checks: StrengthCheck[];
  suggestions: string[];
}

const strengthLabels: StrengthLabel[] = ["muito_fraca", "fraca", "media", "forte", "muito_forte"];

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const normalizedPassword = String(password ?? "");
  const checks: StrengthCheck[] = [
    { id: "minLength", label: "Pelo menos 8 caracteres", passed: normalizedPassword.length >= 8 },
    {
      id: "lowercase",
      label: "Pelo menos uma letra minuscula",
      passed: /[a-z]/.test(normalizedPassword),
    },
    {
      id: "uppercase",
      label: "Pelo menos uma letra maiuscula",
      passed: /[A-Z]/.test(normalizedPassword),
    },
    { id: "number", label: "Pelo menos um numero", passed: /\d/.test(normalizedPassword) },
    {
      id: "symbol",
      label: "Pelo menos um simbolo",
      passed: /[^A-Za-z0-9]/.test(normalizedPassword),
    },
    { id: "longLength", label: "12 caracteres ou mais", passed: normalizedPassword.length >= 12 },
  ];

  const score = checks.reduce((total, check) => total + Number(check.passed), 0);
  const percentage = Math.round((score / checks.length) * 100);
  const label = strengthLabels[Math.max(0, Math.min(score - 1, strengthLabels.length - 1))];
  const suggestions = checks.filter((check) => !check.passed).map((check) => check.label);

  const required = ["minLength", "lowercase", "uppercase", "number", "symbol"];
  const isValid = required.every((id) => checks.find((check) => check.id === id)?.passed === true);

  return { score, label, percentage, isValid, checks, suggestions };
}
