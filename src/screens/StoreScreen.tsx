import { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableHighlight,
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
    let inWishlist = await isInWishList(skin);
    setInWishlist(inWishlist);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
      >
        {AccessToken && storeSkins && featuredBundle ? (
          <ScrollView
            ref={scrollViewRef}
            style={styles.innerScrollView}
          >
            {nightMarket && nightMarket.Offers.length > 0 && (
              <View style={styles.nightMarketContainer}>
                <Text style={styles.nightMarketTitle}>
                  NIGHT MARKET IS ARRIVED! 🌙
                </Text>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerTextContainer}>
                    <Text style={styles.dividerText}>NIGHT MARKET</Text>
                    <Text style={styles.dividerPipe}> | </Text>
                    <Text style={styles.dividerHighlight}>
                      {nightMarketTimeRemaining}
                    </Text>
                  </View>
                  <View style={styles.dividerLine} />
                </View>
                <View style={styles.skinList}>
                  {nightMarket.Offers.map((skin: any) => (
                    <TouchableHighlight
                      key={skin.uuid}
                      activeOpacity={0.25}
                      underlayColor={Colors.dark.cardPress}
                      onPress={() => showSkinPanel(true, skin.levels[0].uuid)}
                      style={styles.skinItemTouch}
                    >
                      <View style={{ width: "100%" }}>
                        <LinearGradient
                          colors={["rgba(0,0,0,0.1)", skin.TierColor]}
                          style={styles.gradientOverlay}
                        />
                        <View style={styles.skinItemContent}>
                          <View style={styles.costContainer}>
                            <CurrencyIcon icon="vp" size={22} />
                            <Text style={styles.costText}>{skin.Cost}</Text>
                          </View>

                          <View style={styles.imageContainer}>
                            <Image
                              source={{
                                uri:
                                  skin.levels[0].displayIcon ||
                                  skin.displayIcon,
                              }}
                              style={styles.skinImage}
                            />
                          </View>

                          <Text style={styles.skinNameText}>
                            {skin.displayName}
                          </Text>
                        </View>
                      </View>
                    </TouchableHighlight>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.bundleContainer}>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerTextContainer}>
                  <Text style={styles.dividerText}>FEATURED BUNDLE</Text>
                </View>
                <View style={styles.dividerLine} />
              </View>
              {featuredBundle && featuredBundle.displayIcon && (
                <TouchableHighlight
                  activeOpacity={0.25}
                  underlayColor={Colors.dark.card}
                  onPress={() => {
                    setSelectedBundle(featuredBundle);
                  }}
                  style={styles.bundleTouch}
                >
                  <View>
                    <Image
                      source={{ uri: featuredBundle.displayIcon }}
                      style={styles.bundleImage}
                    />
                    <LinearGradient
                      colors={[
                        "rgba(0,0,0,0.6)",
                        "rgba(0,0,0,0.5)",
                        "transparent",
                      ]}
                      style={styles.bundleGradient}
                    />
                    <View style={styles.bundleContent}>
                      <View style={{ flexDirection: "column" }}>
                        <View style={styles.bundleTextContainer}>
                          <Text style={styles.bundleHeaderText}>FEATURED</Text>
                          <Text style={styles.dividerPipe}> | </Text>
                          <Text style={styles.dividerHighlight}>
                            {featuredBundle.timeRemaining &&
                              featuredBundleTimeRemaining}
                          </Text>
                        </View>
                        <Text style={styles.bundleNameText}>
                          {featuredBundle.displayName}
                        </Text>
                        <Text style={styles.bundleHeaderText}>COLLECTION</Text>
                      </View>
                      <View style={styles.bundlePriceContainer}>
                        <View style={styles.bundlePriceInner}>
                          <CurrencyIcon size={28} icon="vp" />
                          <Text style={styles.bundlePriceText}>
                            {featuredBundle.bundlePrice}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
              )}
            </View>

            <View style={styles.offersContainer}>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerTextContainer}>
                  <Text style={styles.dividerText}>OFFERS</Text>
                  <Text style={styles.dividerPipe}> | </Text>
                  <Text style={styles.dividerHighlight}>
                    {OffersTimeRemaining}
                  </Text>
                </View>
                <View style={styles.dividerLine} />
              </View>
              <View style={styles.skinList}>
                {storeSkins.map((skin: any) => (
                  <TouchableHighlight
                    key={skin.uuid}
                    activeOpacity={0.25}
                    underlayColor={Colors.dark.cardPress}
                    onPress={() => showSkinPanel(true, skin.levels[0].uuid)}
                    style={styles.skinItemTouch}
                  >
                    <View style={{ width: "100%" }}>
                      <LinearGradient
                        colors={["rgba(0,0,0,0.1)", skin.TierColor]}
                        style={styles.gradientOverlay}
                      />
                      <View style={styles.skinItemContent}>
                        <View style={styles.costContainer}>
                          <CurrencyIcon icon="vp" size={22} />
                          <Text style={styles.costText}>{skin.Cost}</Text>
                        </View>

                        <View style={styles.imageContainer}>
                          <Image
                            source={{
                              uri:
                                skin.levels[0].displayIcon || skin.displayIcon,
                            }}
                            style={styles.skinImage}
                          />
                        </View>

                        <Text style={styles.skinNameText}>
                          {skin.displayName}
                        </Text>
                      </View>
                    </View>
                  </TouchableHighlight>
                ))}
              </View>
            </View>

            <View style={{ alignItems: "center" }}>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerTextContainer}>
                  <Text style={styles.dividerText}>ACCESSORY STORE</Text>
                  <Text style={styles.dividerPipe}> | </Text>
                  <Text style={styles.dividerHighlight}>
                    {OffersTimeRemaining}
                  </Text>
                </View>
                <View style={styles.dividerLine} />
              </View>
              <View style={styles.accessoryList}>
                {accessoryStoreOffers &&
                  accessoryStoreOffers.map((accessory: any) => (
                    <TouchableHighlight
                      key={accessory.uuid}
                      activeOpacity={0.25}
                      underlayColor={Colors.dark.cardPress}
                      onPress={() => setSelectedAccessory(accessory)}
                      style={styles.accessoryTouch}
                    >
                      <View style={{ width: "100%" }}>
                        <LinearGradient
                          colors={["rgba(0,0,0,0.15)", Colors.dark.cardPress]}
                          style={styles.gradientOverlay}
                        />
                        <View style={styles.accessoryContent}>
                          <View style={styles.accessoryHeader}>
                            <Text style={styles.accessoryType}>
                              {accessory.itemType}
                            </Text>
                            <View style={styles.accessoryCostContainer}>
                              <CurrencyIcon icon="kdc" size={20} />
                              <Text style={styles.accessoryCost}>
                                {accessory.Cost}
                              </Text>
                            </View>
                          </View>

                          {accessory.displayIcon ? (
                            <View style={styles.accessoryImageContainer}>
                              <Image
                                source={{ uri: accessory.displayIcon }}
                                style={{
                                  width: "65%",
                                  resizeMode: "contain",
                                  aspectRatio:
                                    accessory.itemType === "Player Card"
                                      ? 3 / 4
                                      : 1,
                                  height:
                                    accessory.itemType === "Player Card"
                                      ? 180
                                      : 100,
                                }}
                              />
                            </View>
                          ) : (
                            <View style={styles.accessoryTextPlaceholder}>
                              <Text style={styles.accessoryTitlePlaceholder}>
                                "{accessory.displayName}"
                              </Text>
                            </View>
                          )}

                          <Text style={styles.accessoryName}>
                            {accessory.displayName}
                          </Text>
                        </View>
                      </View>
                    </TouchableHighlight>
                  ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={{ justifyContent: "center", alignItems: "center", gap: 10 }}>
            <Text style={styles.loadingContainer}>Loading...</Text>
            <ActivityIndicator size="large" color={Colors.accent.color} />
          </View>
        )}
      </ScrollView>
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
    flexGrow: 1,
    width: "100%",
    backgroundColor: "#252525",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  innerScrollView: {
    width: "100%",
    marginBottom: 25,
    marginTop: 15,
  },
  nightMarketContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  nightMarketTitle: {
    textAlign: "center",
    marginHorizontal: 8,
    marginVertical: 5,
    fontFamily: "Rubik700",
    color: "#9b55ff",
    fontSize: 30,
    marginBottom: 22,
  },
  dividerContainer: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    marginBottom: 15,
  },
  dividerLine: {
    borderColor: Colors.dark.cardPress,
    borderBottomWidth: 1.5,
    width: "100%",
  },
  dividerTextContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
  },
  dividerText: {
    fontFamily: "Rubik400",
    color: Colors.dark.text,
    fontSize: 16,
    textTransform: "uppercase",
  },
  dividerPipe: {
    fontFamily: "Rubik700",
    color: "white",
    fontSize: 13,
    textTransform: "uppercase",
  },
  dividerHighlight: {
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
    textShadowColor: "black",
    fontFamily: "Rubik500",
    color: Colors.text.highlighted,
    fontSize: 17,
    textTransform: "uppercase",
  },
  skinList: {
    alignItems: "center",
    gap: 25,
    width: "100%",
  },
  skinItemTouch: {
    borderWidth: 1,
    borderColor: Colors.dark.cardPress,
    width: "90%",
    borderRadius: 2,
  },
  gradientOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  skinItemContent: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
    padding: 8,
  },
  costContainer: {
    paddingHorizontal: 5,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 5,
  },
  costText: {
    fontFamily: "Rubik400",
    color: Colors.dark.text,
    fontSize: 20,
  },
  imageContainer: {
    width: "100%",
    marginVertical: "-6%",
    alignItems: "center",
  },
  skinImage: {
    width: "80%",
    resizeMode: "contain",
    aspectRatio: 16 / 9,
  },
  skinNameText: {
    fontFamily: "Rubik500",
    color: "white",
    fontSize: 20,
    fontWeight: "500",
    textAlign: "left",
    textTransform: "uppercase",
  },
  bundleContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  bundleTouch: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardPress,
    width: "90%",
    borderRadius: 2,
  },
  bundleImage: {
    position: "absolute",
    width: "100%",
    resizeMode: "contain",
    aspectRatio: 16 / 9,
  },
  bundleGradient: {
    width: "100%",
    height: "100%",
    position: "absolute",
    aspectRatio: 16 / 9,
  },
  bundleContent: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    aspectRatio: 16 / 9,
    padding: 12,
  },
  bundleTextContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  bundleHeaderText: {
    fontFamily: "Rubik400",
    color: "white",
    fontSize: 16,
    textTransform: "uppercase",
  },
  bundleNameText: {
    fontFamily: "Rubik800",
    color: "white",
    fontSize: 30,
    textAlign: "left",
    textTransform: "uppercase",
    marginVertical: -10,
  },
  bundlePriceContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    width: "100%",
  },
  bundlePriceInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bundlePriceText: {
    fontFamily: "Rubik500",
    color: "white",
    fontSize: 23,
    textTransform: "uppercase",
  },
  offersContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  accessoryList: {
    alignItems: "center",
    gap: 20,
    width: "100%",
    marginTop: 10,
  },
  accessoryTouch: {
    borderWidth: 1,
    borderColor: Colors.dark.cardPress,
    width: "90%",
    borderRadius: 2,
  },
  accessoryContent: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
    padding: 12,
  },
  accessoryHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accessoryType: {
    fontFamily: "Rubik400",
    color: Colors.dark.text,
    fontSize: 14,
    textTransform: "uppercase",
  },
  accessoryCostContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  accessoryCost: {
    fontFamily: "Rubik400",
    color: Colors.dark.text,
    fontSize: 18,
  },
  accessoryImageContainer: {
    width: "100%",
    marginVertical: 10,
    alignItems: "center",
  },
  accessoryTextPlaceholder: {
    width: "100%",
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  accessoryTitlePlaceholder: {
    fontFamily: "Rubik700",
    color: Colors.text.highlighted,
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
  },
  accessoryName: {
    fontFamily: "Rubik500",
    color: "white",
    fontSize: 18,
    textAlign: "left",
    textTransform: "uppercase",
    marginTop: 5,
  },
  loadingContainer: {
    fontFamily: "Rubik600",
    color: Colors.accent.color,
    fontSize: 26,
    textAlign: "center",
  },
});
