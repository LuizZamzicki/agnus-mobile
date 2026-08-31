import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import { Pressable, TextInput, TextInputProps } from "react-native";

import { colors } from "../theme";

import { TextField } from "./TextField";

interface PasswordFieldProps extends Omit<TextInputProps, "secureTextEntry"> {
  label: string;
  error?: string;
  hint?: string;
}

export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(function PasswordField(
  { label, error, hint, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      ref={ref}
      label={label}
      error={error}
      hint={hint}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      right={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      }
      {...props}
    />
  );
});
