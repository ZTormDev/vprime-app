import React from "react";
import { BlurView, type BlurViewProps } from "expo-blur";

import { Platform, View } from "react-native";

export function AppBlurView(props: BlurViewProps) {
  const { style, ...rest } = props;

  if (Platform.OS === "android") {
    return (
      <View
        pointerEvents="none"
        style={[
          style,
          {
            backgroundColor: "rgba(18,20,24,0.90)",
          },
        ]}
      />
    );
  }

  return <BlurView {...rest} style={style} />;
}
