import React from "react";
import { StyleSheet, Text } from "react-native";

import { Screen } from "../../../src/components/layout/Screen";
import { SegmentedTabs } from "../../../src/components/SegmentedTabs";
import {
  useTheme,
  useThemePreference,
  useThemedStyles,
  type Theme,
  type ThemePreference,
} from "../../../src/theme";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

export default function AppearanceScreen() {
  const { preference, setPreference } = useThemePreference();
  const { scheme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Screen scroll>
      <Text style={styles.label} accessibilityRole="header">
        Tema
      </Text>
      <SegmentedTabs options={OPTIONS} value={preference} onChange={setPreference} />
      <Text style={styles.hint}>
        {preference === "system"
          ? `Seguindo o tema do aparelho — agora está ${scheme === "dark" ? "escuro" : "claro"}.`
          : "Tema fixo: o ajuste do sistema é ignorado."}
      </Text>
    </Screen>
  );
}

const makeStyles = ({ typography, spacing }: Theme) =>
  StyleSheet.create({
    label: { ...typography.heading, marginBottom: spacing.sm },
    hint: { ...typography.caption, marginTop: spacing.md },
  });
