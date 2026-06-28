import { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React from "react";
import {
  getSkin,
  isInWishList,
  AccessToken,
  fetchStoreData,
} from "../../API/valorant-api";
import { useShopStore } from "../../src/store/useShopStore";
import { Colors } from "@/constants/Colors";
import CurrencyIcon from "@/components/CurrencyIcon";
import { LinearGradient } from "expo-linear-gradient";
import { SkinPreview } from "@/components/SkinPreview";
import { BundlePreview } from "@/components/BundlePreview";
import { AccessoryPreview } from "@/components/AccesoryPreview";
import { useNavigation } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  timer?: string;
  tone?: "blue" | "green" | "red" | "violet";
};

function SectionHeader({ eyebrow, title, timer, tone = "blue" }: SectionHeaderProps) {
  const toneStyle = {
    blue: styles.blueChip,
    green: styles.greenChip,
    red: styles.redChip,
    violet: styles.violetChip,
  }[tone];

  return (
    <View style={styles.sectionHeader}>
      <View>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {timer && (
        <View style={[styles.timerChip, toneStyle]}>
          <TabBarIcon name="time-outline" color={Colors.dark.text} size={15} />
          <Text style={styles.timerText}>{timer}</Text>
        </View>
      )}
    </View>
  );
}

function PriceChip({ icon = "vp", value }: { icon?: "vp" | "kdc" | "rad"; value: any }) {
  return (
    <View style={styles.priceChip}>
      <CurrencyIcon icon={icon} size={17} />
      <Text style={styles.priceText}>{value}</Text>
    </View>
  );
}

