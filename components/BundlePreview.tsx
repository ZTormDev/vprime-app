import React, { useState } from "react";
import {
  TouchableHighlight,
  View,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/Colors";
import CurrencyIcon from "./CurrencyIcon";
import { LinearGradient } from "expo-linear-gradient";
import { getSkin, isInWishList } from "@/app/API/valorant-api";
import { SkinPreview } from "./SkinPreview";

export const BundlePreview = ({ bundleData, setSelectedBundle }) => {
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);

  const showSkinPanel = async (show: boolean, skin: any) => {
    if (show) {
      setSelectedSkin(skin);

      const lastLevel: any = Object.keys(skin.levels).sort().reverse()[0];

      setVideoPreview(skin.levels[lastLevel].streamedVideo);
    } else {
      setSelectedSkin(null);
    }
  };

  const handleWishlistPress = async (skin: any) => {
    let inWishlist = await isInWishList(skin);
    setInWishlist(inWishlist);
  };

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.dark.background,
          zIndex: 10,
          width: "100%",
          height: "100%",
          justifyContent: "space-between",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <View
          style={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexDirection: "row",
            backgroundColor: Colors.dark.tabBar,
            boxShadow: "0px 10px 15px 0px rgba(0,0,0,0.35)",
            zIndex: 11,
            width: "100%",
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <View style={{ width: "70%" }}>
            <Text
              style={{
                fontSize: 28,
                color: Colors.dark.text,
                fontFamily: "Rubik600",
              }}
            >
              {bundleData.displayName}
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: Colors.text.highlighted,
                fontFamily: "Rubik500",
                marginTop: -10,
              }}
            >
              Collection
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
              marginTop: 5,
            }}
          >
            <CurrencyIcon icon="vp" size={24} />
            <Text
              style={{
                fontFamily: "Rubik400",
                color: Colors.dark.text,
                fontSize: 22,
              }}
            >
              {bundleData.bundlePrice}
            </Text>
          </View>
        </View>
        <ScrollView
          style={{
            width: "100%",
            borderRadius: 2,
            height: "100%",
            padding: 20,
          }}
          persistentScrollbar={true}
        >
          <View
            style={{
              width: "100%",
              alignItems: "center",
              gap: 20,
              marginBottom: 100,
            }}
          >
            {bundleData.bundleItems.map((item: any) => (
              <TouchableHighlight
                key={item.uuid}
                activeOpacity={0.25}
                underlayColor={Colors.dark.cardPress}
                onPress={() => showSkinPanel(true, item)}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.dark.cardPress,
                  width: "100%",
                  borderRadius: 2,
                }}
              >
                <>
                  <LinearGradient
                    colors={["rgba(0,0,0,0.1)", item.TierColor]}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                  <View
                    style={{
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      display: "flex",
                      flexDirection: "column",
                      padding: 8,
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 5,
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <CurrencyIcon icon="vp" size={22} />
                      <Text
                        style={{
                          fontFamily: "Rubik400",
                          color: Colors.dark.text,
                          fontSize: 20,
                        }}
                      >
                        {item.Cost}
                      </Text>
                    </View>

                    <View
                      style={{
                        width: "100%",
                        marginVertical: "-6%",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.levels[0].displayIcon || item.displayIcon,
                        }}
                        style={{
                          width: "80%",
                          resizeMode: "contain",
                          aspectRatio: 16 / 9,
                        }}
                      />
                    </View>

                    <Text
                      style={{
                        fontFamily: "Rubik500",
                        color: "white",
                        fontSize: 20,
                        fontWeight: 500,
                        textAlign: "left",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.displayName}
                    </Text>
                  </View>
                </>
              </TouchableHighlight>
            ))}
          </View>
        </ScrollView>
        <TouchableHighlight
          onPress={() => {
            setSelectedBundle(null);
          }}
          style={{
            backgroundColor: Colors.accent.red,
            width: "95%",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 2,
            padding: 10,
            bottom: 0,
            margin: 12,
            position: "absolute",
            boxShadow: "0 0 25px 0 rgba(0,0,0,0.5)",
          }}
          underlayColor={Colors.accent.darkRed}
        >
          <Text
            style={{
              color: Colors.dark.text,
              fontSize: 20,
              fontFamily: "Rubik500",
            }}
          >
            Close
          </Text>
        </TouchableHighlight>
      </View>

      {selectedSkin && (
        <SkinPreview
          selectedSkin={selectedSkin}
          videoPreview={videoPreview}
          inWishlist={inWishlist}
          handleWishlistPress={handleWishlistPress}
          setSelectedSkin={setSelectedSkin}
          price={selectedSkin.Cost}
        />
      )}
    </View>
  );
};
