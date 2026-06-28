import {
  TouchableHighlight,
  View,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { accountLogout } from "../../app/index";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import {
  getPlayerMMR,
  isInWishList,
  PlayerCard,
} from "../../API/valorant-api";
import { useShopStore } from "../../src/store/useShopStore";
import { useAuthStore } from "../../src/store/useAuthStore";
import { Switch } from "react-native-switch";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  notificationsEnabled,
  pushNotification,
  setNotificationsEnabled,
} from "../../API/notifications-api";
import { useNavigation } from "expo-router";
import { SkinPreview } from "@/components/SkinPreview";
import { MatchHistory } from "@/components/MatchHistory";

export default function ProfileScreen() {
  const [showWishlist, setShowWishlist] = useState<boolean | null>(null);
  const [showMatchHistory, setShowMatchHistory] = useState<any | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [notificationsEnabledF, setNotificationsEnabledF] = useState(true);
  const navigation = useNavigation();

  const PlayerMMR = useShopStore((state) => state.playerMMR);
  const GameName = useAuthStore((state) => state.gameName);
  const TagLine = useAuthStore((state) => state.tagline);
  const wishListSkins = useShopStore((state) => state.wishListSkins);

  useEffect(() => {
    const fetchPlayerMMR = async () => {
      await getPlayerMMR();
    };
    fetchPlayerMMR();
  }, []);

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
    }
  };

  const handleWishlist = () => {
    setShowWishlist(!showWishlist);
  };

  const handleMatchHistory = () => {
    setShowMatchHistory(!showMatchHistory);
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
    <View style={styles.container}>
      {PlayerCard?.largeArt && (
        <View style={styles.backgroundImageContainer}>
          <Image
            source={{ uri: PlayerCard.largeArt }}
            blurRadius={10}
            style={styles.backgroundImage}
          />
        </View>
      )}

      <View style={styles.cardContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: PlayerCard?.displayIcon }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.userTextContainer}>
              {GameName && TagLine && (
                <View style={styles.nameTagContainer}>
                  <Text style={styles.gameNameText}>{GameName}</Text>
                  <Text style={styles.taglineText}>#{TagLine}</Text>
                </View>
              )}

              {PlayerMMR?.Rank?.largeIcon && (
                <Image
                  style={styles.rankIcon}
                  source={{ uri: PlayerMMR.Rank.largeIcon }}
                />
              )}
            </View>
          </View>
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.menuList}>
              <TouchableHighlight
                onPress={handleWishlist}
                activeOpacity={0.25}
                underlayColor={Colors.accent.darkRed}
                style={styles.wishlistButton}
              >
                <View style={styles.menuInner}>
                  <Text style={styles.menuButtonText}>Skins Wishlist</Text>
                  <TabBarIcon
                    name="heart"
                    color={Colors.accent.red}
                    size={28}
                    style={{ justifyContent: "center", alignItems: "center" }}
                  />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                onPress={handleMatchHistory}
                activeOpacity={0.25}
                underlayColor={Colors.dark.cardPress}
                style={styles.careerButton}
              >
                <View style={styles.menuInner}>
                  <Text style={styles.careerText}>Career</Text>
                  <TabBarIcon
                    name="time"
                    color={Colors.accent.color}
                    size={28}
                    style={{ justifyContent: "center", alignItems: "center" }}
                  />
                </View>
              </TouchableHighlight>
            </View>
          </ScrollView>
        </View>
        <View>
          <Text
            onPress={accountLogout}
            style={styles.logoutText}
          >
            Log Out
          </Text>
        </View>
      </View>

      {showWishlist && (
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Wishlist</Text>
            <View style={styles.notificationRow}>
              <Text style={styles.notificationText}>Notifications</Text>
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
              <View style={styles.wishlistListItemContainer}>
                <TouchableHighlight
                  key={item.uuid}
                  onPress={() => {
                    handleSkinPress(item);
                    handleWishlistPress(item);
                  }}
                  activeOpacity={0.25}
                  underlayColor={Colors.dark.cardPress}
                  style={styles.wishlistListItemTouch}
                >
                  <View style={styles.wishlistListItemContent}>
                    <Text style={styles.wishlistListItemText}>
                      {item.displayName}
                    </Text>
                    <Image
                      source={{
                        uri: item.levels[0].displayIcon || item.displayIcon,
                      }}
                      style={styles.wishlistListItemImage}
                    />
                  </View>
                </TouchableHighlight>
              </View>
            )}
            style={styles.wishlistFlatList}
            ListEmptyComponent={() => (
              <Text style={styles.wishlistEmptyText}>
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
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
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
        <MatchHistory setShowMatchHistory={setShowMatchHistory} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
    flexGrow: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    gap: 30,
  },
  backgroundImageContainer: {
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 0,
    position: "absolute",
    opacity: 0.25,
    margin: 10,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  cardContainer: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.cardPress,
    borderRadius: 2,
    padding: 20,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    zIndex: 1,
  },
  profileHeader: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  userInfoContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    gap: 20,
    marginBottom: 30,
    backgroundColor: Colors.dark.background,
    padding: 10,
    height: 80,
    borderWidth: 1,
    borderColor: Colors.dark.cardPress,
  },
  avatarContainer: {
    aspectRatio: 4 / 4,
    height: "100%",
    overflow: "hidden",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.dark.cardPress,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
  },
  nameTagContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    height: "100%",
  },
  gameNameText: {
    color: Colors.text.highlighted,
    fontSize: 24,
    fontFamily: "Rubik500",
    textAlign: "center",
    padding: 0,
    marginVertical: -5,
  },
  taglineText: {
    color: Colors.text.active,
    fontSize: 20,
    fontFamily: "Rubik500",
    textAlign: "center",
    padding: 0,
    marginVertical: -5,
  },
  rankIcon: {
    aspectRatio: 1 / 1,
    height: "90%",
  },
  scrollContainer: {
    width: "100%",
  },
  menuList: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    flexDirection: "column",
    gap: 15,
  },
  wishlistButton: {
    backgroundColor: Colors.accent.ultraDarkRed,
    borderWidth: 1,
    borderColor: Colors.accent.red,
    borderRadius: 2,
    padding: 8,
    width: "100%",
  },
  menuButtonText: {
    fontSize: 20,
    color: Colors.accent.red,
    fontFamily: "Rubik500",
  },
  menuInner: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  careerButton: {
    backgroundColor: Colors.dark.tabBar,
    borderWidth: 1,
    borderColor: Colors.accent.color,
    borderRadius: 2,
    padding: 8,
    width: "100%",
  },
  careerText: {
    fontSize: 20,
    color: Colors.accent.color,
    fontFamily: "Rubik500",
  },
  logoutText: {
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
  },
  modalContainer: {
    backgroundColor: Colors.dark.background,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalHeader: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: Colors.dark.tabBar,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Rubik500",
    color: Colors.dark.text,
    fontSize: 30,
    marginTop: 15,
  },
  notificationRow: {
    flexDirection: "row",
    gap: 15,
    marginVertical: 15,
    alignItems: "center",
  },
  notificationText: {
    fontFamily: "Rubik500",
    color: Colors.dark.text,
    fontSize: 22,
  },
  wishlistListItemContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  wishlistListItemTouch: {
    backgroundColor: Colors.dark.card,
    borderRadius: 2,
    width: "90%",
    borderWidth: 1,
    borderColor: Colors.dark.cardPress,
  },
  wishlistListItemContent: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  wishlistListItemText: {
    width: "60%",
    fontFamily: "Rubik500",
    color: "white",
    fontSize: 20,
    flexWrap: "wrap",
  },
  wishlistListItemImage: {
    width: "40%",
    resizeMode: "contain",
    aspectRatio: 16 / 9,
  },
  wishlistFlatList: {
    width: "100%",
    flex: 1,
    paddingTop: 10,
  },
  wishlistEmptyText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Rubik500",
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: Colors.accent.red,
    borderRadius: 2,
    padding: 10,
    width: "92%",
    marginVertical: 18,
  },
  modalCloseButtonText: {
    fontFamily: "Rubik500",
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
});