export default function StoreScreen() {
  const [OffersTimeRemaining, setOffersTimeRemaining] = useState("");
  const [featuredBundleTimeRemaining, setFeaturedBundleTimeRemaining] =
    useState("");
  const [nightMarketTimeRemaining, setNightMarketTimeRemaining] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  const storeSkins = useShopStore((state) => state.storeSkins);
  const featuredBundle = useShopStore((state) => state.featuredBundle);
  const nightMarket = useShopStore((state) => state.nightMarket);
  const accessoryStoreOffers = useShopStore((state) => state.accessoryStoreOffers);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setSelectedSkin(null);
      setSelectedBundle(null);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    });

    return unsubscribe;
  }, [navigation]);

  const calculateFeaturedBundleTimeRemaining = async (
    initialSeconds: number
  ) => {
    if (initialSeconds <= 0) {
      try {
        await fetchStoreData();
        return "00:00:00:00";
      } catch (error) {
        console.error(
          "error fetching store data in calculating time remaining: " + error
        );
      }
    }

    const days = Math.floor(initialSeconds / (3600 * 24));
    const hours = Math.floor((initialSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((initialSeconds % 3600) / 60);
    const seconds = initialSeconds % 60;

    const formattedDays = String(days).padStart(2, "0");
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedDays}:${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const calculateNightMarketTimeRemaining = async (initialSeconds: number) => {
    if (initialSeconds <= 0) {
      try {
        await fetchStoreData();
        return "00:00:00:00";
      } catch (error) {
        console.error(
          "error fetching store data in calculating time remaining: " + error
        );
      }
    }

    const days = Math.floor(initialSeconds / (3600 * 24));
    const hours = Math.floor((initialSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((initialSeconds % 3600) / 60);
    const seconds = initialSeconds % 60;

    const formattedDays = String(days).padStart(2, "0");
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedDays}:${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const calculateOffersTimeRemaining = async (initialSeconds: number) => {
    if (initialSeconds <= 0) {
      try {
        await fetchStoreData();
        return "00:00:00";
      } catch (error) {
        console.error(
          "error fetching store data in calculating time remaining: " + error
        );
      }
    }

    const hours = Math.floor((initialSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((initialSeconds % 3600) / 60);
    const seconds = initialSeconds % 60;

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    if (featuredBundle?.timeRemaining && storeSkins?.OffersTimeRemaining) {
      if (nightMarket && nightMarket.Offers.length > 0) {
        const initialSecondsNightMarket = nightMarket.TimeRemaining;
        let remainingSecondsNightMarket = initialSecondsNightMarket;

        const intervalNightMarket = setInterval(async () => {
          remainingSecondsNightMarket -= 1;
          const seconds = await calculateNightMarketTimeRemaining(remainingSecondsNightMarket);
          if (seconds) setNightMarketTimeRemaining(seconds);
          if (remainingSecondsNightMarket <= 0) {
            clearInterval(intervalNightMarket);
          }
        }, 1000);

        return () => {
          clearInterval(intervalNightMarket);
        };
      }

      const initialSecondsBundle = featuredBundle.timeRemaining;
      let remainingSecondsBundle = initialSecondsBundle;

      const initialSecondsOffers = storeSkins.OffersTimeRemaining;
      let remainingSecondsOffers = initialSecondsOffers;

      const intervalBundle = setInterval(async () => {
        remainingSecondsBundle -= 1;
        const seconds = await calculateFeaturedBundleTimeRemaining(remainingSecondsBundle);
        if (seconds) setFeaturedBundleTimeRemaining(seconds);

        if (remainingSecondsBundle <= 0) {
          clearInterval(intervalBundle);
        }
      }, 1000);

      const intervalOffers = setInterval(async () => {
        remainingSecondsOffers -= 1;
        const seconds = await calculateOffersTimeRemaining(remainingSecondsOffers);
        if (seconds) setOffersTimeRemaining(seconds);
        if (remainingSecondsOffers <= 0) {
          clearInterval(intervalOffers);
        }
      }, 1000);

      return () => {
        clearInterval(intervalBundle);
        clearInterval(intervalOffers);
      };
    }
  }, [featuredBundle, storeSkins]);

  const showSkinPanel = async (show: boolean, skinUUID: any) => {
    if (show) {
      const skin = await getSkin(skinUUID);
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

  const renderSkinCard = (skin: any, accent = skin.TierColor) => (
    <TouchableOpacity
      key={skin.uuid}
      activeOpacity={0.76}
      onPress={() => showSkinPanel(true, skin.levels[0].uuid)}
      style={styles.skinCard}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.06)", accent || Colors.accent.blueSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      />
      <View style={styles.cardTopRow}>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {skin.TierName || "Weapon Skin"}
        </Text>
        <PriceChip value={skin.Cost} />
      </View>
      <View style={styles.skinImageWrap}>
        <Image
          source={{ uri: skin.levels[0].displayIcon || skin.displayIcon }}
          style={styles.skinImage}
        />
      </View>
      <Text style={styles.skinNameText} numberOfLines={2}>
        {skin.displayName}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {AccessToken && storeSkins && featuredBundle ? (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <LinearGradient
              colors={[Colors.accent.blueSoft, Colors.accent.greenSoft, "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroWash}
            />
            <Text style={styles.heroEyebrow}>VPrime</Text>
            <Text style={styles.heroTitle}>Store</Text>
            <Text style={styles.heroSubtitle}>
              Daily offers, featured collections, and accessories in one clean view.
            </Text>
          </View>

          {nightMarket && nightMarket.Offers.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                eyebrow="Event"
                title="Night Market"
                timer={nightMarketTimeRemaining}
                tone="violet"
              />
              <View style={styles.skinList}>
                {nightMarket.Offers.map((skin: any) =>
                  renderSkinCard(skin, skin.TierColor || Colors.accent.violetSoft)
                )}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <SectionHeader
              eyebrow="Featured"
              title="Bundle"
              timer={featuredBundleTimeRemaining}
              tone="green"
            />
            {featuredBundle && featuredBundle.displayIcon && (
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => setSelectedBundle(featuredBundle)}
                style={styles.bundleCard}
              >
                <Image
                  source={{ uri: featuredBundle.displayIcon }}
                  style={styles.bundleImage}
                />
                <LinearGradient
                  colors={["rgba(16,17,20,0.95)", "rgba(16,17,20,0.35)", "rgba(16,17,20,0.86)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bundleOverlay}
                />
                <View style={styles.bundleContent}>
                  <View>
                    <Text style={styles.bundleLabel}>Collection</Text>
                    <Text style={styles.bundleNameText} numberOfLines={2}>
                      {featuredBundle.displayName}
                    </Text>
                  </View>
                  <PriceChip value={featuredBundle.bundlePrice} />
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              eyebrow="Daily"
              title="Offers"
              timer={OffersTimeRemaining}
            />
            <View style={styles.skinList}>
              {storeSkins.map((skin: any) => renderSkinCard(skin))}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader
              eyebrow="Extras"
              title="Accessory Store"
              timer={OffersTimeRemaining}
              tone="red"
            />
            <View style={styles.accessoryList}>
              {accessoryStoreOffers &&
                accessoryStoreOffers.map((accessory: any) => (
                  <TouchableOpacity
                    key={accessory.uuid}
                    activeOpacity={0.76}
                    onPress={() => setSelectedAccessory(accessory)}
                    style={styles.accessoryCard}
                  >
                    <View style={styles.accessoryHeader}>
                      <Text style={styles.cardMeta}>{accessory.itemType}</Text>
                      <PriceChip icon="kdc" value={accessory.Cost} />
                    </View>

                    {accessory.displayIcon ? (
                      <View style={styles.accessoryImageContainer}>
                        <Image
                          source={{ uri: accessory.displayIcon }}
                          style={[
                            styles.accessoryImage,
                            {
                              aspectRatio:
                                accessory.itemType === "Player Card" ? 3 / 4 : 1,
                              height:
                                accessory.itemType === "Player Card" ? 176 : 104,
                            },
                          ]}
                        />
                      </View>
                    ) : (
                      <View style={styles.accessoryTextPlaceholder}>
                        <Text style={styles.accessoryTitlePlaceholder}>
                          {accessory.displayName}
                        </Text>
                      </View>
                    )}

                    <Text style={styles.accessoryName} numberOfLines={2}>
                      {accessory.displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.accent.blue} />
          <Text style={styles.loadingText}>Loading store</Text>
        </View>
      )}

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
      {selectedBundle && (
        <BundlePreview
          bundleData={selectedBundle}
          setSelectedBundle={setSelectedBundle}
        />
      )}
      {selectedAccessory && (
        <AccessoryPreview
          selectedAccessory={selectedAccessory}
          imagePreview={selectedAccessory.displayIcon}
          inWishlist={false}
          handleWishlistPress={() => {}}
          setSelectedAccessory={setSelectedAccessory}
          price={selectedAccessory.Cost}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 104,
    gap: 28,
  },
  hero: {
    overflow: "hidden",
    borderRadius: 8,
    padding: 18,
    minHeight: 142,
    backgroundColor: Colors.dark.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: "flex-end",
    shadowColor: Colors.shadow.color,
    shadowOpacity: Colors.shadow.softOpacity,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  heroWash: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  heroEyebrow: {
    color: Colors.accent.green,
    fontFamily: "Rubik700",
    fontSize: 13,
  },
  heroTitle: {
    color: Colors.dark.text,
    fontFamily: "Rubik800",
    fontSize: 34,
  },
  heroSubtitle: {
    color: Colors.dark.muted,
    fontFamily: "Rubik400",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "88%",
  },
  section: {
    width: "100%",
    gap: 14,
  },
  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  eyebrow: {
    color: Colors.dark.subtle,
    fontFamily: "Rubik600",
    fontSize: 12,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontFamily: "Rubik700",
    fontSize: 24,
  },
  timerChip: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  blueChip: {
    backgroundColor: Colors.accent.blueSoft,
  },
  greenChip: {
    backgroundColor: Colors.accent.greenSoft,
  },
  redChip: {
    backgroundColor: Colors.accent.ultraDarkRed,
  },
  violetChip: {
    backgroundColor: Colors.accent.violetSoft,
  },
  timerText: {
    color: Colors.dark.text,
    fontFamily: "Rubik600",
    fontSize: 12,
  },
  skinList: {
    gap: 14,
  },
  skinCard: {
    width: "100%",
    minHeight: 182,
    borderRadius: 8,
    overflow: "hidden",
    padding: 14,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.52,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardMeta: {
    flex: 1,
    color: Colors.dark.muted,
    fontFamily: "Rubik600",
    fontSize: 12,
    textTransform: "uppercase",
  },
  priceChip: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.24)",
    borderWidth: 1,
    borderColor: Colors.dark.hairline,
  },
  priceText: {
    color: Colors.dark.text,
    fontFamily: "Rubik600",
    fontSize: 14,
  },
  skinImageWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  skinImage: {
    width: "86%",
    resizeMode: "contain",
    aspectRatio: 16 / 9,
  },
  skinNameText: {
    color: Colors.dark.text,
    fontFamily: "Rubik700",
    fontSize: 20,
  },
  bundleCard: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.dark.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  bundleImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bundleOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  bundleContent: {
    width: "100%",
    height: "100%",
    padding: 16,
    justifyContent: "space-between",
  },
  bundleLabel: {
    color: Colors.accent.green,
    fontFamily: "Rubik700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  bundleNameText: {
    color: Colors.dark.text,
    fontFamily: "Rubik800",
    fontSize: 28,
    lineHeight: 31,
    maxWidth: "86%",
  },
  accessoryList: {
    gap: 14,
  },
  accessoryCard: {
    width: "100%",
    borderRadius: 8,
    padding: 14,
    overflow: "hidden",
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  accessoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  accessoryImageContainer: {
    width: "100%",
    minHeight: 120,
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  accessoryImage: {
    width: "62%",
    resizeMode: "contain",
  },
  accessoryTextPlaceholder: {
    minHeight: 104,
    justifyContent: "center",
    alignItems: "center",
  },
  accessoryTitlePlaceholder: {
    color: Colors.accent.green,
    fontFamily: "Rubik700",
    fontSize: 18,
    textAlign: "center",
  },
  accessoryName: {
    color: Colors.dark.text,
    fontFamily: "Rubik700",
    fontSize: 18,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: Colors.dark.text,
    fontFamily: "Rubik700",
    fontSize: 18,
  },
});
