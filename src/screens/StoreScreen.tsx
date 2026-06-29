import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import React from "react";
import {
  getSkin,
  isInWishList,
  AccessToken,
  fetchStoreData,
  getPlayerMMR,
} from "../../API/valorant-api";
import { useShopStore } from "../../src/store/useShopStore";
import { useAuthStore } from "../../src/store/useAuthStore";
import CurrencyIcon from "@/components/CurrencyIcon";
import { LinearGradient } from "expo-linear-gradient";
import { SkinPreview } from "@/components/SkinPreview";
import { BundlePreview } from "@/components/BundlePreview";
import { AccessoryPreview } from "@/components/AccesoryPreview";
import { useFocusEffect, useRouter } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useTheme } from "@/src/hooks/useTheme";
import { SegmentHeader } from "@/src/components/common/SegmentHeader";
import ProgressBar from "@/components/ProgressBar";

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
  const router = useRouter();

  const storeSkins = useShopStore((state) => state.storeSkins);
  const featuredBundle = useShopStore((state) => state.featuredBundle);
  const nightMarket = useShopStore((state) => state.nightMarket);
  const accessoryStoreOffers = useShopStore((state) => state.accessoryStoreOffers);
  const walletBalances = useShopStore((state) => state.walletBalances);

  const playerMMR = useShopStore((state) => state.playerMMR);
  const gameName = useAuthStore((state) => state.gameName);
  const tagline = useAuthStore((state) => state.tagline);
  const wishListSkins = useShopStore((state) => state.wishListSkins);
  const playerCard = useShopStore((state) => state.playerCard);
  const profileBackdropArt = playerCard?.wideArt || playerCard?.largeArt;

  const { colors, theme, accent: themeAccent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, themeAccent, theme), [colors, themeAccent, theme]);

  useEffect(() => {
    const fetchMMR = async () => {
      if (!playerMMR) {
        await getPlayerMMR();
      }
    };
    fetchMMR();
  }, [playerMMR]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedSkin(null);
        setSelectedBundle(null);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      };
    }, [])
  );

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

    const formattedDays = days.toString().padStart(2, "0");
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

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

    const hours = Math.floor(initialSeconds / 3600);
    const minutes = Math.floor((initialSeconds % 3600) / 60);
    const seconds = initialSeconds % 60;

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    if (featuredBundle && storeSkins) {
      let remainingSecondsBundle = featuredBundle.remainingSeconds;
      let remainingSecondsOffers = storeSkins[0]?.remainingSeconds || 0;

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

  useEffect(() => {
    if (nightMarket && nightMarket.Offers.length > 0) {
      let remainingSecondsNM = nightMarket.TimeRemaining;
      const intervalNM = setInterval(async () => {
        remainingSecondsNM -= 1;
        const seconds = await calculateOffersTimeRemaining(remainingSecondsNM);
        if (seconds) setNightMarketTimeRemaining(seconds);
        if (remainingSecondsNM <= 0) {
          clearInterval(intervalNM);
        }
      }, 1000);

      return () => clearInterval(intervalNM);
    }
  }, [nightMarket]);

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

  const formatBalance = (value: number) => value.toLocaleString("en-US");

  const renderMiniSkinCard = (skin: any, accent = skin.TierColor) => (
    <TouchableOpacity
      key={skin.uuid}
      activeOpacity={0.8}
      onPress={() => showSkinPanel(true, skin.levels[0].uuid)}
      style={styles.miniSkinCard}
    >
      <LinearGradient
        colors={[
          theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
          accent || themeAccent.goldSoft
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      />

      <View style={styles.miniCardTop}>
        <View style={styles.miniPriceWrap}>
          <CurrencyIcon icon="vp" size={13} />
          <Text style={styles.miniPriceText}>{skin.Cost}</Text>
        </View>
      </View>

      <Image
        source={{ uri: skin.levels[0].displayIcon || skin.displayIcon }}
        style={styles.miniSkinImage}
      />

      <Text style={styles.miniSkinName} numberOfLines={1}>
        {skin.displayName}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SegmentHeader activeSegment="store" />

      {AccessToken && storeSkins && featuredBundle ? (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle={theme === "dark" ? "white" : "black"}
        >
          {/* Row 1: Profile & Rank Bento Block */}
          <View style={styles.bentoProfileCard}>
            {profileBackdropArt && (
              <Image
                source={{ uri: profileBackdropArt }}
                style={styles.profileBackdropArt}
                blurRadius={4}
              />
            )}
            <LinearGradient
              colors={[
                "rgba(90,30,130,0.44)", // Purple
                "rgba(213,160,33,0.12)"  // Gold
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileBackdropTint}
            />

            <View style={styles.profileMainRow}>
              <View style={styles.avatarWrap}>
                {playerCard?.displayIcon && (
                  <Image source={{ uri: playerCard.displayIcon }} style={styles.avatarImg} />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileAgentLabel}>VALORANT ACTIVE</Text>
                <Text style={styles.profileName} numberOfLines={1}>
                  {gameName || "Agent"}
                </Text>
                <Text style={styles.profileTag}>#{tagline || "0000"}</Text>
              </View>
              {playerMMR?.Rank?.images?.largeIcon && (
                <Image
                  source={{ uri: playerMMR.Rank.images.largeIcon }}
                  style={styles.profileRankBadge}
                />
              )}
            </View>

            <View style={styles.profileDivider} />

            <View style={styles.profileProgressRow}>
              <Text style={styles.profileProgressLabel}>
                {playerMMR?.Rank?.tierName || "UNRANKED"}
              </Text>
              <View style={styles.progressContainer}>
                <ProgressBar
                  value={playerMMR?.LatestCompetitiveUpdate?.RankedRatingBeforeUpdate || 0}
                  maxValue={100}
                  isRankBar={true}
                />
              </View>
            </View>
          </View>

          {/* Row 2: Side-by-Side Bento Blocks */}
          <View style={styles.bentoRow}>
            {/* Wallet Block */}
            <View style={styles.walletBlock}>
              <Text style={styles.bentoBlockLabel}>Wallet</Text>
              <View style={styles.walletItems}>
                <View style={styles.walletItem}>
                  <CurrencyIcon icon="vp" size={18} />
                  <Text style={styles.walletVal} numberOfLines={1}>
                    {formatBalance(walletBalances.vp)}
                  </Text>
                </View>
                <View style={styles.walletItem}>
                  <CurrencyIcon icon="kdc" size={18} />
                  <Text style={styles.walletVal} numberOfLines={1}>
                    {formatBalance(walletBalances.kingdomCredits)}
                  </Text>
                </View>
                <View style={styles.walletItem}>
                  <CurrencyIcon icon="rad" size={18} />
                  <Text style={styles.walletVal} numberOfLines={1}>
                    {formatBalance(walletBalances.radianite)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Wishlist Block */}
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/profile")}
              activeOpacity={0.8}
              style={styles.wishlistBlock}
            >
              <TabBarIcon name="heart" color={themeAccent.red} size={26} />
              <View style={styles.wishlistInfo}>
                <Text style={styles.wishlistTitle}>Wishlist</Text>
                <Text style={styles.wishlistSubtitle}>
                  {wishListSkins?.length || 0} Saved Skins
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 3: Live Store Bento Grid Block */}
          <View style={styles.bentoFullBlock}>
            <View style={styles.blockHeaderRow}>
              <View>
                <Text style={styles.bentoBlockLabel}>Console Rotation</Text>
                <Text style={styles.bentoBlockTitle}>Daily Offers</Text>
              </View>
              <View style={styles.blockTimer}>
                <TabBarIcon name="time-outline" color={colors.text} size={14} />
                <Text style={styles.blockTimerText}>{OffersTimeRemaining}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.miniCarousel}
            >
              {storeSkins.map((skin: any) => renderMiniSkinCard(skin))}
            </ScrollView>
          </View>

          {/* Night Market Block (if active) */}
          {nightMarket && nightMarket.Offers.length > 0 && (
            <View style={styles.bentoFullBlock}>
              <View style={[styles.blockHeaderRow, { marginBottom: 12 }]}>
                <View>
                  <Text style={[styles.bentoBlockLabel, { color: themeAccent.violet }]}>Special Event</Text>
                  <Text style={styles.bentoBlockTitle}>Night Market</Text>
                </View>
                <View style={[styles.blockTimer, { backgroundColor: themeAccent.violetSoft }]}>
                  <TabBarIcon name="time-outline" color={colors.text} size={14} />
                  <Text style={styles.blockTimerText}>{nightMarketTimeRemaining}</Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.miniCarousel}
              >
                {nightMarket.Offers.map((skin: any) =>
                  renderMiniSkinCard(skin, skin.TierColor || themeAccent.violetSoft)
                )}
              </ScrollView>
            </View>
          )}

          {/* Row 4: Featured Bundle Block */}
          {featuredBundle && featuredBundle.displayIcon && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedBundle(featuredBundle)}
              style={styles.bentoBundleBlock}
            >
              <Image
                source={{ uri: featuredBundle.displayIcon }}
                style={styles.bundleBgImage}
                blurRadius={3}
              />
              <LinearGradient
                colors={[
                  "rgba(9,10,12,0.1)",
                  "rgba(9,10,12,0.85)"
                ]}
                style={styles.bundleOverlay}
              />

              <View style={styles.bundleContentRow}>
                <View style={styles.bundleHeaderBlock}>
                  <Text style={styles.bundleLabel}>Featured Collection</Text>
                  <Text style={styles.bundleName} numberOfLines={1}>
                    {featuredBundle.displayName}
                  </Text>
                </View>

                <View style={styles.bundlePriceChip}>
                  <CurrencyIcon icon="vp" size={15} />
                  <Text style={styles.bundlePriceText}>{featuredBundle.bundlePrice}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Row 5: Accessories Block */}
          <View style={styles.bentoFullBlock}>
            <View style={[styles.blockHeaderRow, { marginBottom: 12 }]}>
              <View>
                <Text style={styles.bentoBlockLabel}>Extras</Text>
                <Text style={styles.bentoBlockTitle}>Accessory Offers</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.miniCarousel}
            >
              {accessoryStoreOffers &&
                accessoryStoreOffers.map((accessory: any) => (
                  <TouchableOpacity
                    key={accessory.uuid}
                    activeOpacity={0.8}
                    onPress={() => setSelectedAccessory(accessory)}
                    style={styles.miniAccessoryCard}
                  >
                    <View style={styles.miniCardTop}>
                      <View style={styles.miniPriceWrap}>
                        <CurrencyIcon icon="kdc" size={13} />
                        <Text style={styles.miniPriceText}>{accessory.Cost}</Text>
                      </View>
                    </View>

                    {accessory.displayIcon && (
                      <Image
                        source={{ uri: accessory.displayIcon }}
                        style={styles.miniAccessoryImage}
                      />
                    )}
                    <Text style={styles.miniAccessoryName} numberOfLines={1}>
                      {accessory.displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={themeAccent.gold} />
          <Text style={styles.loadingText}>Loading Console Hub</Text>
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

function createStyles(colors: any, accent: any, theme: string) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 60,
      gap: 16,
    },
    bentoProfileCard: {
      width: "100%",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: "hidden",
      backgroundColor: colors.glass,
      padding: 16,
    },
    profileBackdropArt: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      opacity: 0.28,
      resizeMode: "cover",
    },
    profileBackdropTint: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
    },
    profileMainRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatarWrap: {
      width: 58,
      height: 58,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      backgroundColor: colors.surface,
    },
    avatarImg: {
      width: "100%",
      height: "100%",
    },
    profileInfo: {
      flex: 1,
    },
    profileAgentLabel: {
      fontFamily: "Rubik700",
      fontSize: 10,
      color: accent.gold,
      letterSpacing: 0.5,
    },
    profileName: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 20,
    },
    profileTag: {
      color: colors.muted,
      fontFamily: "Rubik500",
      fontSize: 13,
    },
    profileRankBadge: {
      width: 48,
      height: 48,
      resizeMode: "contain",
    },
    profileDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    profileProgressRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    profileProgressLabel: {
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 13,
      minWidth: 80,
    },
    progressContainer: {
      flex: 1,
    },
    bentoRow: {
      flexDirection: "row",
      gap: 16,
      width: "100%",
    },
    walletBlock: {
      flex: 1.2,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: "hidden",
      backgroundColor: colors.glass,
      padding: 12,
      minHeight: 104,
      justifyContent: "space-between",
    },
    bentoBlockLabel: {
      fontFamily: "Rubik700",
      fontSize: 11,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    walletItems: {
      gap: 6,
    },
    walletItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    walletVal: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 15,
    },
    wishlistBlock: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: "hidden",
      backgroundColor: colors.glass,
      padding: 12,
      minHeight: 104,
      justifyContent: "space-between",
    },
    wishlistInfo: {
      gap: 2,
    },
    wishlistTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 16,
    },
    wishlistSubtitle: {
      color: colors.muted,
      fontFamily: "Rubik500",
      fontSize: 11,
    },
    bentoFullBlock: {
      width: "100%",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: "hidden",
      backgroundColor: colors.glass,
      padding: 14,
      gap: 12,
    },
    blockHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    bentoBlockTitle: {
      fontFamily: "Rubik800",
      fontSize: 20,
      color: colors.text,
    },
    blockTimer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.surfaceStrong,
      borderWidth: 1,
      borderColor: colors.border,
    },
    blockTimerText: {
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 11,
    },
    miniCarousel: {
      gap: 10,
      paddingRight: 10,
    },
    miniSkinCard: {
      width: 142,
      height: 148,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      justifyContent: "space-between",
    },
    cardGradient: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.38,
    },
    miniCardTop: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    miniPriceWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: "rgba(0,0,0,0.18)",
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    miniPriceText: {
      fontFamily: "Rubik700",
      fontSize: 10,
      color: colors.text,
    },
    miniSkinImage: {
      width: "100%",
      height: "46%",
      resizeMode: "contain",
      alignSelf: "center",
    },
    miniSkinName: {
      fontFamily: "Rubik700",
      color: colors.text,
      fontSize: 11,
      textAlign: "center",
    },
    bentoBundleBlock: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.backgroundAlt,
    },
    bundleBgImage: {
      position: "absolute",
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    bundleOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    bundleContentRow: {
      position: "absolute",
      left: 14,
      right: 14,
      bottom: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 12,
    },
    bundleHeaderBlock: {
      flex: 1,
    },
    bundleLabel: {
      fontFamily: "Rubik700",
      fontSize: 10,
      color: accent.gold,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    bundleName: {
      fontFamily: "Rubik800",
      fontSize: 22,
      color: colors.text,
    },
    bundlePriceChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(0,0,0,0.48)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    bundlePriceText: {
      fontFamily: "Rubik800",
      fontSize: 13,
      color: colors.text,
    },
    miniAccessoryCard: {
      width: 112,
      height: 148,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 10,
      justifyContent: "space-between",
      alignItems: "center",
      overflow: "hidden",
    },
    miniAccessoryImage: {
      width: "80%",
      height: "50%",
      resizeMode: "contain",
    },
    miniAccessoryName: {
      fontFamily: "Rubik700",
      fontSize: 10,
      color: colors.text,
      textAlign: "center",
      width: "100%",
    },
    loadingWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    loadingText: {
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 18,
    },
  });
}
