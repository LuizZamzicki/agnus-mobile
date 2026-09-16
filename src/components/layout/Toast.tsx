import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

interface ToastOptions {
  /** Linha em destaque (opcional) — ex.: o nome do produto. */
  title?: string;
  message: string;
  /** Rótulo do botão de ação (ex.: "Ver carrinho"). */
  actionLabel?: string;
  onAction?: () => void;
  tone?: "default" | "error";
  /** ms até sumir sozinho (padrão 3600). */
  duration?: number;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [mounted, setMounted] = useState(false);
  const [anim] = useState(() => new Animated.Value(0));
  const [progress] = useState(() => new Animated.Value(1));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(anim, {
      toValue: 0,
      duration: 190,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMounted(false);
        setToast(null);
      }
    });
  }, [anim]);

  const show = useCallback(
    (options: ToastOptions) => {
      if (timer.current) clearTimeout(timer.current);
      const duration = options.duration ?? 3600;
      setToast(options);
      setMounted(true);
      anim.setValue(0);
      progress.setValue(1);
      Animated.parallel([
        Animated.spring(anim, {
          toValue: 1,
          friction: 9,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]).start();
      timer.current = setTimeout(hide, duration);
    },
    [anim, progress, hide],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const error = toast?.tone === "error";

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {mounted && toast ? (
        <View
          style={[styles.wrap, { paddingBottom: insets.bottom + 16 }]}
          pointerEvents="box-none"
          accessibilityLiveRegion="polite"
        >
          <Animated.View
            style={[
              styles.toast,
              error && styles.toastError,
              {
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              style={styles.row}
              onPress={hide}
              accessibilityRole="button"
              accessibilityLabel={[toast.title, toast.message].filter(Boolean).join(". ")}
            >
              <Ionicons
                name={error ? "alert-circle" : "checkmark-circle"}
                size={22}
                color={error ? "#ffffff" : colors.accent}
              />
              <View style={styles.texts}>
                {toast.title ? (
                  <Text style={[styles.title, error && styles.textOnError]} numberOfLines={1}>
                    {toast.title}
                  </Text>
                ) : null}
                <Text
                  style={[
                    styles.message,
                    !toast.title && styles.messageSolo,
                    error && styles.textOnError,
                  ]}
                  numberOfLines={2}
                >
                  {toast.message}
                </Text>
              </View>

              {toast.actionLabel && !error ? (
                <Pressable
                  hitSlop={8}
                  style={styles.action}
                  accessibilityRole="button"
                  onPress={() => {
                    hide();
                    toast.onAction?.();
                  }}
                >
                  <Text style={styles.actionText}>{toast.actionLabel}</Text>
                  <Ionicons name="chevron-forward" size={13} color="#1f1f24" />
                </Pressable>
              ) : null}
            </Pressable>

            <Animated.View
              style={[
                styles.progress,
                error && styles.progressError,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx;
}

const makeStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },
    toast: {
      width: "100%",
      maxWidth: 460,
      backgroundColor: colors.primary,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.28,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    toastError: { backgroundColor: colors.danger },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    texts: { flex: 1, gap: 1 },
    title: { color: colors.primaryText, fontSize: 14, fontWeight: "700" },
    message: { color: colors.primaryText, fontSize: 13, fontWeight: "400", opacity: 0.72 },
    messageSolo: { fontSize: 14, fontWeight: "600", opacity: 1 },
    textOnError: { color: "#ffffff", opacity: 1 },
    action: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: colors.accent,
      paddingVertical: 7,
      paddingLeft: 12,
      paddingRight: 8,
      borderRadius: 999,
    },
    actionText: { color: "#1f1f24", fontSize: 13, fontWeight: "800" },
    progress: { height: 3, alignSelf: "flex-start", backgroundColor: colors.accent },
    progressError: { backgroundColor: "rgba(255,255,255,0.6)" },
  });
