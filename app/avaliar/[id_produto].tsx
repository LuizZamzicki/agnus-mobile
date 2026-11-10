import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createReview,
  deleteReview,
  deleteReviewPhoto,
  MAX_FOTOS_AVALIACAO,
  updateReview,
  uploadReviewPhotos,
  type LocalPhoto,
} from "../../src/actions/reviews";
import { StarPicker } from "../../src/components/avaliacoes/StarPicker";
import { Button } from "../../src/components/Button";
import { ConfirmDialog } from "../../src/components/ConfirmDialog";
import { EmptyState } from "../../src/components/EmptyState";
import { FormBanner } from "../../src/components/FormBanner";
import { useToast } from "../../src/components/layout/Toast";
import { TextField } from "../../src/components/TextField";
import { useAuth } from "../../src/contexts/AuthContext";
import { useCanReview, useReviewPhotos } from "../../src/hooks/avaliacoes";
import { useProductBundle } from "../../src/hooks/produtos";
import { ApiError } from "../../src/lib/api";
import { numeroSeguro } from "../../src/lib/format";
import { normalizarUrlImagem } from "../../src/lib/produtos";
import { useTheme, useThemedStyles, type Theme } from "../../src/theme";
import type { ProductReview } from "../../src/types/product";

function mensagemDeErro(err: unknown, padrao: string): string {
  return err instanceof ApiError && err.status > 0 ? err.message : padrao;
}

function fotoLocal(asset: ImagePicker.ImagePickerAsset, indice: number): LocalPhoto {
  const tipo = asset.mimeType ?? "image/jpeg";
  const extensao = tipo.split("/")[1] ?? "jpg";
  return {
    uri: asset.uri,
    name: asset.fileName ?? `avaliacao-${Date.now()}-${indice}.${extensao}`,
    type: tipo,
  };
}

/**
 * Cria a avaliação da peça ou altera a que o cliente já fez (uma por produto).
 * Só quem recebeu a peça chega aqui pelos botões; a API confere de novo (403).
 */
export default function ReviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id_produto: idParam } = useLocalSearchParams<{ id_produto: string }>();
  const productId = Number(idParam);

  const bundle = useProductBundle(productId);
  const canReview = useCanReview(productId);
  const minhaAvaliacao = useMemo(
    () => bundle.data?.avaliacoes.find((a) => Number(a.id_usuario) === user?.id_usuario) ?? null,
    [bundle.data?.avaliacoes, user?.id_usuario],
  );

  if (!user) {
    return (
      <EmptyState
        title="Entre para avaliar"
        actionLabel="Entrar"
        onAction={() => router.replace("/login")}
      />
    );
  }

  if (bundle.isPending || (canReview.isPending && !minhaAvaliacao)) {
    return <EmptyState title="Carregando" loading />;
  }

  if (!bundle.data || (!minhaAvaliacao && canReview.data !== true)) {
    return (
      <EmptyState
        title="Só quem recebeu a peça pode avaliar"
        message="Quando o seu pedido for entregue, você poderá contar o que achou."
        actionLabel="Voltar"
        onAction={() => router.back()}
      />
    );
  }

  return (
    <ReviewForm
      key={minhaAvaliacao?.id_avaliacao_produto ?? "nova"}
      productId={productId}
      productName={bundle.data.produto.nome}
      review={minhaAvaliacao}
    />
  );
}

