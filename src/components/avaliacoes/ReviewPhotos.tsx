import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useReviewPhotos } from "../../hooks/avaliacoes";
import { normalizarUrlImagem } from "../../lib/produtos";
import { useThemedStyles, type Theme } from "../../theme";

/** Miniaturas das fotos de uma avaliação. Tocar abre a foto em tela cheia. */
export function ReviewPhotos({ reviewId }: { reviewId: number }) {
  const styles = useThemedStyles(makeStyles);
  const { data } = useReviewPhotos(reviewId);
  const [aberta, setAberta] = useState<string | null>(null);

  const urls = (data ?? []).map((foto) => normalizarUrlImagem(foto.caminho_url)).filter(Boolean);
  if (urls.length === 0) return null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {urls.map((uri, indice) => (
          <Pressable
            key={uri}
            onPress={() => setAberta(uri)}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Foto ${indice + 1} da avaliação`}
          >
            <Image source={{ uri }} style={styles.thumb} contentFit="cover" transition={120} />
          </Pressable>
        ))}
      </ScrollView>

      <Modal
        visible={aberta !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAberta(null)}
      >
        <Pressable
          style={styles.viewer}
          onPress={() => setAberta(null)}
          accessibilityRole="button"
          accessibilityLabel="Fechar foto"
        >
          <SafeAreaView style={styles.viewerSafe}>
            <View style={styles.viewerFrame}>
              {aberta ? (
                <Image source={{ uri: aberta }} style={styles.full} contentFit="contain" />
              ) : null}
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

const makeStyles = ({ colors, spacing, radius }: Theme) =>
  StyleSheet.create({
    row: { gap: spacing.sm, paddingVertical: spacing.xs },
    thumb: {
      width: 72,
      height: 72,
      borderRadius: radius.sm,
      backgroundColor: colors.surface,
    },
    viewer: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)" },
    viewerSafe: { flex: 1 },
    viewerFrame: { flex: 1, padding: spacing.lg },
    full: { width: "100%", height: "100%" },
  });
