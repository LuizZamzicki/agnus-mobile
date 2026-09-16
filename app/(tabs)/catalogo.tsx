import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryChips } from "../../src/components/produtos/CategoryChips";
import { EmptyState } from "../../src/components/EmptyState";
import { ErrorState } from "../../src/components/ErrorState";
import { ProductCard } from "../../src/components/produtos/ProductCard";
import { SearchBar } from "../../src/components/layout/SearchBar";
import { useCategories } from "../../src/hooks/categorias";
import { useCatalog } from "../../src/hooks/produtos";
import { useTheme, useThemedStyles, type Theme } from "../../src/theme";
import type { ProductSort } from "../../src/actions/products";
import type { CatalogProduct } from "../../src/types/product";

const SORT_OPTIONS: { label: string; value: ProductSort | "" }[] = [
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
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

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
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              onSubmit={() => setDebouncedSearch(search.trim())}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ordenar"
            hitSlop={8}
            onPress={() => setSortMenuOpen(true)}
            style={[styles.filterButton, sort ? styles.filterButtonActive : null]}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={sort ? colors.background : colors.text}
            />
          </Pressable>
        </View>
        {categoriesQuery.data && categoriesQuery.data.length > 0 ? (
          <CategoryChips
            categories={categoriesQuery.data}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
        ) : null}
      </View>

      <Modal
        visible={sortMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSortMenuOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Ordenar por</Text>
            {SORT_OPTIONS.map((option) => {
              const active = option.value === sort;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setSort(option.value);
                    setSortMenuOpen(false);
                  }}
                  style={[styles.option, active ? styles.optionActive : null]}
                >
                  <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                    {option.label}
                  </Text>
                  {active ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

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

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.xs },
    searchRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    searchField: { flex: 1 },
    filterButton: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
    column: { gap: spacing.md },
    footer: { paddingVertical: spacing.lg },
    end: {
      textAlign: "center",
      color: colors.textMuted,
      fontSize: 13,
      paddingVertical: spacing.lg,
    },
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    sheet: {
      width: "100%",
      maxWidth: 320,
      backgroundColor: colors.background,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.xs,
    },
    sheetTitle: { ...typography.heading, marginBottom: spacing.xs },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.sm,
    },
    optionActive: { backgroundColor: colors.surfaceAlt },
    optionText: { fontSize: 15, color: colors.text },
    optionTextActive: { fontWeight: "700" },
  });
