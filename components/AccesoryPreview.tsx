import { addSkinToWishList } from "@/API/valorant-api";
import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import CurrencyIcon from "./CurrencyIcon";
import { useTheme } from "@/src/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";

type AccessoryPreviewProps = {
  selectedAccessory: any;
  imagePreview: any;
  inWishlist: boolean;
  handleWishlistPress: (accessory: any) => void;
  setSelectedAccessory: (accessory: any | null) => void;
  price?: any;
};

export const AccessoryPreview = ({
  selectedAccessory,
  imagePreview,
  inWishlist,
  handleWishlistPress,
  setSelectedAccessory,
  price,
}: AccessoryPreviewProps) => {
  const [currentImagePreview, setCurrentImagePreview] = useState(imagePreview);
  const [modalVisible, setModalVisible] = useState(false);

  const { colors, theme, accent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, accent, theme), [colors, accent, theme]);

  useEffect(() => {
    setCurrentImagePreview(imagePreview);
  }, [imagePreview]);

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        {currentImagePreview && (
          <Image
            source={{ uri: currentImagePreview }}
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

        {/* Header Block */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>
              {selectedAccessory.itemType || "Accessory Offer"}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {selectedAccessory.displayName}
            </Text>
          </View>
          {price && (
            <View style={styles.priceChip}>
              <CurrencyIcon icon="kdc" size={16} />
              <Text style={styles.priceText}>{price}</Text>
            </View>
          )}
        </View>

        {/* Dynamic Aspect Ratio Preview Window */}
        <View style={styles.previewWrap}>
          {currentImagePreview ? (
            <Image
              source={{ uri: currentImagePreview }}
              style={[
                styles.previewImage,
                {
                  aspectRatio:
                    selectedAccessory.itemType === "Player Card" ? 3 / 4 : 1,
                  height:
                    selectedAccessory.itemType === "Player Card" ? 220 : 160,
                },
              ]}
            />
          ) : (
            <View style={styles.emptyMedia}>
              <TabBarIcon name="image-outline" color={colors.subtle} size={28} />
              <Text style={styles.emptyMediaText}>Preview unavailable.</Text>
            </View>
          )}
        </View>

        {/* Actions Panel */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => setSelectedAccessory(null)}
            activeOpacity={0.8}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Accessory metadata not found.</Text>
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
    previewWrap: {
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: "rgba(0,0,0,0.18)",
      justifyContent: "center",
      alignItems: "center",
      minHeight: 240,
      padding: 12,
    },
    previewImage: {
      resizeMode: "contain",
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
      fontSize: 14,
      fontFamily: "Rubik600",
      textAlign: "center",
    },
    actions: {
      width: "100%",
      gap: 10,
    },
    primaryButton: {
      backgroundColor: colors.text,
      borderRadius: 12,
      height: 48,
      width: "100%",
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
    },
  });
}
