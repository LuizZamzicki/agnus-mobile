import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

interface AutocompleteProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Chamado quando o usuário toca numa sugestão. */
  onSelect: (item: string) => void;
  /** Recebe o texto atual e devolve as sugestões já filtradas/ordenadas/limitadas. */
  filter: (query: string) => string[];
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
}

/** Campo de texto com lista de sugestões que aparece acima do input. */
export function Autocomplete({
  label,
  value,
  onChangeText,
  onSelect,
  filter,
  disabled,
  loading,
  error,
  hint,
  placeholder,
}: AutocompleteProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
    },
    [],
  );

  const suggestions = useMemo(() => (focused ? filter(value) : []), [focused, filter, value]);
  const show =
    focused && suggestions.length > 0 && !(suggestions.length === 1 && suggestions[0] === value);

  const pick = (item: string) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(false);
    Keyboard.dismiss();
    onSelect(item);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.anchor}>
        {show ? (
          <View style={styles.dropdown}>
            {suggestions.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => pick(item)}
                style={({ pressed }) => [styles.option, pressed ? styles.optionPressed : null]}
              >
                <Text style={styles.optionText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View
          style={[
            styles.field,
            error ? styles.fieldError : null,
            disabled ? styles.fieldDisabled : null,
          ]}
        >
          <TextInput
            style={styles.input}
            value={value}
            editable={!disabled}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setFocused(false), 120);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {loading ? <ActivityIndicator size="small" color={colors.textMuted} /> : null}
        </View>
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    wrap: { gap: 6, zIndex: 10 },
    label: { ...typography.caption, color: colors.text, fontWeight: "600" },
    anchor: { position: "relative" },
    field: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 48,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    fieldError: { borderColor: colors.danger },
    fieldDisabled: { opacity: 0.5 },
    input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: spacing.sm },
    dropdown: {
      position: "absolute",
      bottom: "100%",
      left: 0,
      right: 0,
      marginBottom: 4,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: radius.md,
      overflow: "hidden",
      zIndex: 20,
      elevation: 8,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    option: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
    optionPressed: { backgroundColor: colors.surfaceAlt },
    optionText: { fontSize: 15, color: colors.text },
    error: { fontSize: 12, color: colors.danger },
    hint: { fontSize: 12, color: colors.textMuted },
  });
