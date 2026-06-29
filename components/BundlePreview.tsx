import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import CurrencyIcon from "./CurrencyIcon";
import { LinearGradient } from "expo-linear-gradient";
import { isInWishList } from "@/API/valorant-api";
import { SkinPreview } from "./SkinPreview";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { useTheme } from "@/src/hooks/useTheme";

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
      setSelectedSkin(skin);

      const lastLevel: any = Object.keys(skin.levels).sort().reverse()[0];
      setVideoPreview(skin.levels[lastLevel].streamedVideo);
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
      <View style={styles.sheet}>
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

          {bundleData.bundleItems.map((item: any) => (
            <TouchableOpacity
              key={item.uuid}
              activeOpacity={0.8}
              onPress={() => showSkinPanel(true, item)}
              style={styles.itemCard}
            >
              <LinearGradient
                colors={[
                  theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                  item.TierColor || accent.goldSoft,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.itemGradient}
              />
              <View style={styles.itemHeader}>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {item.TierName || "Gear Item"}
                </Text>
                <View style={styles.smallPriceChip}>
                  <CurrencyIcon icon="vp" size={13} />
                  <Text style={styles.smallPriceText}>{item.Cost}</Text>
                </View>
              </View>

              <Image
                source={{ uri: item.levels[0].displayIcon || item.displayIcon }}
                style={styles.itemImage}
              />

              <View style={styles.itemFooter}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.displayName}
                </Text>
                <View style={styles.openPill}>
                  <Text style={styles.openPillText}>Inspect</Text>
                  <TabBarIcon
                    name="chevron-forward"
                    color={colors.text}
                    size={14}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 9,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.6)",
    },
    sheet: {
      height: "94%",
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
    itemCard: {
      width: "100%",
      minHeight: 174,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 16,
      overflow: "hidden",
      padding: 14,
      backgroundColor: colors.glass,
    },
    itemGradient: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      opacity: 0.38,
    },
    itemHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
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
      height: 26,
      paddingHorizontal: 8,
      borderRadius: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: theme === "dark" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.7)",
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    smallPriceText: {
      fontFamily: "Rubik700",
      color: colors.text,
      fontSize: 11,
    },
    itemImage: {
      width: "80%",
      resizeMode: "contain",
      aspectRatio: 16 / 9,
      alignSelf: "center",
      marginVertical: 4,
    },
    itemFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    itemName: {
      flex: 1,
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 16,
    },
    openPill: {
      height: 28,
      paddingLeft: 8,
      paddingRight: 6,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    openPillText: {
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 11,
    },
  });
}
