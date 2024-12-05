import { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableHighlight,
  ActivityIndicator,
} from "react-native";
import React from "react";
import axios from "axios";
import {
  extraHeaders,
  featuredBundle,
  getSkin,
  isInWishList,
  parseShop,
  storeSkins,
  nightMarket,
  contentTiers,
  skins,
  AccessToken,
  Shard,
  PlayerUUID,
  EntitlementsToken,
} from "../API/valorant-api";
import { Colors } from "@/constants/Colors";
import CurrencyIcon from "@/components/CurrencyIcon";
import { LinearGradient } from "expo-linear-gradient";
import { SkinPreview } from "@/components/SkinPreview";
import { BundlePreview } from "@/components/BundlePreview";
import { useNavigation } from "@react-navigation/native";

export default function Store() {
  const [storeData, setStoreData] = useState<any>([]);
  const [featuredBundleData, setFeaturedBundleData] = useState<any>([]);
  const [OffersTimeRemaining, setOffersTimeRemaining] = useState("");
  const [featuredBundleTimeRemaining, setFeaturedBundleTimeRemaining] =
    useState("");
  const [nightMarketTimeRemaining, setNightMarketTimeRemaining] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [debugStoreData, setDebugStoreData] = useState<any>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setSelectedSkin(null);
      setSelectedBundle(null);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    });

    return unsubscribe;
  }, [navigation]);

  const fetchStoreData = async () => {
    try {
      const response = await axios.request({
        url: `https://pd.${Shard}.a.pvp.net/store/v3/storefront/${PlayerUUID}`,
        method: "POST",
        headers: {
          ...extraHeaders,
          "Content-Type": "application/json",
          Authorization: `Bearer ${AccessToken}`,
          "X-Riot-Entitlements-JWT": EntitlementsToken,
        },
        data: {},
      });

      await parseShop(response.data).then(() => {
        setStoreData(storeSkins);
        setFeaturedBundleData(featuredBundle);
      });

      // console.log(JSON.stringify(featuredBundle, null, 1));

      setDebugStoreData(nightMarket);
    } catch (error) {
      console.error("error fetching store data: " + error);
    }
  };

  const calculateFeaturedBundleTimeRemaining = async (
    initialSeconds: number
  ) => {
    if (initialSeconds <= 0) {
      try {
        await fetchStoreData().then(() => {
          return "00:00:00:00";
        });
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
        await fetchStoreData().then(() => {
          return "00:00:00:00";
        });
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
        await fetchStoreData().then(() => {
          return "00:00:00";
        });
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

  // CONSIGUE LOS TIEMPOS RESTANTES DE OFFERS Y FEATURED BUNDLE
  useEffect(() => {
    if (featuredBundleData.timeRemaining && storeData.OffersTimeRemaining) {
      if (nightMarket) {
        const initialSecondsNightMarket = nightMarket.TimeRemaining;
        let remainingSecondsNightMarket = initialSecondsNightMarket;

        const intervalNightMarket = setInterval(async () => {
          remainingSecondsNightMarket -= 1;
          await calculateNightMarketTimeRemaining(
            remainingSecondsNightMarket
          ).then((seconds) => {
            setNightMarketTimeRemaining(seconds);
          });
          if (remainingSecondsNightMarket <= 0) {
            clearInterval(intervalNightMarket);
          }
        }, 1000);

        return () => {
          clearInterval(intervalNightMarket);
        };
      }

      const initialSecondsBundle = featuredBundleData.timeRemaining;
      let remainingSecondsBundle = initialSecondsBundle;

      // const initialSecondsOffers = storeData.OffersTimeRemaining;
      const initialSecondsOffers = storeData.OffersTimeRemaining;
      let remainingSecondsOffers = initialSecondsOffers;

      const intervalBundle = setInterval(async () => {
        remainingSecondsBundle -= 1;
        await calculateFeaturedBundleTimeRemaining(remainingSecondsBundle).then(
          (seconds) => {
            setFeaturedBundleTimeRemaining(seconds);
          }
        );

        if (remainingSecondsBundle <= 0) {
          clearInterval(intervalBundle);
        }
      }, 1000);

      const intervalOffers = setInterval(async () => {
        remainingSecondsOffers -= 1;
        await calculateOffersTimeRemaining(remainingSecondsOffers).then(
          (seconds) => {
            setOffersTimeRemaining(seconds);
          }
        );
        if (remainingSecondsOffers <= 0) {
          clearInterval(intervalOffers);
        }
      }, 1000);

      return () => {
        clearInterval(intervalBundle);
        clearInterval(intervalOffers);
      };
    }
  }, [featuredBundleData, storeData]);

  useEffect(() => {
    const getAllData = async () => {
      try {
        if (AccessToken && PlayerUUID && EntitlementsToken) {
          fetchStoreData();
        }
      } catch (error) {
        console.error("Error checking login status", error);
      }
    };

    getAllData();
  }, [AccessToken, PlayerUUID, EntitlementsToken]);

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
    <View style={{ flexGrow: 1, width: "100%", backgroundColor: "#252525" }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        {/* <Text style={{ color: "white" }}>{JSON.stringify(Shard, null, 1)}</Text> */}

        {AccessToken &&
        storeData &&
        featuredBundleData &&
        storeSkins &&
        featuredBundle ? (
          <ScrollView
            ref={scrollViewRef}
            style={{ width: "100%", marginBottom: 25, marginTop: 15 }}
          >
            {nightMarket && (
              <View style={{ alignItems: "center", marginBottom: 40 }}>
                <Text
                  style={{
                    textAlign: "center",
                    marginHorizontal: 8,
                    marginVertical: 5,
                    fontFamily: "Rubik700",
                    color: "#9b55ff",
                    fontSize: 30,
                    marginBottom: 22,
                  }}
                >
                  NIGHT MARKET IS ARRIVED! 🌙
                </Text>
                <View
                  style={{
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "90%",
                    marginBottom: 15,
                  }}
                >
                  <View
                    style={{
                      borderColor: Colors.dark.cardPress,
                      borderBottomWidth: 1.5,
                      width: "100%",
                    }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      paddingHorizontal: 10,
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Rubik400",
                        color: Colors.dark.text,
                        fontSize: 16,
                        textAlign: "left",
                        textTransform: "uppercase",
                      }}
                    >
                      NIGHT MARKET
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Rubik700",
                        color: "white",
                        fontSize: 13,
                        textAlign: "left",
                        textTransform: "uppercase",
                      }}
                    >
                      {" "}
                      |{" "}
                    </Text>
                    <Text
                      style={{
                        textShadowRadius: 3,
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowColor: "black",
                        fontFamily: "Rubik500",
                        color: Colors.text.highlighted,
                        fontSize: 17,
                        textAlign: "left",
                        textTransform: "uppercase",
                      }}
                    >
                      {nightMarketTimeRemaining}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderColor: Colors.dark.cardPress,
                      borderBottomWidth: 1.5,
                      width: "100%",
                    }}
                  />
                </View>
                <View style={{ alignItems: "center", gap: 25 }}>
                  {nightMarket.Offers.map((skin: any) => (
                    <TouchableHighlight
                      key={skin.uuid}
                      activeOpacity={0.25}
                      underlayColor={Colors.dark.cardPress}
                      onPress={() => showSkinPanel(true, skin.levels[0].uuid)}
                      style={{
                        borderWidth: 1,
                        borderColor: Colors.dark.cardPress,
                        width: "90%",
                        borderRadius: 2,
                      }}
                    >
                      <>
                        <LinearGradient
                          colors={["rgba(0,0,0,0.1)", skin.TierColor]}
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                        <View
                          style={{
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            display: "flex",
                            flexDirection: "column",
                            padding: 8,
                          }}
                        >
                          <View
                            style={{
                              paddingHorizontal: 5,
                              width: "100%",
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <CurrencyIcon icon="vp" size={22} />
                            <Text
                              style={{
                                fontFamily: "Rubik400",
                                color: Colors.dark.text,
                                fontSize: 20,
                              }}
                            >
                              {skin.Cost}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: "100%",
                              marginVertical: "-6%",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              source={{
                                uri:
                                  skin.levels[0].displayIcon ||
                                  skin.displayIcon,
                              }}
                              style={{
                                width: "80%",
                                resizeMode: "contain",
                                aspectRatio: 16 / 9,
                              }}
                            />
                          </View>

                          <Text
                            style={{
                              fontFamily: "Rubik500",
                              color: "white",
                              fontSize: 20,
                              fontWeight: 500,
                              textAlign: "left",
                              textTransform: "uppercase",
                            }}
                          >
                            {skin.displayName}
                          </Text>
                        </View>
                      </>
                    </TouchableHighlight>
                  ))}
                </View>
              </View>
            )}

            <View style={{ alignItems: "center", marginBottom: 25 }}>
              <View
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "90%",
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    borderColor: Colors.dark.cardPress,
                    borderBottomWidth: 1.5,
                    width: "100%",
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: 10,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Rubik400",
                      color: Colors.dark.text,
                      fontSize: 18,
                    }}
                  >
                    FEATURED BUNDLE
                  </Text>
                </View>
                <View
                  style={{
                    borderColor: Colors.dark.cardPress,
                    borderBottomWidth: 1.5,
                    width: "100%",
                  }}
                />
              </View>
              {featuredBundleData && featuredBundleData.displayIcon && (
                <TouchableHighlight
                  activeOpacity={0.25}
                  underlayColor={Colors.dark.card}
                  onPress={() => {
                    setSelectedBundle(featuredBundleData);
                  }}
                  style={{
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: Colors.dark.cardPress,
                    width: "90%",
                    borderRadius: 2,
                  }}
                >
                  <View>
                    <Image
                      source={{ uri: featuredBundleData.displayIcon }}
                      style={{
                        position: "absolute",
                        width: "100%",
                        resizeMode: "contain",
                        aspectRatio: 16 / 9,
                      }}
                    />
                    <LinearGradient
                      colors={[
                        "rgba(0,0,0,0.6)",
                        "rgba(0,0,0,0.5)",
                        "transparent",
                      ]}
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        aspectRatio: 16 / 9,
                      }}
                    ></LinearGradient>
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        aspectRatio: 16 / 9,
                        padding: 12,
                      }}
                    >
                      <View style={{ flexDirection: "column" }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Rubik400",
                              color: "white",
                              fontSize: 16,
                              textAlign: "left",
                              textTransform: "uppercase",
                            }}
                          >
                            FEATURED
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Rubik300",
                              color: "white",
                              fontSize: 13,
                              textAlign: "left",
                              textTransform: "uppercase",
                            }}
                          >
                            {" "}
                            |{" "}
                          </Text>
                          <Text
                            style={{
                              textShadowRadius: 3,
                              textShadowOffset: { width: 0, height: 1 },
                              textShadowColor: "black",
                              fontFamily: "Rubik500",
                              color: Colors.text.highlighted,
                              fontSize: 17,
                              textAlign: "left",
                              textTransform: "uppercase",
                            }}
                          >
                            {featuredBundleData.timeRemaining &&
                              featuredBundleTimeRemaining}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontFamily: "Rubik800",
                            color: "white",
                            fontSize: 30,
                            textAlign: "left",
                            textTransform: "uppercase",
                            marginVertical: -10,
                          }}
                        >
                          {featuredBundleData.displayName}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Rubik400",
                            color: "white",
                            fontSize: 16,
                            textAlign: "left",
                            textTransform: "uppercase",
                          }}
                        >
                          COLLECTION
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-end",
                          width: "100%",
                          marginRight: 30,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <CurrencyIcon size={28} icon="vp"></CurrencyIcon>
                          <Text
                            style={{
                              fontFamily: "Rubik500",
                              color: "white",
                              fontSize: 23,
                              textAlign: "left",
                              textTransform: "uppercase",
                            }}
                          >
                            {featuredBundleData.bundlePrice}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
              )}
            </View>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "90%",
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    borderColor: Colors.dark.cardPress,
                    borderBottomWidth: 1.5,
                    width: "100%",
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: 10,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Rubik400",
                      color: Colors.dark.text,
                      fontSize: 18,
                    }}
                  >
                    OFFERS
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Rubik500",
                      color: "white",
                      fontSize: 15,
                    }}
                  >
                    {" "}
                    |{" "}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Rubik500",
                      color: Colors.text.highlighted,
                      fontSize: 18,
                    }}
                  >
                    {OffersTimeRemaining}
                  </Text>
                </View>
                <View
                  style={{
                    borderColor: Colors.dark.cardPress,
                    borderBottomWidth: 1.5,
                    width: "100%",
                  }}
                />
              </View>
              <View style={{ alignItems: "center", gap: 25 }}>
                {storeSkins.map((skin: any) => (
                  <TouchableHighlight
                    key={skin.uuid}
                    activeOpacity={0.25}
                    underlayColor={Colors.dark.cardPress}
                    onPress={() => showSkinPanel(true, skin.levels[0].uuid)}
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.dark.cardPress,
                      width: "90%",
                      borderRadius: 2,
                    }}
                  >
                    <>
                      <LinearGradient
                        colors={["rgba(0,0,0,0.1)", skin.TierColor]}
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                      <View
                        style={{
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          display: "flex",
                          flexDirection: "column",
                          padding: 8,
                        }}
                      >
                        <View
                          style={{
                            paddingHorizontal: 5,
                            width: "100%",
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <CurrencyIcon icon="vp" size={22} />
                          <Text
                            style={{
                              fontFamily: "Rubik400",
                              color: Colors.dark.text,
                              fontSize: 20,
                            }}
                          >
                            {skin.Cost}
                          </Text>
                        </View>

                        <View
                          style={{
                            width: "100%",
                            marginVertical: "-6%",
                            alignItems: "center",
                          }}
                        >
                          <Image
                            source={{
                              uri:
                                skin.levels[0].displayIcon || skin.displayIcon,
                            }}
                            style={{
                              width: "80%",
                              resizeMode: "contain",
                              aspectRatio: 16 / 9,
                            }}
                          />
                        </View>

                        <Text
                          style={{
                            fontFamily: "Rubik500",
                            color: "white",
                            fontSize: 20,
                            fontWeight: 500,
                            textAlign: "left",
                            textTransform: "uppercase",
                          }}
                        >
                          {skin.displayName}
                        </Text>
                      </View>
                    </>
                  </TouchableHighlight>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          <>
            <Text
              style={{
                fontFamily: "Rubik600",
                color: Colors.accent.color,
                fontSize: 26,
                textAlign: "center",
              }}
            >
              Loading...
            </Text>
            <ActivityIndicator size="large" color={Colors.accent.color} />
          </>
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
    </View>
  );
}
