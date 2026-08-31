import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { imagemPrincipal } from "../lib/produtos";
import { colors, radius, spacing, typography } from "../theme";
import type { CatalogProduct } from "../types/product";

import { Price } from "./Price";

interface ProductCardProps {
  product: CatalogProduct;
  onPress: (product: CatalogProduct) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const uri = imagemPrincipal(product);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(product)}
      accessibilityRole="button"
      accessibilityLabel={product.nome}
    >
      <View style={styles.imageWrap}>
        {uri ? (
          <Image style={styles.image} source={{ uri }} contentFit="cover" transition={150} />
        ) : (
          <Ionicons name="image-outline" size={32} color={colors.textMuted} />
        )}
      </View>
      {product.categoria_nome ? (
        <Text style={styles.category} numberOfLines={1}>
          {product.categoria_nome}
        </Text>
      ) : null}
      <Text style={styles.name} numberOfLines={2}>
        {product.nome}
      </Text>
      <Price value={product.preco_base} style={styles.price} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 2,
  },
  pressed: { opacity: 0.7 },
  imageWrap: {
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  image: { width: "100%", height: "100%" },
  category: { ...typography.caption, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  name: { ...typography.body, fontSize: 14, minHeight: 36 },
  price: { fontSize: 15, marginTop: 2 },
});
