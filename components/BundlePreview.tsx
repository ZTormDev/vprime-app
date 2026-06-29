import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import CurrencyIcon from "./CurrencyIcon";
import { LinearGradient } from "expo-linear-gradient";
import { isInWishList } from "@/API/valorant-api";
import { SkinPreview } from "./SkinPreview";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { useTheme } from "@/src/hooks/useTheme";
import { AnimatedEntrance, AnimatedPressable, runWhenIdle } from "@/src/components/common/Motion";

type BundlePreviewProps = {
  bundleData: any;
  setSelectedBundle: (bundle: any | null) => void;
};

function BundleStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof TabBarIcon>["name"];
}) {
  const { colors, theme, accent } = useTheme();
  return (
    <View style={styles.statCard}>
      <TabBarIcon name={icon} color={accent.gold} size={18} />
      <View style={styles.statTextBlock}>
        <Text style={[styles.statLabel, { color: colors.subtle }]}>{label}</Text>
        <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export const BundlePreview = ({
  bundleData,
  setSelectedBundle,
}: BundlePreviewProps) => {
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);

  const { colors, theme, accent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, accent, theme), [colors, accent, theme]);

  const showSkinPanel = async (show: boolean, skin: any) => {
    if (show) {
      const lastLevel: any = Object.keys(skin.levels).sort().reverse()[0];
      setVideoPreview(skin.levels[lastLevel].streamedVideo);
      runWhenIdle(() => {
        setSelectedSkin(skin);
      });
    } else {
      setSelectedSkin(null);
    }
  };

  const handleWishlistPress = async (skin: any) => {
    const wishlisted = await isInWishList(skin);
    setInWishlist(wishlisted);
  };

  return (
    <View style={styles.overlay}>
      <AnimatedEntrance style={styles.sheet} distance={18} duration={260}>
        <View style={styles.grabber} />

        <View style={styles.hero}>
          {bundleData.displayIcon && (
            <Image
              source={{ uri: bundleData.displayIcon }}
              style={styles.heroImage}
              blurRadius={3}
            />
          )}
          <LinearGradient
            colors={[
              "rgba(9,10,12,0.1)",
              "rgba(9,10,12,0.88)"
            ]}
            style={styles.heroOverlay}
          />
          <TouchableOpacity
            onPress={() => setSelectedBundle(null)}
            activeOpacity={0.76}
            style={styles.closeIconButton}
          >
            <TabBarIcon name="close" color={colors.text} size={20} />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>Featured Collection</Text>
            <Text style={styles.title} numberOfLines={2}>
              {bundleData.displayName}
            </Text>
            <View style={styles.priceChip}>
              <CurrencyIcon icon="vp" size={16} />
              <Text style={styles.priceText}>{bundleData.bundlePrice}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle={theme === "dark" ? "white" : "black"}
        >
          <View style={styles.statsRow}>
            <BundleStat
              label="ITEMS INCLUDED"
              value={bundleData.bundleItems?.length || 0}
              icon="albums-outline"
            />
            <BundleStat label="CATALOG TYPE" value="Limited Bundle" icon="sparkles-outline" />
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>CONTENTS</Text>
              <Text style={styles.sectionTitle}>Weapon & Gear items</Text>
            </View>
          </View>

          <View style={styles.itemGrid}>
            {bundleData.bundleItems.map((item: any, index: number) => (
              <AnimatedEntrance
                key={item.uuid}
                delay={(index % 6) * 30}
                distance={12}
                duration={240}
                style={styles.itemGridCell}
              >
                <AnimatedPressable
                  onPress={() => showSkinPanel(true, item)}
                  pressedScale={0.965}
                  style={styles.itemCard}
                  contentStyle={styles.itemPressableContent}
                >
                  <LinearGradient
                    colors={[
                      theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                      item.TierColor || accent.goldSoft,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.itemGradient}
                  />

                  <View style={styles.itemInner}>
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemMeta} numberOfLines={1}>
                        {item.TierName || "Weapon Skin"}
                      </Text>
                      <View style={styles.smallPriceChip}>
                        <CurrencyIcon icon="vp" size={12} />
                        <Text style={styles.smallPriceText}>{item.Cost}</Text>
                      </View>
                    </View>

                    <Image
                      source={{ uri: item.levels?.[0]?.displayIcon || item.displayIcon }}
                      style={styles.itemImage}
                      fadeDuration={0}
                    />

                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.displayName}
                    </Text>
                  </View>
                </AnimatedPressable>
              </AnimatedEntrance>
            ))}
          </View>
        </ScrollView>
      </AnimatedEntrance>

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

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    minHeight: 58,
    borderRadius: 14,
    overflow: "hidden",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statTextBlock: {
    flex: 1,
  },
  statLabel: {
    fontFamily: "Rubik700",
    fontSize: 10,
    letterSpacing: 0.3,
  },
  statValue: {
    fontFamily: "Rubik800",
    fontSize: 15,
  },
});

function createStyles(colors: any, accent: any, theme: string) {
  return StyleSheet.create({
    overlay: {
      position: "absolute",
      top: Platform.OS === "ios" ? 112 : 94,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 9,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.6)",
    },
    sheet: {
      height: "100%",
      width: "100%",
      overflow: "hidden",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.96)" : "rgba(248,250,252,0.96)",
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    grabber: {
      position: "absolute",
      top: 8,
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 4,
      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
      zIndex: 20,
    },
    hero: {
      width: "100%",
      minHeight: 250,
      justifyContent: "flex-end",
      backgroundColor: colors.backgroundAlt,
    },
    heroImage: {
      position: "absolute",
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    heroOverlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    closeIconButton: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 38,
      height: 38,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.78)" : "rgba(255,255,255,0.78)",
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 21,
    },
    heroContent: {
      padding: 16,
      gap: 6,
    },
    eyebrow: {
      fontSize: 11,
      color: accent.gold,
      fontFamily: "Rubik700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 26,
      lineHeight: 30,
      color: colors.text,
      fontFamily: "Rubik800",
      maxWidth: "90%",
    },
    priceChip: {
      alignSelf: "flex-start",
      height: 32,
      paddingHorizontal: 10,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(0,0,0,0.38)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    },
    priceText: {
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 14,
    },
    scroll: {
      width: "100%",
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
      gap: 16,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
    },
    sectionHeader: {
      marginTop: 2,
    },
    sectionEyebrow: {
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 10,
      letterSpacing: 0.5,
    },
    sectionTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 20,
    },
    itemGrid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 12,
    },
    itemGridCell: {
      width: "48%",
      aspectRatio: 0.86,
    },
    itemCard: {
      width: "100%",
      height: "100%",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.glass,
    },
    itemPressableContent: {
      flex: 1,
      alignItems: "stretch",
      justifyContent: "flex-start",
    },
    itemInner: {
      flex: 1,
      width: "100%",
      padding: 12,
      justifyContent: "space-between",
    },
    itemGradient: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      opacity: 0.38,
    },
    itemTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    itemMeta: {
      flex: 1,
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    smallPriceChip: {
      height: 24,
      paddingHorizontal: 7,
      borderRadius: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: theme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.72)",
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    smallPriceText: {
      fontFamily: "Rubik700",
      color: colors.text,
      fontSize: 10,
    },
    itemImage: {
      width: "100%",
      height: "46%",
      resizeMode: "contain",
      alignSelf: "center",
      marginVertical: 10,
    },
    itemName: {
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 13,
      lineHeight: 16,
      minHeight: 32,
      textAlign: "center",
    },
  });
}
