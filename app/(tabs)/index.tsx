import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryChips } from "../../src/components/produtos/CategoryChips";
import { ErrorState } from "../../src/components/ErrorState";
import { ProductCard } from "../../src/components/produtos/ProductCard";
import { SearchBar } from "../../src/components/layout/SearchBar";
import { useCategories } from "../../src/hooks/categorias";
import { useBestSellers, useCatalog } from "../../src/hooks/produtos";
import { useTheme, useThemedStyles, type Theme } from "../../src/theme";
import type { CatalogProduct } from "../../src/types/product";

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const bestSellers = useBestSellers(8);
  const catalog = useCatalog({});
  const categories = useCategories();

  const products = catalog.data?.pages.flatMap((page) => page.data) ?? [];
  const refreshing = bestSellers.isRefetching || catalog.isRefetching;
  const onRefresh = () => {
    bestSellers.refetch();
    catalog.refetch();
    categories.refetch();
  };

  const openProduct = (product: CatalogProduct) =>
    router.push({ pathname: "/produto/[id]", params: { id: String(product.id_produto) } });
  const openCatalog = (id_categoria?: number) =>
    router.push(
      id_categoria
        ? { pathname: "/catalogo", params: { id_categoria: String(id_categoria) } }
        : "/catalogo",
    );
  const submitSearch = () => {
    const q = search.trim();
    router.push(q ? { pathname: "/catalogo", params: { q } } : "/catalogo");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} onSubmit={submitSearch} />
      </View>

      {catalog.isPending ? (
        <ActivityIndicator style={styles.railLoading} color={colors.primary} />
      ) : catalog.isError ? (
        <View style={styles.railError}>
          <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id_produto)}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => <ProductCard product={item} onPress={openProduct} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (catalog.hasNextPage && !catalog.isFetchingNextPage) catalog.fetchNextPage();
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <>
              {categories.data && categories.data.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categorias</Text>
                  </View>
                  <View style={styles.categoryChips}>
                    <CategoryChips categories={categories.data} onSelect={openCatalog} />
                  </View>
                </View>
              ) : null}

              <Rail
                title="Mais vendidos"
                query={bestSellers}
                onRetry={() => bestSellers.refetch()}
                onPressItem={openProduct}
              />

              <View style={[styles.section, styles.sectionHeader]}>
                <Text style={styles.sectionTitle}>Todos os produtos</Text>
              </View>
            </>
          }
          ListEmptyComponent={<Text style={styles.railEmpty}>Nenhum produto encontrado.</Text>}
          ListFooterComponent={
            catalog.isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} color={colors.primary} />
            ) : products.length > 0 && !catalog.hasNextPage ? (
              <Text style={styles.end}>Você chegou ao fim</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

interface RailData {
  data?: CatalogProduct[] | { data: CatalogProduct[] };
  isPending: boolean;
  isError: boolean;
  error?: unknown;
}

function Rail({
  title,
  query,
  onRetry,
  onPressItem,
  onSeeAll,
}: {
  title: string;
  query: RailData;
  onRetry: () => void;
  onPressItem: (p: CatalogProduct) => void;
  onSeeAll?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const items = Array.isArray(query.data) ? query.data : (query.data?.data ?? []);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </Pressable>
        ) : null}
      </View>

      {query.isPending ? (
        <ActivityIndicator style={styles.railLoading} color={colors.primary} />
      ) : query.isError ? (
        <View style={styles.railError}>
          <ErrorState error={query.error} onRetry={onRetry} title="Falha ao carregar" />
        </View>
      ) : items.length === 0 ? (
        <Text style={styles.railEmpty}>Nada por aqui ainda.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id_produto)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          renderItem={({ item }) => (
            <View style={styles.railItem}>
              <ProductCard product={item} onPress={onPressItem} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const makeStyles = ({ colors, typography, spacing }: Theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    searchWrap: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
    },
    content: { paddingBottom: spacing.xxl, gap: spacing.md },
    column: { gap: spacing.md, paddingHorizontal: spacing.lg },
    section: { marginTop: spacing.lg, gap: spacing.sm },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
    },
    sectionTitle: { ...typography.heading },
    seeAll: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
    categoryChips: { paddingHorizontal: spacing.lg },
    rail: { paddingHorizontal: spacing.lg, gap: spacing.md },
    railItem: { width: 150 },
    railLoading: { paddingVertical: spacing.xl },
    railError: { height: 180 },
    railEmpty: { paddingHorizontal: spacing.lg, color: colors.textMuted, fontSize: 13 },
    footer: { paddingVertical: spacing.lg },
    end: {
      textAlign: "center",
      color: colors.textMuted,
      fontSize: 13,
      paddingVertical: spacing.lg,
    },
  });
