import {
  TouchableOpacity,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  notificationsEnabled,
  pushNotification,
  setNotificationsEnabled,
} from "../../API/notifications-api";
import { useNavigation } from "expo-router";
import { SkinPreview } from "@/components/SkinPreview";
import { MatchHistory } from "@/components/MatchHistory";
import { LinearGradient } from "expo-linear-gradient";

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
      pushNotification("Notifications enabled!", undefined, null);
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
    const wishlisted = await isInWishList(skin);
    setInWishlist(wishlisted);
  };

  return (
    <View style={styles.container}>
      {PlayerCard?.largeArt && (
        <Image
          source={{ uri: PlayerCard.largeArt }}
          blurRadius={18}
          style={styles.backgroundImage}
        />
      )}
      <LinearGradient
        colors={["rgba(16,17,20,0.68)", Colors.dark.background]}
        style={styles.backgroundFade}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: PlayerCard?.displayIcon }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.eyebrow}>Riot Account</Text>
              {GameName && TagLine && (
                <>
                  <Text style={styles.gameNameText} numberOfLines={1}>
                    {GameName}
                  </Text>
                  <Text style={styles.taglineText}>#{TagLine}</Text>
                </>
              )}
            </View>
            {PlayerMMR?.Rank?.largeIcon && (
              <Image
                style={styles.rankIcon}
                source={{ uri: PlayerMMR.Rank.largeIcon }}
              />
            )}
          </View>

          <View style={styles.quickStats}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Wishlist</Text>
              <Text style={styles.statValue}>{wishListSkins?.length || 0}</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Rank</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {PlayerMMR?.Rank?.tierName || "Unrated"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity
            onPress={handleWishlist}
            activeOpacity={0.76}
            style={styles.actionRow}
          >
            <View style={[styles.actionIcon, styles.heartIcon]}>
              <TabBarIcon name="heart" color={Colors.accent.red} size={22} />
            </View>
            <View style={styles.actionTextBlock}>
              <Text style={styles.actionTitle}>Skins Wishlist</Text>
              <Text style={styles.actionSubtitle}>Saved skins and notifications</Text>
            </View>
            <TabBarIcon name="chevron-forward" color={Colors.dark.subtle} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMatchHistory}
            activeOpacity={0.76}
            style={styles.actionRow}
          >
            <View style={[styles.actionIcon, styles.careerIcon]}>
              <TabBarIcon name="time" color={Colors.accent.blue} size={22} />
            </View>
            <View style={styles.actionTextBlock}>
              <Text style={styles.actionTitle}>Career</Text>
              <Text style={styles.actionSubtitle}>Competitive match history</Text>
            </View>
            <TabBarIcon name="chevron-forward" color={Colors.dark.subtle} size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={accountLogout}
          activeOpacity={0.76}
          style={styles.logoutButton}
        >
          <TabBarIcon name="log-out-outline" color={Colors.accent.red} size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {showWishlist && (
        <View style={styles.modalContainer}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>Saved</Text>
                <Text style={styles.modalTitle}>Your Wishlist</Text>
              </View>
              <TouchableOpacity
                onPress={handleWishlist}
                style={styles.iconButton}
                activeOpacity={0.72}
              >
                <TabBarIcon name="close" color={Colors.dark.text} size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.notificationRow}>
              <View style={styles.notificationTextBlock}>
                <Text style={styles.notificationText}>Notifications</Text>
                <Text style={styles.notificationHint}>Alerts for your saved skins</Text>
              </View>
              <Switch
                backgroundActive={Colors.accent.blue}
                backgroundInactive={Colors.dark.surfaceStrong}
                circleActiveColor={Colors.dark.text}
                circleInActiveColor={Colors.dark.muted}
                circleBorderWidth={0}
                onValueChange={toggleNotifications}
                value={notificationsEnabledF}
                activeText=""
                inActiveText=""
                barHeight={28}
                circleSize={26}
              />
            </View>

            <FlatList
              data={wishListSkins}
              keyExtractor={(item) => item.uuid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    handleSkinPress(item);
                    handleWishlistPress(item);
                  }}
                  activeOpacity={0.76}
                  style={styles.wishlistItem}
                >
                  <Text style={styles.wishlistItemText} numberOfLines={2}>
                    {item.displayName}
                  </Text>
                  <Image
                    source={{
                      uri: item.levels[0].displayIcon || item.displayIcon,
                    }}
                    style={styles.wishlistItemImage}
                  />
                </TouchableOpacity>
              )}
              style={styles.wishlistFlatList}
              contentContainerStyle={styles.wishlistContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyWrap}>
                  <Text style={styles.wishlistEmptyText}>
                    No skins in your wishlist yet.
                  </Text>
                </View>
              )}
            />
          </View>
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
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.28,
  },
  backgroundFade: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 104,
    gap: 16,
  },
  profileCard: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: Colors.dark.tabBar,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 16,
    shadowColor: Colors.shadow.color,
    shadowOpacity: Colors.shadow.mediumOpacity,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 76,
    height: 76,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userTextContainer: {
    flex: 1,
  },
  eyebrow: {
    color: Colors.accent.green,
    fontFamily: "Rubik700",
    fontSize: 12,
  },
  gameNameText: {
    color: Colors.dark.text,
    fontSize: 25,
    fontFamily: "Rubik800",
  },
  taglineText: {
    color: Colors.dark.muted,
    fontSize: 16,
    fontFamily: "Rubik600",
  },
  rankIcon: {
    width: 58,
    height: 58,
    resizeMode: "contain",
  },
  quickStats: {
    flexDirection: "row",
    gap: 10,
  },
  statPill: {
    flex: 1,
    minHeight: 62,
    borderRadius: 8,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.hairline,
    padding: 10,
    justifyContent: "center",
  },
  statLabel: {
    color: Colors.dark.subtle,
    fontFamily: "Rubik600",
    fontSize: 12,
  },
  statValue: {
    color: Colors.dark.text,
    fontFamily: "Rubik800",
    fontSize: 18,
  },
  section: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 10,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontFamily: "Rubik700",
    fontSize: 20,
    paddingHorizontal: 4,
  },
  actionRow: {
    minHeight: 70,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.hairline,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: {
    backgroundColor: Colors.accent.ultraDarkRed,
  },
  careerIcon: {
    backgroundColor: Colors.accent.blueSoft,
  },
  actionTextBlock: {
    flex: 1,
  },
  actionTitle: {
    color: Colors.dark.text,
    fontFamily: "Rubik700",
    fontSize: 17,
  },
  actionSubtitle: {
    color: Colors.dark.muted,
    fontFamily: "Rubik400",
    fontSize: 13,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent.ultraDarkRed,
    borderWidth: 1,
    borderColor: "rgba(255,77,97,0.32)",
  },
  logoutText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Rubik700",
    color: Colors.accent.red,
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    height: "88%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalEyebrow: {
    color: Colors.accent.blue,
    fontFamily: "Rubik700",
    fontSize: 12,
  },
  modalTitle: {
    fontFamily: "Rubik800",
    color: Colors.dark.text,
    fontSize: 28,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.surfaceStrong,
  },
  notificationRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
  },
  notificationTextBlock: {
    flex: 1,
  },
  notificationText: {
    fontFamily: "Rubik700",
    color: Colors.dark.text,
    fontSize: 16,
  },
  notificationHint: {
    fontFamily: "Rubik400",
    color: Colors.dark.muted,
    fontSize: 12,
  },
  wishlistFlatList: {
    flex: 1,
  },
  wishlistContent: {
    gap: 12,
    paddingBottom: 16,
  },
  wishlistItem: {
    minHeight: 102,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  wishlistItemText: {
    flex: 1,
    fontFamily: "Rubik700",
    color: Colors.dark.text,
    fontSize: 17,
  },
  wishlistItemImage: {
    width: "42%",
    resizeMode: "contain",
    aspectRatio: 16 / 9,
  },
  emptyWrap: {
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  wishlistEmptyText: {
    color: Colors.dark.muted,
    fontSize: 17,
    fontFamily: "Rubik500",
    textAlign: "center",
  },
});
