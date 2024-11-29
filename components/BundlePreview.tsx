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

export const BundlePreview = ({ bundleData, setSelectedBundle }) => {
  return (
    <ScrollView
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
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          gap: 25,
        }}
      >
        <View>
          <Text>{bundleData.displayName}</Text>
        </View>
        <View>
          {bundleData.bundleItems.map((item: any) => (
            <TouchableHighlight
              key={item.uuid}
              activeOpacity={0.25}
              underlayColor={Colors.dark.cardPress}
              //   onPress={() => showSkinPanel(true, skin.levels[0].uuid)}
              style={{
                borderWidth: 1,
                borderColor: Colors.dark.cardPress,
                width: "90%",
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
        <View>
          <TouchableHighlight
            onPress={() => {
              setSelectedBundle(null);
            }}
          >
            <View>
              <Text>Close</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </ScrollView>
  );
};
