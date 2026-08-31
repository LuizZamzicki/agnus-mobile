import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryChips } from "../components/CategoryChips";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { ProductCard } from "../components/ProductCard";
import { SearchBar } from "../components/SearchBar";
import { useCatalog, useCategories } from "../hooks/products";
import type { RootStackParamList, TabsParamList } from "../navigation/types";
import { colors, spacing } from "../theme";
import type { CatalogProduct } from "../types/product";

type CatalogRoute = RouteProp<TabsParamList, "Catalog">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CatalogScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<CatalogRoute>();

  const [search, setSearch] = useState(route.params?.q ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [categoryId, setCategoryId] = useState<number | undefined>(route.params?.id_categoria);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handle);
  }, [search]);

  const categoriesQuery = useCategories();
  const catalog = useCatalog({
    id_categoria: categoryId,
    q: debouncedSearch || undefined,
  });

  const products = useMemo(
    () => catalog.data?.pages.flatMap((page) => page.data) ?? [],
    [catalog.data],
  );

  const openProduct = (product: CatalogProduct) =>
    navigation.navigate("Product", { id: product.id_produto });

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.xs },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  column: { gap: spacing.md },
  footer: { paddingVertical: spacing.lg },
  end: { textAlign: "center", color: colors.textMuted, fontSize: 13, paddingVertical: spacing.lg },
});
