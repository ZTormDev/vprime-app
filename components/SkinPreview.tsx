import { addSkinToWishList } from "@/API/valorant-api";
import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import CurrencyIcon from "./CurrencyIcon";
import { useTheme } from "@/src/hooks/useTheme";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { AppBlurView } from "@/src/components/common/AppBlurView";

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
  const [modalVisible, setModalVisible] = useState(false);

  const { colors, theme, accent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, accent, theme), [colors, accent, theme]);

  const player = useVideoPlayer(currentVideoPreview, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.play();
    playerInstance.volume = 1;
  });

  React.useEffect(() => {
    if (player && currentVideoPreview) {
      player.replaceAsync(currentVideoPreview);
      player.play();
    }
  }, [currentVideoPreview, player]);

  const previewArtwork =
    selectedSkin.displayIcon ||
    selectedSkin.levels?.[0]?.displayIcon ||
    selectedSkin.chromas?.[0]?.fullRender;

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <AppBlurView
          tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
          intensity={78}
          style={styles.blurLayer}
        />
        {previewArtwork && (
          <Image
            source={{ uri: previewArtwork }}
            blurRadius={24}
            style={styles.sheetBackdropImage}
          />
        )}
        <LinearGradient
          colors={[
            theme === "dark" ? "rgba(16,17,20,0.84)" : "rgba(248,250,252,0.84)",
            theme === "dark" ? "rgba(16,17,20,0.72)" : "rgba(248,250,252,0.72)",
            theme === "dark" ? "rgba(16,17,20,0.94)" : "rgba(248,250,252,0.94)",
          ]}
          style={styles.sheetBackdropTint}
        />
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
              <CurrencyIcon icon="vp" size={18} />
              <Text style={styles.priceText}>{price}</Text>
            </View>
          )}
        </View>

        <View style={styles.previewWrap}>
          {currentVideoPreview ? (
            <VideoView
              style={styles.video}
              player={player}
              contentFit="cover"
              nativeControls={false}
              allowsPictureInPicture={false}
            />
          ) : (
            <View style={styles.emptyMedia}>
              <TabBarIcon name="videocam-off-outline" color={colors.subtle} size={30} />
              <Text style={styles.emptyMediaText}>No video found for this skin.</Text>
            </View>
          )}
        </View>

        <View style={styles.variantBlock}>
          <Text style={styles.variantLabel}>
            {selectedSkin.chromas.length > 1 ? "Variants" : "No variants found"}
          </Text>
          {selectedSkin.chromas.length > 1 && (
            <View style={styles.swatchRow}>
              {selectedSkin.chromas.map((chroma: any, index: number) => {
                const selected =
                  currentVideoPreview === (chroma.streamedVideo || videoPreview);
                const unavailable = chroma.streamedVideo === null && index !== 0;

                return (
                  <TouchableOpacity
                    key={chroma.uuid}
                    onPress={() => {
                      setCurrentVideoPreview(chroma.streamedVideo || videoPreview);
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

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              addSkinToWishList(selectedSkin);
              handleWishlistPress(selectedSkin);
            }}
            activeOpacity={0.74}
            style={[
              styles.secondaryButton,
              inWishlist && styles.secondaryButtonActive,
            ]}
          >
            <TabBarIcon
              name={!inWishlist ? "heart-outline" : "heart"}
              color={accent.red}
              size={22}
            />
            <Text style={styles.secondaryButtonText}>
              {!inWishlist ? "Add To Wishlist" : "Remove from Wishlist"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedSkin(null)}
            activeOpacity={0.74}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Variant video not found.</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
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
      backgroundColor: "rgba(0,0,0,0.68)",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      padding: 16,
    },
    sheet: {
      overflow: "hidden",
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.88)" : "rgba(248,250,252,0.88)",
      zIndex: 11,
      width: "100%",
      maxHeight: "92%",
      justifyContent: "center",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      gap: 14,
      shadowColor: "#000000",
      shadowOpacity: 0.2,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 16 },
      elevation: 20,
    },
    sheetBackdropImage: {
      position: "absolute",
      width: "130%",
      height: "130%",
      left: "-15%",
      top: "-15%",
      resizeMode: "contain",
      opacity: 0.28,
    },
    sheetBackdropTint: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    blurLayer: {
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
      color: accent.green,
      fontSize: 12,
      textTransform: "uppercase",
    },
    title: {
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 25,
      lineHeight: 29,
    },
    priceChip: {
      minHeight: 32,
      paddingHorizontal: 10,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    priceText: {
      color: colors.text,
      fontSize: 15,
      fontFamily: "Rubik700",
    },
    previewWrap: {
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: "rgba(0,0,0,0.24)",
    },
    video: {
      width: "100%",
      aspectRatio: 4 / 3,
    },
    emptyMedia: {
      width: "100%",
      aspectRatio: 4 / 3,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    emptyMediaText: {
      color: colors.muted,
      fontSize: 16,
      fontFamily: "Rubik500",
      textAlign: "center",
    },
    variantBlock: {
      alignItems: "center",
      gap: 10,
    },
    variantLabel: {
      color: colors.muted,
      fontFamily: "Rubik600",
      fontSize: 14,
    },
    swatchRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "center",
    },
    swatchButton: {
      width: 48,
      height: 48,
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.border,
      opacity: 0.62,
    },
    swatchButtonActive: {
      borderColor: accent.blue,
      opacity: 1,
    },
    swatchButtonDisabled: {
      opacity: 0.28,
    },
    swatchImage: {
      width: "100%",
      height: "100%",
    },
    actions: {
      width: "100%",
      gap: 10,
    },
    secondaryButton: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: "rgba(255,77,97,0.32)",
      backgroundColor: "transparent",
      borderRadius: 8,
      paddingHorizontal: 14,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    secondaryButtonActive: {
      backgroundColor: accent.ultraDarkRed,
    },
    secondaryButtonText: {
      fontFamily: "Rubik700",
      color: accent.red,
      fontSize: 16,
      textAlign: "center",
    },
    primaryButton: {
      backgroundColor: colors.text,
      borderRadius: 8,
      minHeight: 48,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    primaryButtonText: {
      fontFamily: "Rubik800",
      color: colors.background,
      fontSize: 16,
      textAlign: "center",
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
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
    },
    modalButton: {
      borderRadius: 8,
      minHeight: 44,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.text,
    },
    modalButtonText: {
      color: colors.background,
      fontFamily: "Rubik800",
      textAlign: "center",
      fontSize: 16,
    },
    modalText: {
      color: colors.text,
      fontFamily: "Rubik600",
      textAlign: "center",
      fontSize: 17,
    },
  });
}
