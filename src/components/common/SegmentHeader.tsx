import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/hooks/useTheme";

type SegmentHeaderProps = {
  activeSegment: "store" | "skins" | "profile";
  transparentBackground?: boolean;
};

export function SegmentHeader({ activeSegment, transparentBackground = false }: SegmentHeaderProps) {
  const router = useRouter();
  const { colors, theme, accent } = useTheme();
  const styles = React.useMemo(
    () => createStyles(colors, accent, theme, transparentBackground),
    [colors, accent, theme, transparentBackground]
  );

  const handlePress = (target: "store" | "skins" | "profile") => {
    if (activeSegment !== target) {
      router.replace(`/(tabs)/${target}`);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          onPress={() => handlePress("store")}
          activeOpacity={0.8}
          style={[styles.segmentItem, activeSegment === "store" && styles.activeItem]}
        >
          <Text style={[styles.segmentText, activeSegment === "store" ? styles.activeText : { color: colors.muted }]}>
            Console
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress("skins")}
          activeOpacity={0.8}
          style={[styles.segmentItem, activeSegment === "skins" && styles.activeItem]}
        >
          <Text style={[styles.segmentText, activeSegment === "skins" ? styles.activeText : { color: colors.muted }]}>
            Armory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress("profile")}
          activeOpacity={0.8}
          style={[styles.segmentItem, activeSegment === "profile" && styles.activeItem]}
        >
          <Text style={[styles.segmentText, activeSegment === "profile" ? styles.activeText : { color: colors.muted }]}>
            Terminal
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(colors: any, accent: any, theme: string, transparentBackground: boolean) {
  return StyleSheet.create({
    outerContainer: {
      width: "100%",
      paddingTop: Platform.OS === "ios" ? 54 : 36,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: transparentBackground ? "transparent" : colors.background,
      zIndex: 100,
    },
    segmentContainer: {
      flexDirection: "row",
      height: 48,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      borderWidth: 1,
      borderColor: colors.border,
      padding: 3,
    },
    segmentItem: {
      flex: 1,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 11,
    },
    activeItem: {
      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.85)",
    },
    segmentText: {
      fontFamily: "Rubik700",
      fontSize: 14,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    activeText: {
      color: accent.gold,
    },
  });
}
