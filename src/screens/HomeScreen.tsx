import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/Button";
import { CategoryChips } from "../components/CategoryChips";
import { ErrorState } from "../components/ErrorState";
import { ProductCard } from "../components/ProductCard";
import { useBestSellers, useCatalog, useCategories } from "../hooks/products";
import type { RootStackParamList, TabsParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme";
import type { CatalogProduct } from "../types/product";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabsParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const bestSellers = useBestSellers(8);
  const highlights = useCatalog({});
  const categories = useCategories();

  const highlightItems = (highlights.data?.pages[0]?.data ?? []).slice(0, 8);
  const refreshing = bestSellers.isRefetching || highlights.isRefetching;
  const onRefresh = () => {
    bestSellers.refetch();
    highlights.refetch();
    categories.refetch();
  };

  const openProduct = (product: CatalogProduct) =>
    navigation.navigate("Product", { id: product.id_produto });
  const openCatalog = (id_categoria?: number) =>
    navigation.navigate("Catalog", id_categoria ? { id_categoria } : undefined);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>AGNUS</Text>
          <Text style={styles.heroTitle}>Vestuário e calçados com a sua cara</Text>
          <View style={styles.heroAction}>
            <Button title="Ver catálogo" onPress={() => openCatalog()} />
          </View>
        </View>

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

        <Rail
          title="Destaques do catálogo"
          query={{
            data: highlightItems,
            isPending: highlights.isPending,
            isError: highlights.isError,
            error: highlights.error,
          }}
          onRetry={() => highlights.refetch()}
          onPressItem={openProduct}
          onSeeAll={() => openCatalog()}
        />
      </ScrollView>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    gap: spacing.sm,
  },
  heroKicker: { fontSize: 13, fontWeight: "700", letterSpacing: 2, color: colors.textMuted },
  heroTitle: { ...typography.title, fontSize: 24 },
  heroAction: { marginTop: spacing.sm, alignSelf: "flex-start" },
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
});
