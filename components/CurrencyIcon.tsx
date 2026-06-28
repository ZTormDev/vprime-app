import React from "react";
import { Image, ImageStyle, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

interface Props {
  icon: "vp" | "rad" | "kdc";
  size: number;
  style?: ImageStyle;
}

export default function CurrencyIcon({ size, style, icon }: Props) {
  return (
    <Image
      style={StyleSheet.flatten([
        {
          width: size,
          height: size,
          tintColor: Colors.dark.text,
          marginBottom: 2,
        },
        style,
      ])}
      source={
        icon === "vp"
          ? require("../assets/images/vp.png")
          : icon === "rad"
          ? require("../assets/images/rad.png")
          : require("../assets/images/kdc.png")
      }
    />
  );
}
