import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { Colors } from "@/constants/Colors";

export function OfflineBanner() {
  const netInfo = useNetInfo();

  // Only show if network status is determined AND disconnected
  if (netInfo.isConnected === false) {
    return (
      <View style={styles.banner}>
        <Text style={styles.text}>
          No Internet Connection
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    backgroundColor: Colors.accent.ultraDarkRed,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 9999,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,77,97,0.32)",
  },
  text: {
    fontFamily: "Rubik700",
    color: Colors.accent.red,
    fontSize: 12,
  },
});
