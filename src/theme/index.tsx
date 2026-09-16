import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, type Theme as NavTheme } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, useColorScheme, type TextStyle } from "react-native";

/* --------------------------------- Tokens ---------------------------------- */

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

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  danger: string;
  success: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: "#ffffff",
  surface: "#f5f5f5",
  surfaceAlt: "#f0f0f0",
  border: "#e0dccf",
  text: "#1f1f1f",
  textMuted: "#6b6760",
  primary: "#d4a739",
  primaryText: "#1f1f1f",
  accent: "#c99f59",
  danger: "#c0392b",
  success: "#2e7d32",
  overlay: "rgba(0,0,0,0.4)",
};

export const darkColors: ThemeColors = {
  background: "#121214",
  surface: "#1c1c20",
  surfaceAlt: "#26262c",
  border: "#34343c",
  text: "#f1f1f4",
  textMuted: "#9b9ba6",
  primary: "#e3bd5c",
  primaryText: "#1f1f1f",
  accent: "#d3ac6a",
  danger: "#e5534b",
  success: "#4caf50",
  overlay: "rgba(0,0,0,0.6)",
};

export type Typography = {
  title: TextStyle;
  heading: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  price: TextStyle;
};

function makeTypography(colors: ThemeColors): Typography {
  return {
    title: { fontSize: 22, fontWeight: "700", color: colors.text },
    heading: { fontSize: 18, fontWeight: "600", color: colors.text },
    body: { fontSize: 15, fontWeight: "400", color: colors.text },
    caption: { fontSize: 13, fontWeight: "400", color: colors.textMuted },
    price: { fontSize: 17, fontWeight: "700", color: colors.text },
  };
}

export type ColorScheme = "light" | "dark";

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  typography: Typography;
  spacing: typeof spacing;
  radius: typeof radius;
};

const lightTheme: Theme = {
  scheme: "light",
  colors: lightColors,
  typography: makeTypography(lightColors),
  spacing,
  radius,
};

const darkTheme: Theme = {
  scheme: "dark",
  colors: darkColors,
  typography: makeTypography(darkColors),
  spacing,
  radius,
};

/* ------------------------------- Preferência ------------------------------- */

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "agnus.theme-preference";

function isPreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

interface ThemeContextValue {
  theme: Theme;
  /** Escolha do usuário: segue o sistema ou fixa claro/escuro. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && isPreference(stored)) setPreferenceState(stored);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme: ColorScheme =
    preference === "system" ? (system === "dark" ? "dark" : "light") : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: scheme === "dark" ? darkTheme : lightTheme,
      preference,
      setPreference,
    }),
    [scheme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return ctx;
}

/** Tema resolvido (claro ou escuro) para usar em JSX. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}

/** Preferência do usuário + setter, para a tela de aparência. */
export function useThemePreference(): {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
} {
  const { preference, setPreference } = useThemeContext();
  return { preference, setPreference };
}

/**
 * Cria uma folha de estilos a partir do tema atual, memoizada por tema.
 * Uso: `const styles = useThemedStyles(makeStyles)` com
 * `const makeStyles = ({ colors, spacing }: Theme) => StyleSheet.create({ ... })`.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}

/** Tema do React Navigation derivado do tema atual. */
export function useNavigationTheme(): NavTheme {
  const { colors, scheme } = useTheme();
  return useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        primary: colors.text,
        notification: colors.accent,
      },
    };
  }, [colors, scheme]);
}