/** Formulário: nasce preenchido com a avaliação existente, quando há. */
function ReviewForm({
  productId,
  productName,
  review,
}: {
  productId: number;
  productName: string;
  review: ProductReview | null;
}) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const navigation = useNavigation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const reviewId = review?.id_avaliacao_produto ?? 0;
  const emEdicao = review !== null;
  const fotosSalvasQuery = useReviewPhotos(reviewId);

  const [nota, setNota] = useState(() => numeroSeguro(review?.nota, 0));
  const [nome, setNome] = useState(() => review?.titulo ?? user?.nome ?? "");
  const [comentario, setComentario] = useState(() => review?.comentario ?? "");
  const [fotosRemovidas, setFotosRemovidas] = useState<number[]>([]);
  const [fotosNovas, setFotosNovas] = useState<LocalPhoto[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: emEdicao ? "Alterar avaliação" : "Avaliar peça" });
  }, [navigation, emEdicao]);

  const fotosMantidas = (fotosSalvasQuery.data ?? []).filter(
    (foto) => !fotosRemovidas.includes(foto.id_avaliacao_foto),
  );
  const vagas = MAX_FOTOS_AVALIACAO - fotosMantidas.length - fotosNovas.length;

  const escolherFotos = async () => {
    setErro(null);
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      setErro("Permita o acesso às fotos nas configurações do aparelho para anexar imagens.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: vagas,
      quality: 0.8,
      // O iPhone guarda as fotos em HEIC, que o backend recusa (só JPEG, PNG, GIF, WEBP e
      // BMP). "Compatible" pede ao iOS a versão mais compatível: JPEG, como o Safari faz.
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (resultado.canceled) return;
    const novas = resultado.assets.slice(0, vagas).map(fotoLocal);
    setFotosNovas((atuais) => [...atuais, ...novas]);
  };

  const atualizarCaches = (id: number) => {
    queryClient.invalidateQueries({ queryKey: ["product", productId] });
    queryClient.invalidateQueries({ queryKey: ["review-photos", id] });
  };

  const enviar = async () => {
    if (!user) return;
    if (!nota) {
      setErro("Selecione uma nota.");
      return;
    }
    if (!comentario.trim()) {
      setErro("Escreva um comentário.");
      return;
    }
    setErro(null);
    setEnviando(true);

    let id = reviewId;
    try {
      const input = {
        id_produto: productId,
        id_usuario: user.id_usuario,
        nota,
        titulo: nome.trim() || user.nome || "Cliente Agnus",
        comentario: comentario.trim(),
      };
      const salva = emEdicao ? await updateReview(reviewId, input) : await createReview(input);
      id = salva.id_avaliacao_produto ?? reviewId;
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível salvar a avaliação."));
      setEnviando(false);
      return;
    }

    // O texto já foi salvo: falha nas fotos não desfaz a avaliação.
    try {
      await Promise.all(fotosRemovidas.map(deleteReviewPhoto));
      if (fotosNovas.length > 0) await uploadReviewPhotos(id, fotosNovas);
    } catch (err) {
      // Volta para o produto: ficar aqui faria uma nova tentativa criar a avaliação de novo (409).
      atualizarCaches(id);
      toast.show({
        title: "Avaliação salva, fotos não",
        message: mensagemDeErro(err, "Abra a avaliação de novo para tentar enviar as fotos."),
        tone: "error",
        duration: 6000,
      });
      router.back();
      return;
    }

    atualizarCaches(id);
    toast.show({ message: emEdicao ? "Avaliação alterada!" : "Avaliação enviada!" });
    router.back();
  };

  const excluir = async () => {
    setExcluindo(true);
    try {
      await deleteReview(reviewId);
      atualizarCaches(reviewId);
      setConfirmarExclusao(false);
      toast.show({ message: "Avaliação excluída." });
      router.back();
    } catch (err) {
      setConfirmarExclusao(false);
      setErro(mensagemDeErro(err, "Não foi possível excluir a avaliação."));
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.heading}>{productName}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nota</Text>
          <StarPicker value={nota} onChange={setNota} />
        </View>

        <TextField
          label="Nome"
          hint="Aparece junto com a avaliação."
          value={nome}
          onChangeText={setNome}
          maxLength={120}
          autoCapitalize="words"
        />

        <TextField
          label="Comentário"
          value={comentario}
          onChangeText={setComentario}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.comment}
          maxLength={1000}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Fotos (máx. {MAX_FOTOS_AVALIACAO})</Text>
          <View style={styles.photos}>
            {fotosMantidas.map((foto) => (
              <PhotoThumb
                key={foto.id_avaliacao_foto}
                uri={normalizarUrlImagem(foto.caminho_url)}
                onRemove={() => setFotosRemovidas((atuais) => [...atuais, foto.id_avaliacao_foto])}
              />
            ))}
            {fotosNovas.map((foto, indice) => (
              <PhotoThumb
                key={foto.uri}
                uri={foto.uri}
                onRemove={() => setFotosNovas((atuais) => atuais.filter((_, i) => i !== indice))}
              />
            ))}
            {vagas > 0 ? (
              <Pressable
                onPress={escolherFotos}
                style={styles.addPhoto}
                accessibilityRole="button"
                accessibilityLabel="Adicionar fotos"
              >
                <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {erro ? <FormBanner tone="error" message={erro} /> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={emEdicao ? "Salvar alteração" : "Enviar avaliação"}
          onPress={enviar}
          loading={enviando}
          disabled={excluindo}
        />
        {emEdicao ? (
          <Button
            title="Excluir avaliação"
            variant="ghost"
            onPress={() => setConfirmarExclusao(true)}
            disabled={enviando}
          />
        ) : null}
      </View>

      <ConfirmDialog
        visible={confirmarExclusao}
        title="Excluir avaliação?"
        message="A nota, o comentário e as fotos saem do produto."
        confirmLabel="Excluir"
        destructive
        loading={excluindo}
        onCancel={() => setConfirmarExclusao(false)}
        onConfirm={excluir}
      />
    </SafeAreaView>
  );
}

function PhotoThumb({ uri, onRemove }: { uri: string; onRemove: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.thumbWrap}>
      <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        style={styles.thumbRemove}
        accessibilityRole="button"
        accessibilityLabel="Remover foto"
      >
        <Ionicons name="close" size={14} color={colors.background} />
      </Pressable>
    </View>
  );
}

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    field: { gap: 6 },
    label: { ...typography.caption, color: colors.text, fontWeight: "600" },
    comment: { minHeight: 96 },
    photos: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    thumbWrap: { width: 72, height: 72 },
    thumb: {
      width: 72,
      height: 72,
      borderRadius: radius.sm,
      backgroundColor: colors.surface,
    },
    thumbRemove: {
      position: "absolute",
      top: -6,
      right: -6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    addPhoto: {
      width: 72,
      height: 72,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    footer: {
      padding: spacing.lg,
      gap: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
  });
