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
} from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import CurrencyIcon from "./CurrencyIcon";

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

  useEffect(() => {
    setCurrentImagePreview(imagePreview);
  }, [imagePreview]);

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>
              {selectedAccessory.itemType || selectedAccessory.TierName || "Accessory"}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {selectedAccessory.displayName}
            </Text>
          </View>
          {price && (
            <View style={styles.priceChip}>
              <CurrencyIcon icon="kdc" size={18} />
              <Text style={styles.priceText}>{price}</Text>
            </View>
          )}
        </View>

        <View style={styles.previewWrap}>
          {currentImagePreview ? (
            <Image
              source={{ uri: currentImagePreview }}
              style={[
                styles.previewImage,
                {
                  aspectRatio:
                    selectedAccessory.itemType === "Player Card" ? 3 / 4 : 4 / 3,
                },
              ]}
            />
          ) : (
            <View style={styles.emptyMedia}>
              <TabBarIcon name="image-outline" color={Colors.dark.subtle} size={30} />
              <Text style={styles.emptyMediaText}>No image found for this accessory.</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              addSkinToWishList(selectedAccessory);
              handleWishlistPress(selectedAccessory);
            }}
            activeOpacity={0.74}
            style={[
              styles.secondaryButton,
              inWishlist && styles.secondaryButtonActive,
            ]}
          >
            <TabBarIcon
              name={!inWishlist ? "heart-outline" : "heart"}
              color={Colors.accent.red}
              size={22}
            />
            <Text style={styles.secondaryButtonText}>
              {!inWishlist ? "Add To Wishlist" : "Remove from Wishlist"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedAccessory(null)}
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
            <Text style={styles.modalText}>Accessory preview not found.</Text>
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

const styles = StyleSheet.create({
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
    backgroundColor: Colors.dark.background,
    zIndex: 11,
    width: "100%",
    maxHeight: "92%",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 14,
    shadowColor: Colors.shadow.color,
    shadowOpacity: Colors.shadow.mediumOpacity,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    elevation: 20,
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
    color: Colors.accent.blue,
    fontSize: 12,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Rubik800",
    color: Colors.dark.text,
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
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  priceText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Rubik700",
  },
  previewWrap: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 260,
  },
  previewImage: {
    width: "100%",
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
    color: Colors.dark.muted,
    fontSize: 16,
    fontFamily: "Rubik500",
    textAlign: "center",
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
    backgroundColor: Colors.accent.ultraDarkRed,
  },
  secondaryButtonText: {
    fontFamily: "Rubik700",
    color: Colors.accent.red,
    fontSize: 16,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: Colors.dark.text,
    borderRadius: 8,
    minHeight: 48,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: "Rubik800",
    color: Colors.dark.background,
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
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 16,
  },
  modalButton: {
    borderRadius: 8,
    minHeight: 44,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.text,
  },
  modalButtonText: {
    color: Colors.dark.background,
    fontFamily: "Rubik800",
    textAlign: "center",
    fontSize: 16,
  },
  modalText: {
    color: Colors.dark.text,
    fontFamily: "Rubik600",
    textAlign: "center",
    fontSize: 17,
  },
});
