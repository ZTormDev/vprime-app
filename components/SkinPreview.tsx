import { addSkinToWishList, PlayerLoadout, SavePlayerLoadout, PurchaseOffer } from "@/API/valorant-api";
import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import CurrencyIcon from "./CurrencyIcon";
import { useTheme } from "@/src/hooks/useTheme";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedEntrance, AnimatedPressable, runWhenIdle } from "@/src/components/common/Motion";
import { useShopStore } from "@/src/store/useShopStore";

type SkinPreviewProps = {
  selectedSkin: any;
  videoPreview: any;
  inWishlist: boolean;
  handleWishlistPress: (skin: any) => void;
  setSelectedSkin: (skin: any | null) => void;
  price?: any;
};

export const SkinPreview = ({
  selectedSkin,
  videoPreview,
  inWishlist,
  handleWishlistPress,
  setSelectedSkin,
  price,
}: SkinPreviewProps) => {
  const [currentVideoPreview, setCurrentVideoPreview] = useState(videoPreview);
  const [selectedChromaIndex, setSelectedChromaIndex] = useState(0);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { colors, theme, accent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, accent, theme), [colors, accent, theme]);

  const player = useVideoPlayer(currentVideoPreview, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.play();
    playerInstance.volume = 1;
  });

  const [loadout, setLoadout] = useState(PlayerLoadout);
  const [isEquipping, setIsEquipping] = useState(false);

  // Find the parent weapon of this skin
  const weapons = useShopStore((state) => state.weapons) || [];
  const parentWeapon = weapons.find((w: any) =>
    w.skins.some((s: any) => s.uuid === selectedSkin.uuid)
  );

  const activeChroma = selectedSkin.chromas?.[selectedChromaIndex];

  // Check if this chroma variant is currently equipped in PlayerLoadout
  const gunLoadout = parentWeapon
    ? loadout?.Guns?.find((g: any) => g.ID === parentWeapon.uuid)
    : null;
  const isEquipped =
    gunLoadout &&
    gunLoadout.SkinID === selectedSkin.uuid &&
    gunLoadout.ChromaID === activeChroma?.uuid;

  const ownedItems = useShopStore((state) => state.ownedItems) || [];

  // Check if the currently selected chroma variant is owned by the player
  const isChromaOwned =
    selectedChromaIndex === 0
      ? selectedSkin.levels.some((lvl: any) => ownedItems.includes(lvl.uuid))
      : ownedItems.includes(activeChroma?.uuid);

  const walletBalances = useShopStore((state) => state.walletBalances);
  const storeSkins = useShopStore((state) => state.storeSkins) || [];
  const nightMarketOffers = useShopStore((state) => state.nightMarket?.Offers) || [];

  // Find if this skin is currently in the daily store or Night Market
  const shopOffer =
    storeSkins.find((s: any) => s.uuid === selectedSkin.uuid) ||
    nightMarketOffers.find((s: any) => s.uuid === selectedSkin.uuid);

  const userBalance = shopOffer
    ? shopOffer.CurrencyID === "e59aa2b6-ca9c-498c-8862-32f2ec3db402"
      ? walletBalances.radianite
      : shopOffer.CurrencyID === "85ca91d6-43e2-b4b1-4f18-6e93c1537233"
      ? walletBalances.kingdomCredits
      : walletBalances.vp
    : 0;

  const hasEnoughBalance = shopOffer ? userBalance >= shopOffer.RawPrice : false;

  const [isBuying, setIsBuying] = useState(false);

  const handleBuyPress = () => {
    if (!shopOffer) return;

    const price = shopOffer.RawPrice;
    const currencyName =
      shopOffer.CurrencyID === "e59aa2b6-ca9c-498c-8862-32f2ec3db402"
        ? "Radianite"
        : shopOffer.CurrencyID === "85ca91d6-43e2-b4b1-4f18-6e93c1537233"
        ? "Kingdom Credits"
        : "VP";

    const userBalance =
      shopOffer.CurrencyID === "e59aa2b6-ca9c-498c-8862-32f2ec3db402"
        ? walletBalances.radianite
        : shopOffer.CurrencyID === "85ca91d6-43e2-b4b1-4f18-6e93c1537233"
        ? walletBalances.kingdomCredits
        : walletBalances.vp;

    if (userBalance < price) {
      Alert.alert(
        "Saldo insuficiente",
        `Necesitas ${price} ${currencyName} para comprar esta skin, pero solo tienes ${userBalance} ${currencyName}.`
      );
      return;
    }

    Alert.alert(
      "Confirmar Compra",
      `¿Estás seguro de que deseas comprar la skin "${selectedSkin.displayName}" por ${price} ${currencyName}? Esta acción es irreversible.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Comprar",
          style: "destructive",
          onPress: async () => {
            setIsBuying(true);
            try {
              const res = await PurchaseOffer(shopOffer.OfferID, shopOffer.CurrencyID, price);
              if (res) {
                // Update local wallet balance
                const updatedWallet = { ...walletBalances };
                if (shopOffer.CurrencyID === "e59aa2b6-ca9c-498c-8862-32f2ec3db402") {
                  updatedWallet.radianite -= price;
                } else if (shopOffer.CurrencyID === "85ca91d6-43e2-b4b1-4f18-6e93c1537233") {
                  updatedWallet.kingdomCredits -= price;
                } else {
                  updatedWallet.vp -= price;
                }
                useShopStore.setState({ walletBalances: updatedWallet });

                // Add newly purchased skin level UUIDs to ownedItems list
                const updatedOwned = [...ownedItems];
                selectedSkin.levels.forEach((lvl: any) => {
                  if (!updatedOwned.includes(lvl.uuid)) {
                    updatedOwned.push(lvl.uuid);
                  }
                });
                useShopStore.setState({ ownedItems: updatedOwned });

                Alert.alert(
                  "¡Compra Exitosa!",
                  `Has adquirido "${selectedSkin.displayName}" correctamente. Ahora puedes equiparla.`
                );
              } else {
                Alert.alert(
                  "Fallo en la compra",
                  "Hubo un problema al procesar la compra en los servidores de Riot. Verifica tu saldo de monedas o conexión a Internet."
                );
              }
            } catch (err) {
              console.error("[SkinPreview] Purchase error:", err);
              Alert.alert("Error", "Ocurrió un error inesperado al procesar la compra.");
            } finally {
              setIsBuying(false);
            }
          },
        },
      ]
    );
  };

  const handleEquipPress = async () => {
    if (!parentWeapon) {
      Alert.alert("Error", "No se pudo identificar el arma para este aspecto.");
      return;
    }
    if (!activeChroma) return;

    setIsEquipping(true);
    try {
      const updatedLoadout = JSON.parse(JSON.stringify(loadout));
      const gunIndex = updatedLoadout.Guns.findIndex((g: any) => g.ID === parentWeapon.uuid);

      if (gunIndex !== -1) {
        updatedLoadout.Guns[gunIndex].SkinID = selectedSkin.uuid;
        updatedLoadout.Guns[gunIndex].ChromaID = activeChroma.uuid;
        updatedLoadout.Guns[gunIndex].LevelID = selectedSkin.levels?.[0]?.uuid;

        const result = await SavePlayerLoadout(updatedLoadout);
        if (result) {
          setLoadout(result);
          Alert.alert("Éxito", `${activeChroma.displayName} equipado en tu inventario.`);
        } else {
          Alert.alert(
            "Error al equipar",
            "No se pudo equipar en tu cuenta de Riot. Asegúrate de poseer esta skin y variante en tu cuenta de Valorant."
          );
        }
      } else {
        Alert.alert("Error", "No se encontró el arma en tu inventario actual.");
      }
    } catch (err) {
      console.error("[SkinPreview] Equip error:", err);
      Alert.alert("Error", "Ocurrió un problema inesperado al equipar.");
    } finally {
      setIsEquipping(false);
    }
  };

  React.useEffect(() => {
    const cancelIdleTask = runWhenIdle(() => {
      setIsMediaReady(true);
    });

    return () => {
      cancelIdleTask();
      setIsMediaReady(false);
    };
  }, []);

  React.useEffect(() => {
    if (player && currentVideoPreview) {
      player.replaceAsync(currentVideoPreview);
      player.play();
    }
  }, [currentVideoPreview, player]);

  const activeChromaImage =
    activeChroma?.fullRender ||
    activeChroma?.displayIcon ||
    selectedSkin.displayIcon ||
    selectedSkin.levels?.[0]?.displayIcon;

  const previewArtwork =
    selectedSkin.displayIcon ||
    selectedSkin.levels?.[0]?.displayIcon ||
    selectedSkin.chromas?.[0]?.fullRender;

  return (
    <View style={styles.overlay}>
      <AnimatedEntrance style={styles.sheet} distance={18} duration={260}>
        {previewArtwork && (
          <Image
            source={{ uri: previewArtwork }}
            style={styles.sheetBackdropImage}
            blurRadius={6}
          />
        )}
        <LinearGradient
          colors={[
            theme === "dark" ? "rgba(9,10,12,0.85)" : "rgba(248,250,252,0.85)",
            theme === "dark" ? "rgba(9,10,12,0.92)" : "rgba(248,250,252,0.92)",
          ]}
          style={styles.sheetBackdropTint}
        />

        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>
              {selectedSkin.TierName || "Skin Preview"}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {selectedSkin.displayName}
            </Text>
          </View>
          {price && (
            <View style={styles.priceChip}>
              <CurrencyIcon icon="vp" size={16} />
              <Text style={styles.priceText}>{price}</Text>
            </View>
          )}
        </View>

        {/* Video Player Frame */}
        <View style={styles.previewWrap}>
          {currentVideoPreview && isMediaReady ? (
            <VideoView
              style={styles.video}
              player={player}
              contentFit="cover"
              nativeControls={false}
              allowsPictureInPicture={false}
            />
          ) : activeChromaImage ? (
            <Image
              source={{ uri: activeChromaImage }}
              style={styles.skinFallbackImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.emptyMedia}>
              <TabBarIcon name="videocam-off-outline" color={colors.subtle} size={28} />
              <Text style={styles.emptyMediaText}>No video review available.</Text>
            </View>
          )}
        </View>

        {/* Variants Row */}
        <View style={styles.variantBlock}>
          <Text style={styles.variantLabel}>
            {selectedSkin.chromas.length > 1 ? "CHROMA VARIANTS" : "DEFAULT COLOR ONLY"}
          </Text>
          {selectedSkin.chromas.length > 1 && (
            <View style={styles.swatchRow}>
              {selectedSkin.chromas.map((chroma: any, index: number) => {
                const selected = selectedChromaIndex === index;
                const unavailable = chroma.streamedVideo === null && index !== 0;

                return (
                  <TouchableOpacity
                    key={chroma.uuid}
                    onPress={() => {
                      setSelectedChromaIndex(index);
                      setCurrentVideoPreview(index === 0 ? (chroma.streamedVideo || videoPreview) : chroma.streamedVideo);
                      if (unavailable) {
                        setModalVisible(true);
                      }
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.swatchButton,
                      selected && styles.swatchButtonActive,
                      unavailable && styles.swatchButtonDisabled,
                    ]}
                  >
                    <Image
                      source={{ uri: chroma.swatch }}
                      style={styles.swatchImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Equip Button (Only show if owned) */}
        {isChromaOwned && (
          isEquipped ? (
            <View style={[styles.equipButton, styles.equippedButton]}>
              <TabBarIcon name="checkmark-circle" color="#22c55e" size={18} />
              <Text style={styles.equippedButtonText}>Equipped in Loadout</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleEquipPress}
              activeOpacity={0.8}
              style={styles.equipButton}
              disabled={isEquipping}
            >
              <TabBarIcon name="shirt-outline" color={colors.text} size={18} />
              <Text style={styles.equipButtonText}>
                {isEquipping ? "Equipping..." : `Equip ${activeChroma?.displayName || "Skin"}`}
              </Text>
            </TouchableOpacity>
          )
        )}

        {/* Buy Button (If not owned, available in shop, and has enough balance) */}
        {!isChromaOwned && shopOffer && hasEnoughBalance && (
          <TouchableOpacity
            onPress={handleBuyPress}
            activeOpacity={0.8}
            style={[styles.equipButton, styles.buyButton]}
            disabled={isBuying}
          >
            <TabBarIcon name="cart-outline" color="#ffffff" size={18} />
            <Text style={styles.buyButtonText}>
              {isBuying ? "Comprando..." : `Comprar Aspecto (${shopOffer.Cost} VP)`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Action Panel */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              addSkinToWishList(selectedSkin);
              handleWishlistPress(selectedSkin);
            }}
            activeOpacity={0.8}
            style={[
              styles.secondaryButton,
              inWishlist && styles.secondaryButtonActive,
            ]}
          >
            <TabBarIcon
              name={!inWishlist ? "heart-outline" : "heart"}
              color={accent.red}
              size={20}
            />
            <Text style={styles.secondaryButtonText}>
              {!inWishlist ? "Track Skin" : "Stop Tracking"}
            </Text>
          </TouchableOpacity>

          <AnimatedPressable
            onPress={() => setSelectedSkin(null)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Dismiss</Text>
          </AnimatedPressable>
        </View>
      </AnimatedEntrance>

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Chromakey review video is currently unavailable for this level.</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.modalButtonText}>Acknowledge</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

function createStyles(colors: any, accent: any, theme: string) {
  return StyleSheet.create({
    overlay: {
      backgroundColor: "rgba(0,0,0,0.65)",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "flex-end",
      zIndex: 10,
    },
    sheet: {
      overflow: "hidden",
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.92)" : "rgba(248,250,252,0.92)",
      zIndex: 11,
      width: "100%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      padding: 20,
      paddingBottom: Platform.OS === "ios" ? 40 : 24,
      gap: 16,
    },
    sheetBackdropImage: {
      position: "absolute",
      width: "120%",
      height: "120%",
      right: "-10%",
      bottom: "-10%",
      opacity: 0.18,
      resizeMode: "cover",
    },
    sheetBackdropTint: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    header: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    titleBlock: {
      flex: 1,
    },
    eyebrow: {
      fontFamily: "Rubik700",
      color: accent.gold,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    title: {
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 22,
      lineHeight: 26,
    },
    priceChip: {
      height: 32,
      paddingHorizontal: 10,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.surfaceStrong,
      borderWidth: 1,
      borderColor: colors.border,
    },
    priceText: {
      color: colors.text,
      fontSize: 14,
      fontFamily: "Rubik700",
    },
    equipButton: {
      height: 48,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.surfaceStrong,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
    equippedButton: {
      backgroundColor: "rgba(34, 197, 94, 0.15)",
      borderColor: "rgba(34, 197, 94, 0.4)",
    },
    equipButtonText: {
      color: colors.text,
      fontFamily: "Rubik600",
      fontSize: 14,
    },
    equippedButtonText: {
      color: "#22c55e",
      fontFamily: "Rubik700",
      fontSize: 14,
    },
    buyButton: {
      backgroundColor: accent.red,
      borderColor: accent.red,
      marginTop: 8,
    },
    buyButtonText: {
      color: "#ffffff",
      fontFamily: "Rubik700",
      fontSize: 14,
    },
    previewWrap: {
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "rgba(0,0,0,0.18)",
    },
    video: {
      width: "100%",
      aspectRatio: 16 / 9,
    },
    skinFallbackImage: {
      width: "100%",
      aspectRatio: 16 / 9,
    },
    emptyMedia: {
      width: "100%",
      aspectRatio: 16 / 9,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    emptyMediaText: {
      color: colors.muted,
      fontSize: 14,
      fontFamily: "Rubik600",
      textAlign: "center",
    },
    variantBlock: {
      alignItems: "center",
      gap: 8,
    },
    variantLabel: {
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 11,
      letterSpacing: 0.5,
    },
    swatchRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "center",
    },
    swatchButton: {
      width: 42,
      height: 42,
      borderRadius: 10,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.border,
      opacity: 0.6,
    },
    swatchButtonActive: {
      borderColor: accent.gold,
      opacity: 1,
    },
    swatchButtonDisabled: {
      opacity: 0.25,
    },
    swatchImage: {
      width: "100%",
      height: "100%",
    },
    actions: {
      width: "100%",
      gap: 10,
      flexDirection: "row",
    },
    secondaryButton: {
      flex: 1,
      height: 48,
      borderWidth: 1,
      borderColor: "rgba(255,77,97,0.22)",
      backgroundColor: "transparent",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 6,
    },
    secondaryButtonActive: {
      backgroundColor: accent.ultraDarkRed,
    },
    secondaryButtonText: {
      fontFamily: "Rubik700",
      color: accent.red,
      fontSize: 14,
    },
    primaryButton: {
      flex: 1,
      backgroundColor: colors.text,
      borderRadius: 12,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    primaryButtonText: {
      fontFamily: "Rubik800",
      color: colors.background,
      fontSize: 14,
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.58)",
      padding: 24,
    },
    modalView: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
    },
    modalButton: {
      borderRadius: 12,
      height: 44,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.text,
    },
    modalButtonText: {
      color: colors.background,
      fontFamily: "Rubik800",
      fontSize: 14,
    },
    modalText: {
      color: colors.text,
      fontFamily: "Rubik600",
      textAlign: "center",
      fontSize: 15,
      lineHeight: 20,
    },
  });
}
