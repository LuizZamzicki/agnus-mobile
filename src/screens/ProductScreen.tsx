import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/Button";
import { ColorPicker } from "../components/ColorPicker";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Price } from "../components/Price";
import { PhotoCarousel } from "../components/PhotoCarousel";
import { Rating } from "../components/Rating";
import { SizePicker } from "../components/SizePicker";
import { useAuth } from "../auth/AuthContext";
import { useCategories, useProductBundle } from "../hooks/products";
import {
  deduplicarUrls,
  mediaAvaliacoes,
  normalizarUrlImagem,
  precoComVariacoes,
} from "../lib/produtos";
import { numeroSeguro } from "../lib/format";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme";
import type { ProductColor, ProductGrade, ProductReview } from "../types/product";

type Props = NativeStackScreenProps<RootStackParamList, "Product">;

export function ProductScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { isAuthenticated } = useAuth();
  const { data, isPending, isError, error, refetch } = useProductBundle(id);
  const categories = useCategories();

  const [color, setColor] = useState<ProductColor | undefined>();
  const [grade, setGrade] = useState<ProductGrade | undefined>();

  const photos = useMemo(
    () => deduplicarUrls((data?.fotos ?? []).map((f) => normalizarUrlImagem(f.caminho_url))),
    [data?.fotos],
  );
  const media = useMemo(() => mediaAvaliacoes(data?.avaliacoes ?? []), [data?.avaliacoes]);

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState title="Carregando produto" loading />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState error={error} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const { produto, cores, grades, avaliacoes } = data;
  const categoriaNome = categories.data?.find((c) => c.id_categoria === produto.id_categoria)?.nome;
  const needsColor = cores.length > 0 && !color;
  const needsGrade = grades.length > 0 && !grade;
  const hasVariation =
    cores.some((c) => numeroSeguro(c.acrescimo, 0) > 0) ||
    grades.some((g) => numeroSeguro(g.acrescimo, 0) > 0) ||
    cores.length > 0 ||
    grades.length > 0;
  const preco = precoComVariacoes(produto.preco_base, color, grade);

  const onAddToCart = () => {
    if (needsColor || needsGrade) return;
    if (!isAuthenticated) {
      navigation.navigate("Login", { redirect: "Product" });
      return;
    }
    Alert.alert("Quase lá", "A montagem do carrinho entra na próxima etapa do app.");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <PhotoCarousel photos={photos} />

        <View style={styles.body}>
          {categoriaNome ? <Text style={styles.category}>{categoriaNome}</Text> : null}
          <Text style={styles.name}>{produto.nome}</Text>

          {avaliacoes.length > 0 ? <Rating value={media} count={avaliacoes.length} /> : null}

          <Price value={preco} from={hasVariation && !color && !grade} style={styles.price} />

          {produto.descricao ? <Text style={styles.description}>{produto.descricao}</Text> : null}

          {cores.length > 0 ? (
            <ColorPicker colors={cores} selectedId={color?.id_produto_cor} onSelect={setColor} />
          ) : null}

          {grades.length > 0 ? (
            <SizePicker grades={grades} selectedId={grade?.id_produto_grade} onSelect={setGrade} />
          ) : null}

          <ReviewsSection reviews={avaliacoes} average={media} />
        </View>
      </ScrollView>

      <View style={styles.bar}>
        {needsColor || needsGrade ? (
          <Text style={styles.hint}>
            Selecione {needsColor ? "a cor" : ""}
            {needsColor && needsGrade ? " e " : ""}
            {needsGrade ? "o tamanho" : ""} para continuar
          </Text>
        ) : null}
        <Button
          title={isAuthenticated ? "Adicionar ao carrinho" : "Entrar para comprar"}
          onPress={onAddToCart}
          disabled={needsColor || needsGrade}
        />
      </View>
    </SafeAreaView>
  );
}

function ReviewsSection({ reviews, average }: { reviews: ProductReview[]; average: number }) {
  if (reviews.length === 0) {
    return (
      <View style={styles.reviews}>
        <Text style={typography.heading}>Avaliações</Text>
        <Text style={styles.reviewEmpty}>Este produto ainda não tem avaliações.</Text>
      </View>
    );
  }

  return (
    <View style={styles.reviews}>
      <View style={styles.reviewsHeader}>
        <Text style={typography.heading}>Avaliações</Text>
        <Rating value={average} count={reviews.length} size={14} />
      </View>
      {reviews.map((review) => (
        <View key={review.id_avaliacao_produto} style={styles.review}>
          <Rating value={numeroSeguro(review.nota, 0)} size={13} showValue={false} />
          {review.titulo ? <Text style={styles.reviewTitle}>{review.titulo}</Text> : null}
          {review.comentario ? <Text style={styles.reviewBody}>{review.comentario}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.md },
  category: { ...typography.caption, textTransform: "uppercase", letterSpacing: 0.5 },
  name: { ...typography.title },
  price: { fontSize: 22 },
  description: { ...typography.body, color: colors.textMuted, lineHeight: 21 },
  reviews: { marginTop: spacing.sm, gap: spacing.sm },
  reviewsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewEmpty: { ...typography.caption },
  review: {
    gap: 4,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  reviewTitle: { ...typography.body, fontWeight: "600" },
  reviewBody: { ...typography.body, color: colors.textMuted },
  bar: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  hint: { ...typography.caption, textAlign: "center", color: colors.danger },
});
