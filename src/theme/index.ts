// Tema claro único (por enquanto). Sem UI kit — componentes próprios + StyleSheet.

export const colors = {
  background: "#ffffff",
  surface: "#f6f6f8",
  surfaceAlt: "#eef0f4",
  border: "#e2e4ea",
  text: "#1f1f24",
  textMuted: "#6b6f7a",
  primary: "#1f1f1f",
  primaryText: "#ffffff",
  accent: "#c8a24a",
  danger: "#c0392b",
  success: "#2e7d32",
  overlay: "rgba(0,0,0,0.4)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 22, fontWeight: "700" as const, color: colors.text },
  heading: { fontSize: 18, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: "400" as const, color: colors.textMuted },
  price: { fontSize: 17, fontWeight: "700" as const, color: colors.text },
} as const;

export const theme = { colors, spacing, radius, typography };
export type Theme = typeof theme;
