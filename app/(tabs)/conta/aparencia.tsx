import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
  const { scheme, tempo, colors } = useTheme();
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

      <Text style={[styles.label, styles.section]} accessibilityRole="header">
        Cor do tempo litúrgico
      </Text>
      <View style={styles.tempo}>
        <View style={[styles.swatch, { backgroundColor: colors.lit }]} />
        <Text style={styles.tempoNome}>{tempo.nome}</Text>
      </View>
      <Text style={styles.hint}>
        No tema claro, os botões principais vestem a cor do tempo do dia, como no site: verde no
        Tempo Comum, roxo no Advento e na Quaresma, dourado no Natal e na Páscoa e vermelho em
        Pentecostes. No escuro, eles ficam na tinta clara.
      </Text>
    </Screen>
  );
}

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    label: { ...typography.heading, marginBottom: spacing.sm },
    section: { marginTop: spacing.xl },
    hint: { ...typography.caption, marginTop: spacing.md },
    tempo: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    swatch: {
      width: 28,
      height: 28,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    tempoNome: { ...typography.body, fontWeight: "600" },
  });
