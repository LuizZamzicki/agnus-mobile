import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryChips } from "../../src/components/produtos/CategoryChips";
import { EmptyState } from "../../src/components/EmptyState";
import { ErrorState } from "../../src/components/ErrorState";
import { ProductCard } from "../../src/components/produtos/ProductCard";
import { Select, type SelectOption } from "../../src/components/Select";
import { SearchBar } from "../../src/components/layout/SearchBar";
import { useCategories } from "../../src/hooks/categorias";
import { useCatalog } from "../../src/hooks/produtos";
import { useTheme, useThemedStyles, type Theme } from "../../src/theme";
import type { ProductSort } from "../../src/actions/products";
import type { CatalogProduct } from "../../src/types/product";

const SORT_OPTIONS: SelectOption[] = [
  { label: "Relevância", value: "" },
  { label: "Menor preço", value: "preco_asc" },
  { label: "Maior preço", value: "preco_desc" },
];

export default function CatalogScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{ id_categoria?: string; q?: string }>();

  const [search, setSearch] = useState(params.q ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    params.id_categoria ? Number(params.id_categoria) : undefined,
  );
  const [sort, setSort] = useState<ProductSort | "">("");

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handle);
  }, [search]);

  const categoriesQuery = useCategories();
  const catalog = useCatalog({
    id_categoria: categoryId,
    q: debouncedSearch || undefined,
    sort: sort || undefined,
  });

  const products = useMemo(
    () => catalog.data?.pages.flatMap((page) => page.data) ?? [],
    [catalog.data],
  );

  const openProduct = (product: CatalogProduct) =>
    router.push({ pathname: "/produto/[id]", params: { id: String(product.id_produto) } });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onSubmit={() => setDebouncedSearch(search.trim())}
        />
        {categoriesQuery.data && categoriesQuery.data.length > 0 ? (
          <CategoryChips
            categories={categoriesQuery.data}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
        ) : null}
        <View style={styles.sort}>
          <Select
            label="Ordenar por"
            value={sort}
            options={SORT_OPTIONS}
            onChange={(value) => setSort(value as ProductSort | "")}
          />
        </View>
      </View>

      {catalog.isPending ? (
        <EmptyState title="Carregando catálogo" loading />
      ) : catalog.isError ? (
        <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id_produto)}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ProductCard product={item} onPress={openProduct} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (catalog.hasNextPage && !catalog.isFetchingNextPage) catalog.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl refreshing={catalog.isRefetching} onRefresh={() => catalog.refetch()} />
          }
          ListEmptyComponent={
            <EmptyState
              title="Nenhum produto encontrado"
              message={
                debouncedSearch
                  ? `Nada para "${debouncedSearch}". Tente outro termo.`
                  : "Não há produtos nesta categoria."
              }
            />
          }
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

const makeStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.xs },
    sort: { width: 160, alignSelf: "flex-end" },
    list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
    column: { gap: spacing.md },
    footer: { paddingVertical: spacing.lg },
    end: {
      textAlign: "center",
      color: colors.textMuted,
      fontSize: 13,
      paddingVertical: spacing.lg,
    },
  });
