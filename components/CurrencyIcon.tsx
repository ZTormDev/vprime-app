import React from "react";
import { Image, StyleSheet, ImageStyle } from "react-native";

interface Props {
  icon: "vp" | "rad";
  size: number;
  style?: ImageStyle; // Añadimos una prop opcional para el estilo
}

export default function CurrencyIcon(props: Props) {
  const { size, style, icon } = props;
  
  return (
    <Image
      style={StyleSheet.flatten([{ width: size, height: size}, style])}
      source={
        icon === "vp"
          ? require("../assets/images/vp.png")
          : require("../assets/images/rad.png")
      }
      {...props}
    />
  );
}
