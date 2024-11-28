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
import { isInWishList, wishListSkins } from "../API/valorant-api";
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

export default function Profile() {
  const [showWishlist, setShowWishlist] = useState<boolean | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [notificationsEnabledF, setNotificationsEnabledF] = useState(true);
  const navigation = useNavigation(); // Acceso al objeto de navegación
  const [PlayerName, SetPlayerName] = useState<string | null>("Player-Name");

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setShowWishlist(false);
      setSelectedSkin(null);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const getPlayerName = async () => {
      const PlayerName: string | null = await AsyncStorage.getItem(
        "PlayerName"
      );
      SetPlayerName(PlayerName);
    };
    getPlayerName();
  }, []);

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
        padding: 20,
        gap: 30,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.dark.card,
          borderRadius: 2,
          padding: 20,
          width: "100%",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <View>
          <View
            style={{
              flexDirection: "column",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              marginBottom: 30,
            }}
          >
            <TabBarIcon
              name="person-circle"
              size={75}
              color={Colors.accent.color}
            ></TabBarIcon>
            <Text
              style={{
                color: Colors.accent.highlighted,
                fontSize: 25,
                fontFamily: "Rubik500",
                textAlign: "center",
              }}
            >
              {PlayerName}
            </Text>
          </View>
          <ScrollView style={{ width: "100%" }}>
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                flexDirection: "column",
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
                  borderRadius: 50,
                  padding: 6,
                  width: "85%",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 6,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      color: Colors.accent.red,
                      fontFamily: "Rubik500",
                    }}
                  >
                    Skins Wishlist
                  </Text>
                  <TabBarIcon
                    name="heart"
                    color={Colors.accent.red}
                    size={30}
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
              fontSize: 25,
              textAlign: "center",
              width: "100%",
              fontFamily: "Rubik500",
              color: Colors.dark.text,
              backgroundColor: Colors.accent.red,
              padding: 4,
              borderRadius: 2,
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
                    borderRadius: 10,
                    width: "90%",
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
                      padding: 15,
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
    </View>
  );
}
