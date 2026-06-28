import React from "react";
import { View, Text } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { Colors } from "@/constants/Colors";

export function OfflineBanner() {
  const netInfo = useNetInfo();

  // Only show if network status is determined AND disconnected
  if (netInfo.isConnected === false) {
    return (
      <View
        style={{
          width: "100%",
          backgroundColor: Colors.accent.red,
          paddingVertical: 6,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 9999,
        }}
      >
        <Text
          style={{
            fontFamily: "Rubik600",
            color: "white",
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          No Internet Connection
        </Text>
      </View>
    );
  }

  return null;
}
