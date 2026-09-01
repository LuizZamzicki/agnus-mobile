import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../theme";

/** Faixa fixa no topo quando o aparelho está sem conexão. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setOffline(state.isConnected === false);
    });
  }, []);

  if (!offline) return null;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <Text style={styles.text}>
        <Ionicons name="cloud-offline-outline" size={13} /> Sem conexão — mostrando dados salvos
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.text },
  text: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: spacing.xs,
  },
});
