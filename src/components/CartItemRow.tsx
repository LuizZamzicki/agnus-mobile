import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatarMoeda, numeroSeguro } from "../lib/format";
import { normalizarUrlImagem } from "../lib/produtos";
import { colors, radius, spacing, typography } from "../theme";
import type { CartItem } from "../types/cart";

import { Checkbox } from "./Checkbox";
import { QtyStepper } from "./QtyStepper";

interface CartItemRowProps {
  item: CartItem;
  selected: boolean;
  disabled?: boolean;
  onToggleSelected: () => void;
  onChangeQuantity: (quantidade: number) => void;
  onRemove: () => void;
}

export function CartItemRow({
  item,
  selected,
  disabled,
  onToggleSelected,
  onChangeQuantity,
  onRemove,
}: CartItemRowProps) {
  const uri = normalizarUrlImagem(item.foto_produto ?? item.produto?.foto ?? "");
  const nome = item.produto?.nome ?? "Produto indisponível";
  const unit = numeroSeguro(item.preco_unitario, 0);
  const subtotal = numeroSeguro(item.subtotal, unit * numeroSeguro(item.quantidade, 0));
  const variantes = [item.cor?.nome, item.grade?.nome].filter(Boolean).join(" · ");

  return (
    <View style={styles.row}>
      <Checkbox checked={selected} onToggle={onToggleSelected} label={`Selecionar ${nome}`} />

      <View style={styles.imageWrap}>
        {uri ? (
          <Image style={styles.image} source={{ uri }} contentFit="cover" transition={120} />
        ) : (
          <Ionicons name="image-outline" size={24} color={colors.textMuted} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {nome}
        </Text>
        {variantes ? <Text style={styles.variant}>{variantes}</Text> : null}
        <Text style={styles.unit}>{formatarMoeda(unit)} / un.</Text>

        <View style={styles.controls}>
          <QtyStepper
            value={numeroSeguro(item.quantidade, 1)}
            onChange={onChangeQuantity}
            disabled={disabled}
            min={1}
          />
          <Text style={styles.subtotal}>{formatarMoeda(subtotal)}</Text>
        </View>
      </View>

      <Pressable
        onPress={onRemove}
        hitSlop={8}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Remover ${nome}`}
        style={styles.remove}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    alignItems: "flex-start",
  },
  imageWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  info: { flex: 1, gap: 2 },
  name: { ...typography.body, fontWeight: "600" },
  variant: { ...typography.caption },
  unit: { ...typography.caption, color: colors.textMuted },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  subtotal: { ...typography.price, fontSize: 15 },
  remove: { padding: spacing.xs },
});
