import { addSkinToWishList } from "@/app/API/valorant-api";
import React, { useState } from "react";
import {
  TouchableHighlight,
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import CurrencyIcon from "./CurrencyIcon";

export const AccessoryPreview = ({
  selectedAccessory,
  imagePreview,
  inWishlist,
  handleWishlistPress,
  setSelectedAccessory,
  price,
}) => {
  // Add a new state to manage the current video
  const [currentImagePreview, setCurrentImagePreview] = useState(imagePreview);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View
      style={{
        backgroundColor: "rgba(0,0,0,0.75)",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.dark.background,
          zIndex: 11,
          width: "93%",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          borderRadius: 2,
          borderWidth: 1,
          borderColor: Colors.dark.cardPress,
          gap: 15,
        }}
      >
        <View
          style={{
            width: "100%",
            gap: 0,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View
            style={{ flexDirection: "column", width: price ? "75%" : "100%" }}
          >
            <Text
              style={{
                fontFamily: "Rubik500",
                color: Colors.dark.text,
                fontSize: 25,
                textAlign: "left",
                margin: 0,
                padding: 0,
              }}
            >
              {selectedAccessory.displayName}
            </Text>
            {selectedAccessory.TierName && selectedAccessory.TierColor && (
              <Text
                style={{
                  fontFamily: "Rubik400",
                  color: selectedAccessory.TierColor,
                  fontSize: 18,
                  textAlign: "left",
                  margin: 0,
                  marginTop: -8,
                  padding: 0,
                }}
              >
                {selectedAccessory.TierName}
              </Text>
            )}
          </View>
          {price && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 3,
                marginTop: 5,
              }}
            >
              <CurrencyIcon icon="vp" size={24} />
              <Text
                style={{
                  color: Colors.dark.text,
                  fontSize: 19,
                  fontFamily: "Rubik400",
                }}
              >
                {price}
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            gap: 15,
          }}
        >
          {currentImagePreview ? (
            <Image
              style={{
                width: "100%",
                aspectRatio: 4 / 3,
                borderRadius: 2,
                marginVertical: 0,
                borderWidth: 1,
                borderColor: Colors.dark.cardPress,
              }}
            />
          ) : (
            <Text
              style={{
                color: Colors.accent.color,
                fontSize: 18,
                fontFamily: "Rubik500",
                textAlign: "center",
                marginVertical: 50,
              }}
            >
              No image found for this Accessory.
            </Text>
          )}
        </View>

        <View style={{ width: "100%", gap: 20 }}>
          <TouchableHighlight
            onPress={() => {
              addSkinToWishList(selectedAccessory);
              handleWishlistPress(selectedAccessory);
            }}
            activeOpacity={0.25}
            underlayColor={Colors.accent.darkRed}
            style={
              !inWishlist
                ? Styles.addWishListButton
                : Styles.removeWishListButton
            }
          >
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <Text
                style={{
                  fontFamily: "Rubik500",
                  color: Colors.accent.red,
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                {!inWishlist ? "Add To Wishlist" : "Remove from Wishlist"}
              </Text>
              <TabBarIcon
                name={!inWishlist ? "heart-outline" : "heart"}
                color={Colors.accent.red}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size={28}
              />
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => setSelectedAccessory(null)}
            activeOpacity={0.25}
            underlayColor={Colors.accent.darkRed}
            style={{
              backgroundColor: Colors.accent.red,
              borderRadius: 2,
              padding: 6,
              width: "100%",
            }}
          >
            <Text
              style={{
                fontFamily: "Rubik500",
                color: Colors.dark.text,
                fontSize: 20,
                textAlign: "center",
              }}
            >
              Close
            </Text>
          </TouchableHighlight>
        </View>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Variant video not found.</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: Colors.dark.background,
    borderRadius: 2,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    height: 125,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "75%",
    borderWidth: 1,
    borderColor: Colors.dark.cardPress,
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 2,
    padding: 8,
    width: "100%",
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: Colors.accent.red,
  },
  textStyle: {
    color: Colors.dark.text,
    fontFamily: "Rubik500",
    textAlign: "center",
    fontSize: 18,
  },
  modalText: {
    color: Colors.dark.text,
    fontFamily: "Rubik400",
    textAlign: "center",
    fontSize: 18,
  },
});

const Styles = StyleSheet.create({
  addWishListButton: {
    borderWidth: 2,
    borderColor: Colors.accent.darkRed,
    backgroundColor: "transparent",
    borderRadius: 2,
    padding: 6,
    paddingHorizontal: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  removeWishListButton: {
    borderWidth: 2,
    borderColor: Colors.accent.red,
    backgroundColor: Colors.accent.ultraDarkRed,
    borderRadius: 2,
    padding: 6,
    paddingHorizontal: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
