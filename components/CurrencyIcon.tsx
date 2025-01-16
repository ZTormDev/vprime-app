import React from "react";
import { Image, StyleSheet, ImageStyle } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

interface Props {
  icon: "vp" | "rad" | "kdc"; // Agregamos "kdc" como posible valor
  size: number;
  style?: ImageStyle; // Añadimos una prop opcional para el estilo
}

export default function CurrencyIcon(props: Props) {
  const { size, style, icon } = props;

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
          : require("../assets/images/kdc.png") // Para "kdc"
      }
      {...props}
    />
  );
}
