import { addSkinToWishList } from "@/app/API/valorant-api";
import { Video, ResizeMode } from "expo-av";
import React, { useState } from "react";
import {
  TouchableHighlight,
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import CurrencyIcon from "./CurrencyIcon";

export const SkinPreview = ({
  selectedSkin,
  videoPreview,
  inWishlist,
  handleWishlistPress,
  setSelectedSkin,
  price,
}) => {
  // Add a new state to manage the current video
  const [currentVideoPreview, setCurrentVideoPreview] = useState(videoPreview);

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
          gap: 25,
        }}
      >
        <View style={{ width: "100%", gap: 3, flexDirection: "column" }}>
          <Text
            style={{
              fontFamily: "Rubik500",
              color: "white",
              fontSize: 28,
              textAlign: "center",
            }}
          >
            {selectedSkin.displayName}
          </Text>
          {price && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CurrencyIcon icon="vp" size={30} />
              <Text
                style={{
                  color: Colors.dark.text,
                  fontSize: 25,
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
          {currentVideoPreview ? (
            <Video
              style={{
                width: "100%",
                aspectRatio: 4 / 3,
                borderRadius: 2,
                marginVertical: 0,
                borderWidth: 1,
                borderColor: Colors.dark.cardPress,
              }}
              source={{
                uri: currentVideoPreview,
              }}
              useNativeControls={false}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay
              isMuted={false}
              volume={1}
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
              No video found for this Skin.
            </Text>
          )}
          {selectedSkin.chromas.length > 1 ? (
            <>
              <Text
                style={{
                  color: Colors.dark.text,
                  fontFamily: "Rubik400",
                  fontSize: 16,
                  marginBlock: -5,
                }}
              >
                Variants:
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  width: "85%",
                  gap: 10,
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                {selectedSkin.chromas.map((chroma, index) => (
                  <TouchableHighlight
                    key={chroma.uuid}
                    onPress={() => {
                      // Update the current video preview when a chroma is selected
                      setCurrentVideoPreview(
                        chroma.streamedVideo || videoPreview
                      );
                    }}
                    activeOpacity={0.25}
                    underlayColor={Colors.accent.darkColor}
                  >
                    <View
                      style={{
                        opacity:
                          currentVideoPreview ===
                          (chroma.streamedVideo || videoPreview)
                            ? 1
                            : 0.4,
                        borderWidth: 2,
                        borderColor:
                          currentVideoPreview ===
                          (chroma.streamedVideo || videoPreview)
                            ? Colors.text.highlighted
                            : Colors.text.active,
                        borderRadius: 2,
                        boxShadow:
                          currentVideoPreview ===
                          (chroma.streamedVideo || videoPreview)
                            ? "0px 0px 15px 0px rgba(57,255,202,.25)"
                            : "none",
                      }}
                    >
                      <Image
                        source={{ uri: chroma.swatch }}
                        style={{
                          width: 45,
                          height: 45,
                          borderRadius: 1,
                        }}
                        resizeMode="cover"
                      ></Image>
                    </View>
                  </TouchableHighlight>
                ))}
              </View>
            </>
          ) : (
            <Text
              style={{
                color: Colors.dark.text,
                fontFamily: "Rubik400",
                fontSize: 16,
                marginBlock: -5,
              }}
            >
              No variants found.
            </Text>
          )}
        </View>

        <View style={{ width: "100%", gap: 20 }}>
          <TouchableHighlight
            onPress={() => {
              addSkinToWishList(selectedSkin);
              handleWishlistPress(selectedSkin);
            }}
            activeOpacity={0.25}
            underlayColor={Colors.accent.darkRed}
            style={
              !inWishlist
                ? Styles.addWishListButton
                : Styles.removeWishListButton
            }
          >
            <View style={{ flexDirection: "row", gap: 5 }}>
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
                style={{ fontWeight: 700 }}
                size={30}
              />
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => setSelectedSkin(null)}
            activeOpacity={0.25}
            underlayColor={Colors.accent.darkColor}
            style={{
              backgroundColor: Colors.accent.color,
              borderRadius: 2,
              padding: 6,
              width: "100%",
            }}
          >
            <Text
              style={{
                fontFamily: "Rubik500",
                color: "white",
                fontSize: 20,
                textAlign: "center",
              }}
            >
              Close
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
};

const Styles = StyleSheet.create({
  addWishListButton: {
    borderWidth: 2,
    borderColor: Colors.accent.red,
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
