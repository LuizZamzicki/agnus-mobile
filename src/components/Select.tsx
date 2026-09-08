import React, { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useThemedStyles, type Theme } from "../theme";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

/** Combobox simples: campo que abre um modal com a lista de opções. */
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecione",
  error,
  disabled,
}: SelectProps) {
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          error ? styles.fieldError : null,
          disabled ? styles.fieldDisabled : null,
        ]}
      >
        <Text style={[styles.value, selected ? null : styles.placeholder]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={[styles.option, active ? styles.optionActive : null]}
                  >
                    <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    wrap: { gap: 6 },
    label: { ...typography.caption, color: colors.text, fontWeight: "600" },
    field: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 48,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    fieldError: { borderColor: colors.danger },
    fieldDisabled: { opacity: 0.5 },
    value: { flex: 1, fontSize: 15, color: colors.text },
    placeholder: { color: colors.textMuted },
    chevron: { fontSize: 14, color: colors.textMuted, marginLeft: spacing.sm },
    error: { fontSize: 12, color: colors.danger },
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    sheet: {
      width: "100%",
      maxWidth: 360,
      maxHeight: "70%",
      backgroundColor: colors.background,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    sheetTitle: { ...typography.heading },
    list: { flexGrow: 0 },
    option: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.sm,
    },
    optionActive: { backgroundColor: colors.surfaceAlt },
    optionText: { fontSize: 15, color: colors.text },
    optionTextActive: { fontWeight: "700" },
  });
