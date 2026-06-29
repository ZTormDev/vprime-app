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
import { AppBlurView } from "@/src/components/common/AppBlurView";
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
      <AppBlurView
        tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
        intensity={32}
        style={styles.blurLayer}
      />
      <TabBarIcon name={icon} color={accent.blue} size={20} />
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
        <AppBlurView
          tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
          intensity={72}
          style={styles.blurLayer}
        />
        <View style={styles.grabber} />

        <View style={styles.hero}>
          {bundleData.displayIcon && (
            <Image
              source={{ uri: bundleData.displayIcon }}
              style={styles.heroImage}
            />
          )}
          <LinearGradient
            colors={[
              theme === "dark" ? "rgba(16,17,20,0.08)" : "rgba(248,250,252,0.08)",
              theme === "dark" ? "rgba(16,17,20,0.42)" : "rgba(248,250,252,0.42)",
              theme === "dark" ? "rgba(16,17,20,0.96)" : "rgba(248,250,252,0.96)",
            ]}
            style={styles.heroOverlay}
          />
          <TouchableOpacity
            onPress={() => setSelectedBundle(null)}
            activeOpacity={0.74}
            style={styles.closeIconButton}
          >
            <TabBarIcon name="close" color={colors.text} size={22} />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>Featured Bundle</Text>
            <Text style={styles.title} numberOfLines={2}>
              {bundleData.displayName}
            </Text>
            <View style={styles.priceChip}>
              <CurrencyIcon icon="vp" size={18} />
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
              label="Items"
              value={bundleData.bundleItems?.length || 0}
              icon="albums-outline"
            />
            <BundleStat label="Type" value="Collection" icon="sparkles-outline" />
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>Preview</Text>
              <Text style={styles.sectionTitle}>Bundle Items</Text>
            </View>
            <Text style={styles.sectionCount}>
              {bundleData.bundleItems?.length || 0}
            </Text>
          </View>

          {bundleData.bundleItems.map((item: any) => (
            <TouchableOpacity
              key={item.uuid}
              activeOpacity={0.76}
              onPress={() => showSkinPanel(true, item)}
              style={styles.itemCard}
            >
              <AppBlurView
                tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
                intensity={34}
                style={styles.blurLayer}
              />
              <LinearGradient
                colors={[
                  theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                  item.TierColor || accent.blueSoft,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.itemGradient}
              />
              <View style={styles.itemHeader}>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {item.TierName || "Bundle Item"}
                </Text>
                <View style={styles.smallPriceChip}>
                  <CurrencyIcon icon="vp" size={16} />
                  <Text style={styles.smallPriceText}>{item.Cost}</Text>
                </View>
              </View>

              <Image
                source={{ uri: item.levels[0].displayIcon || item.displayIcon }}
                style={styles.itemImage}
              />

              <View style={styles.itemFooter}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.displayName}
                </Text>
                <View style={styles.openPill}>
                  <Text style={styles.openPillText}>Open</Text>
                  <TabBarIcon
                    name="chevron-forward"
                    color={colors.text}
                    size={15}
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
    minHeight: 64,
    borderRadius: 8,
    overflow: "hidden",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  blurLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  statTextBlock: {
    flex: 1,
  },
  statLabel: {
    fontFamily: "Rubik600",
    fontSize: 12,
  },
  statValue: {
    fontFamily: "Rubik800",
    fontSize: 17,
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
      backgroundColor: "rgba(0,0,0,0.58)",
    },
    sheet: {
      height: "94%",
      width: "100%",
      overflow: "hidden",
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.96)" : "rgba(248,250,252,0.96)",
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    grabber: {
      position: "absolute",
      top: 8,
      alignSelf: "center",
      width: 44,
      height: 5,
      borderRadius: 8,
      backgroundColor: colors.theme === "dark" ? "rgba(255,255,255,0.36)" : "rgba(0,0,0,0.2)",
      zIndex: 20,
    },
    blurLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    hero: {
      width: "100%",
      minHeight: 270,
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
      top: 18,
      right: 16,
      width: 42,
      height: 42,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.72)" : "rgba(255,255,255,0.72)",
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 21,
    },
    heroContent: {
      padding: 16,
      gap: 8,
    },
    eyebrow: {
      fontSize: 12,
      color: accent.green,
      fontFamily: "Rubik700",
      textTransform: "uppercase",
    },
    title: {
      fontSize: 32,
      lineHeight: 36,
      color: colors.text,
      fontFamily: "Rubik800",
      maxWidth: "90%",
    },
    priceChip: {
      alignSelf: "flex-start",
      minHeight: 36,
      paddingHorizontal: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme === "dark" ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.8)",
      borderWidth: 1,
      borderColor: colors.border,
    },
    priceText: {
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 16,
    },
    scroll: {
      width: "100%",
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 28,
      gap: 14,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginTop: 2,
    },
    sectionEyebrow: {
      color: colors.subtle,
      fontFamily: "Rubik600",
      fontSize: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 23,
    },
    sectionCount: {
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 15,
    },
    itemCard: {
      width: "100%",
      minHeight: 190,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: 8,
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
      opacity: 0.44,
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
      fontFamily: "Rubik600",
      fontSize: 12,
      textTransform: "uppercase",
    },
    smallPriceChip: {
      minHeight: 30,
      paddingHorizontal: 10,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: theme === "dark" ? "rgba(0,0,0,0.24)" : "rgba(255,255,255,0.7)",
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    smallPriceText: {
      fontFamily: "Rubik700",
      color: colors.text,
      fontSize: 14,
    },
    itemImage: {
      width: "86%",
      resizeMode: "contain",
      aspectRatio: 16 / 9,
      alignSelf: "center",
      marginVertical: 7,
    },
    itemFooter: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
    },
    itemName: {
      flex: 1,
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 20,
    },
    openPill: {
      minHeight: 30,
      paddingLeft: 10,
      paddingRight: 8,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    openPillText: {
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 12,
    },
  });
}
