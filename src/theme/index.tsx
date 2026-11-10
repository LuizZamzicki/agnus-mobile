import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, type Theme as NavTheme } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState, StyleSheet, useColorScheme, type TextStyle } from "react-native";

import { tempoLiturgico, type TempoLiturgico } from "./liturgia";

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
  /** Ação principal (botões, aviso): a cor do tempo litúrgico no claro, a tinta clara no escuro. */
  primary: string;
  primaryText: string;
  /** Estado escolhido (tamanho, cor, filtro, categoria): sempre a tinta, como no site. */
  selected: string;
  selectedText: string;
  /** Cor do tempo litúrgico do dia, para detalhes (filetes, ícones de destaque). */
  lit: string;
  /** Latão: estrelas das avaliações e selos. */
  accent: string;
  danger: string;
  success: string;
  overlay: string;
};

/** Tokens do DESIGN.md ("Tempo Litúrgico"). A cor da ação vem do tempo do dia. */
function makeLightColors(tempo: TempoLiturgico): ThemeColors {
  return {
    background: "#ecebe7", // --stone
    surface: "#f7f6f3", // --paper
    surfaceAlt: "#e2e0db", // --stone-2
    border: "#cfccc5", // --line
    text: "#1d1c1a", // --ink
    textMuted: "#5e5a54", // --muted
    primary: tempo.cor,
    primaryText: "#ffffff",
    selected: "#1d1c1a",
    selectedText: "#f7f6f3",
    lit: tempo.cor,
    accent: "#8a6a1f", // --brass
    danger: "#9b2c1f",
    success: "#2f6a46",
    overlay: "rgba(0,0,0,0.4)",
  };
}

/** Pedra escura, nunca preto puro. A ação é a tinta clara; a cor do tempo fica nos detalhes. */
function makeDarkColors(tempo: TempoLiturgico): ThemeColors {
  return {
    background: "#1b1a18",
    surface: "#2a2926",
    surfaceAlt: "#23221f",
    border: "#4a4741",
    text: "#ecebe7",
    textMuted: "#a9a49b",
    primary: "#ecebe7",
    primaryText: "#1b1a18",
    selected: "#ecebe7",
    selectedText: "#1b1a18",
    lit: tempo.corEscura,
    accent: "#be8e1f",
    danger: "#e9736d",
    success: "#47a86d",
    overlay: "rgba(0,0,0,0.6)",
  };
}

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
  /** Tempo litúrgico do dia (nome e cores), o mesmo que o site mostra. */
  tempo: TempoLiturgico;
};

function makeTheme(scheme: ColorScheme, tempo: TempoLiturgico): Theme {
  const colors = scheme === "dark" ? makeDarkColors(tempo) : makeLightColors(tempo);
  return { scheme, colors, typography: makeTypography(colors), spacing, radius, tempo };
}

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

  // A cor muda com o tempo litúrgico: recalcula quando o app volta ao primeiro plano.
  const [tempo, setTempo] = useState(() => tempoLiturgico());
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      const atual = tempoLiturgico();
      setTempo((anterior) => (anterior.chave === atual.chave ? anterior : atual));
    });
    return () => sub.remove();
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: makeTheme(scheme, tempo),
      preference,
      setPreference,
    }),
    [scheme, tempo, preference, setPreference],
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
