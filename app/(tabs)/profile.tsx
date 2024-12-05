import {
  TouchableHighlight,
  View,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { accountLogout } from "../index";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import {
  GameName,
  isInWishList,
  PlayerCard,
  PlayerLoadout,
  TagLine,
  wishListSkins,
} from "../API/valorant-api";
import { Switch } from "react-native-switch";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  notificationsEnabled,
  pushNotification,
  setNotificationsEnabled,
} from "../API/notifications-api";
import { useNavigation } from "@react-navigation/native";
import { SkinPreview } from "@/components/SkinPreview";
import { MatchHistory } from "@/components/MatchHistory";

export default function Profile() {
  const [showWishlist, setShowWishlist] = useState<boolean | null>(null);
  const [showMatchHistory, setShowMatchHistory] = useState<any | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [notificationsEnabledF, setNotificationsEnabledF] = useState(true);
  const navigation = useNavigation(); // Acceso al objeto de navegación

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setShowWishlist(false);
      setSelectedSkin(null);
      setShowMatchHistory(false);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setNotificationsEnabledF(notificationsEnabled);
  }, []);

  const toggleNotifications = async () => {
    const newStatus: any = !notificationsEnabled;
    setNotificationsEnabled(newStatus);
    setNotificationsEnabledF(newStatus);
    await AsyncStorage.setItem("Notify", JSON.stringify(newStatus));

    if (newStatus) {
      pushNotification("Notifications enabled! 🔔", undefined, null);
    } else {
    }

    console.log(newStatus);
  };

  const handleWishlist = () => {
    if (showWishlist) {
      setShowWishlist(false);
    } else {
      setShowWishlist(true);
    }
  };

  const handleMatchHistory = () => {
    if (showMatchHistory) {
      setShowMatchHistory(false);
    } else {
      setShowMatchHistory(true);
    }
  };

  const handleSkinPress = async (skin: any) => {
    setSelectedSkin(skin);
    const lastLevel: any = Object.keys(skin.levels).sort().reverse()[0];
    setVideoPreview(skin.levels[lastLevel].streamedVideo);
  };

  const handleWishlistPress = async (skin: any) => {
    let inWishlist = await isInWishList(skin);
    setInWishlist(inWishlist);
  };

  return (
    <View
      style={{
        backgroundColor: Colors.dark.background,
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        gap: 30,
      }}
    >
      <View
        style={{
          filter: "blur(10px)",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 0,
          position: "absolute",
          opacity: 0.25,
          margin: 10,
        }}
      >
        <Image
          source={{ uri: PlayerCard.largeArt }}
          style={{
            width: "100%",
            height: "100%",
          }}
        ></Image>
      </View>

      <View
        style={{
          backgroundColor: Colors.dark.card,
          borderWidth: 1,
          borderColor: Colors.dark.cardPress,
          borderRadius: 2,
          padding: 20,
          width: "100%",
          height: "100%",
          justifyContent: "space-between",
          zIndex: 1,
        }}
      >
        <View style={{ justifyContent: "flex-start", alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
              marginBottom: 30,
              backgroundColor: Colors.dark.background,
              padding: 10,
              height: 80,
              borderWidth: 1,
              borderColor: Colors.dark.cardPress,
            }}
          >
            <View
              style={{
                aspectRatio: 4 / 4,
                height: "100%",
                overflow: "hidden",
                borderRadius: 2,
                borderWidth: 1,
                borderColor: Colors.dark.cardPress,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: PlayerCard.displayIcon }}
                style={{ width: "100%", height: "100%" }}
              ></Image>
            </View>
            {GameName && TagLine && (
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  height: "100%",
                }}
              >
                <Text
                  style={{
                    color: Colors.text.highlighted,
                    fontSize: 24,
                    fontFamily: "Rubik500",
                    textAlign: "center",
                    padding: 0,
                    marginBlock: -5,
                  }}
                >
                  {GameName}
                </Text>
                <Text
                  style={{
                    color: Colors.text.active,
                    fontSize: 20,
                    fontFamily: "Rubik500",
                    textAlign: "center",
                    padding: 0,
                    marginBlock: -5,
                  }}
                >
                  #{TagLine}
                </Text>
              </View>
            )}
          </View>
          <ScrollView style={{ width: "100%" }}>
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                flexDirection: "column",
                gap: 15,
              }}
            >
              <TouchableHighlight
                onPress={handleWishlist}
                activeOpacity={0.25}
                underlayColor={Colors.accent.darkRed}
                style={{
                  backgroundColor: Colors.accent.ultraDarkRed,
                  borderWidth: 1,
                  borderColor: Colors.accent.red,
                  borderRadius: 2,
                  padding: 6,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 15,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: Colors.accent.red,
                      fontFamily: "Rubik500",
                    }}
                  >
                    Skins Wishlist
                  </Text>
                  <TabBarIcon
                    name="heart"
                    color={Colors.accent.red}
                    size={28}
                    style={{ justifyContent: "center", alignItems: "center" }}
                  ></TabBarIcon>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                onPress={handleMatchHistory}
                activeOpacity={0.25}
                underlayColor={Colors.dark.cardPress}
                style={{
                  backgroundColor: Colors.dark.tabBar,
                  borderWidth: 1,
                  borderColor: Colors.accent.color,
                  borderRadius: 2,
                  padding: 6,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 15,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: Colors.accent.color,
                      fontFamily: "Rubik500",
                    }}
                  >
                    Match History
                  </Text>
                  <TabBarIcon
                    name="time"
                    color={Colors.accent.color}
                    size={28}
                    style={{ justifyContent: "center", alignItems: "center" }}
                  ></TabBarIcon>
                </View>
              </TouchableHighlight>
            </View>
          </ScrollView>
        </View>
        <View>
          <Text
            onPress={accountLogout}
            style={{
              fontSize: 20,
              textAlign: "center",
              width: "100%",
              fontFamily: "Rubik500",
              color: Colors.dark.text,
              backgroundColor: Colors.accent.red,
              padding: 6,
              borderRadius: 2,
              borderWidth: 1,
              borderColor: Colors.accent.ultraDarkRed,
            }}
          >
            Log Out
          </Text>
        </View>
      </View>
      {showWishlist && (
        <View
          style={{
            backgroundColor: Colors.dark.background,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <View
            style={{
              width: "100%",
              marginBottom: 15,
              backgroundColor: Colors.dark.tabBar,
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0px 10px 15px 0px rgba(0,0,0,0.25)",
            }}
          >
            <Text
              style={{
                fontFamily: "Rubik500",
                color: Colors.dark.text,
                fontSize: 30,
                marginTop: 15,
              }}
            >
              Your Wishlist
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 15,
                marginVertical: 15,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  fontFamily: "Rubik500",
                  color: Colors.dark.text,
                  fontSize: 22,
                }}
              >
                Notifications
              </Text>
              <Switch
                backgroundActive={Colors.accent.color}
                backgroundInactive={Colors.dark.tabBar}
                circleActiveColor={Colors.accent.highlighted}
                circleInActiveColor="#f4f3f4"
                circleBorderWidth={2}
                circleBorderActiveColor={Colors.accent.color}
                circleBorderInactiveColor={Colors.dark.tabBar}
                onValueChange={toggleNotifications}
                value={notificationsEnabledF}
                activeText=""
                inActiveText=""
                barHeight={28}
                circleSize={28}
              />
              <MaterialIcons
                name={
                  notificationsEnabledF
                    ? "notifications-on"
                    : "notifications-off"
                }
                size={28}
                color={notificationsEnabledF ? Colors.accent.color : "#f4f3f4"}
              />
            </View>
          </View>
          <FlatList
            data={wishListSkins}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <TouchableHighlight
                  key={item.uuid}
                  onPress={() => {
                    handleSkinPress(item);
                    handleWishlistPress(item);
                  }}
                  activeOpacity={0.25}
                  underlayColor={Colors.dark.cardPress}
                  style={{
                    backgroundColor: Colors.dark.card,
                    borderRadius: 2,
                    width: "90%",
                    borderWidth: 1,
                    borderColor: Colors.dark.cardPress,
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "nowrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      paddingBlock: 12,
                    }}
                  >
                    <Text
                      style={{
                        width: "60%",
                        fontFamily: "Rubik500",
                        color: "white",
                        fontSize: 20,
                        flexWrap: "wrap",
                      }}
                    >
                      {item.displayName}
                    </Text>
                    <Image
                      source={{
                        uri: item.levels[0].displayIcon || item.displayIcon,
                      }}
                      style={{
                        width: "40%",
                        resizeMode: "contain",
                        aspectRatio: 16 / 9,
                      }}
                    />
                  </View>
                </TouchableHighlight>
              </View>
            )}
            style={{ width: "100%", flex: 1, paddingTop: 10 }}
            ListEmptyComponent={() => (
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontFamily: "Rubik500",
                  textAlign: "center",
                }}
              >
                No skins in your wishlist add one in Skins Section.
              </Text>
            )}
          />

          <TouchableHighlight
            onPress={() => {
              handleWishlist();
            }}
            activeOpacity={0.25}
            underlayColor={Colors.accent.darkRed}
            style={{
              backgroundColor: Colors.accent.red,
              borderRadius: 2,
              padding: 10,
              width: "92%",
              marginVertical: 18,
            }}
          >
            <Text
              style={{
                fontFamily: "Rubik500",
                color: "white",
                fontSize: 20,
                textAlign: "center",
              }}
            >
              Close
            </Text>
          </TouchableHighlight>
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

      {showMatchHistory && (
        <MatchHistory setShowMatchHistory={setShowMatchHistory}></MatchHistory>
      )}
    </View>
  );
}
