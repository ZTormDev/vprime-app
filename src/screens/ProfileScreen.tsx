import {
  TouchableOpacity,
  View,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { useTheme } from "@/src/hooks/useTheme";
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
import { runWishlistStorefrontCheckOnce } from "../utils/wishlistTask";
import { useNavigation } from "expo-router";
import { SkinPreview } from "@/components/SkinPreview";
import { MatchHistory } from "@/components/MatchHistory";
import { LinearGradient } from "expo-linear-gradient";
import { AppBlurView } from "@/src/components/common/AppBlurView";

export default function ProfileScreen() {
  const [showWishlist, setShowWishlist] = useState<boolean | null>(null);
  const [showMatchHistory, setShowMatchHistory] = useState<any | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [notificationsEnabledF, setNotificationsEnabledF] = useState(true);
  const [backgroundTestStatus, setBackgroundTestStatus] = useState("");
  const [devTapCount, setDevTapCount] = useState(0);
  const [showDevOptions, setShowDevOptions] = useState(false);
  const navigation = useNavigation();

  const { colors, theme, setTheme, accent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, accent, theme), [colors, accent, theme]);

  const handleVersionPress = () => {
    const nextCount = devTapCount + 1;
    if (nextCount >= 5) {
      setShowDevOptions(!showDevOptions);
      setDevTapCount(0);
      Alert.alert(
        "Developer Options",
        !showDevOptions ? "Developer Mode Enabled 🛠️" : "Developer Mode Disabled"
      );
    } else {
      setDevTapCount(nextCount);
    }
  };

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

  const handleTestNotification = async () => {
    setBackgroundTestStatus("Sending test notification...");
    await pushNotification(
      "VPrime test notification",
      "If you see this, local notifications are working.",
      null
    );
    setBackgroundTestStatus("Test notification sent.");
  };

  const handleRunBackgroundCheck = async () => {
    setBackgroundTestStatus("Running store and wishlist check...");
    try {
      const result = await runWishlistStorefrontCheckOnce({
        forceStoreNotification: true,
        forceWishlistNotification: true,
      });
      setBackgroundTestStatus(
        `Check complete: ${result.reason}. Wishlist matches: ${
          result.matchedSkins.length > 0
            ? result.matchedSkins.join(", ")
            : "none"
        }.`
      );
    } catch (error) {
      console.error("[Developer Test] Background check failed:", error);
      setBackgroundTestStatus("Background check failed. Check Metro logs.");
    }
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
        colors={[theme === "dark" ? "rgba(16,17,20,0.68)" : "rgba(248,250,252,0.68)", colors.background]}
        style={styles.backgroundFade}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={theme === "dark" ? "white" : "black"}
      >
        <View style={styles.profileCard}>
          <AppBlurView
            tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
            intensity={50}
            style={styles.blurLayer}
          />
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
          <AppBlurView
            tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
            intensity={42}
            style={styles.blurLayer}
          />
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity
            onPress={handleWishlist}
            activeOpacity={0.76}
            style={styles.actionRow}
          >
            <AppBlurView
              tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
              intensity={28}
              style={styles.blurLayer}
            />
            <View style={[styles.actionIcon, styles.heartIcon]}>
              <TabBarIcon name="heart" color={accent.red} size={22} />
            </View>
            <View style={styles.actionTextBlock}>
              <Text style={styles.actionTitle}>Skins Wishlist</Text>
              <Text style={styles.actionSubtitle}>Saved skins and notifications</Text>
            </View>
            <TabBarIcon name="chevron-forward" color={colors.subtle} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMatchHistory}
            activeOpacity={0.76}
            style={styles.actionRow}
          >
            <AppBlurView
              tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
              intensity={28}
              style={styles.blurLayer}
            />
            <View style={[styles.actionIcon, styles.careerIcon]}>
              <TabBarIcon name="time" color={accent.blue} size={22} />
            </View>
            <View style={styles.actionTextBlock}>
              <Text style={styles.actionTitle}>Career</Text>
              <Text style={styles.actionSubtitle}>Competitive match history</Text>
            </View>
            <TabBarIcon name="chevron-forward" color={colors.subtle} size={20} />
          </TouchableOpacity>
        </View>

        {showDevOptions && (
          <View style={styles.section}>
            <AppBlurView
              tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
              intensity={42}
              style={styles.blurLayer}
            />
            <Text style={styles.sectionTitle}>Developer Tests</Text>

            <TouchableOpacity
              onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
              activeOpacity={0.76}
              style={styles.actionRow}
            >
              <AppBlurView
                tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
                intensity={28}
                style={styles.blurLayer}
              />
              <View style={[styles.actionIcon, { backgroundColor: accent.violetSoft }]}>
                <TabBarIcon
                  name={theme === "dark" ? "moon-outline" : "sunny-outline"}
                  color={accent.violet}
                  size={22}
                />
              </View>
              <View style={styles.actionTextBlock}>
                <Text style={styles.actionTitle}>Toggle App Theme</Text>
                <Text style={styles.actionSubtitle}>Current: {theme.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTestNotification}
              activeOpacity={0.76}
              style={styles.actionRow}
            >
              <AppBlurView
                tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
                intensity={28}
                style={styles.blurLayer}
              />
              <View style={[styles.actionIcon, styles.careerIcon]}>
                <TabBarIcon
                  name="notifications-outline"
                  color={accent.blue}
                  size={22}
                />
              </View>
              <View style={styles.actionTextBlock}>
                <Text style={styles.actionTitle}>Send Test Notification</Text>
                <Text style={styles.actionSubtitle}>Verifies local notifications</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRunBackgroundCheck}
              activeOpacity={0.76}
              style={styles.actionRow}
            >
              <AppBlurView
                tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
                intensity={28}
                style={styles.blurLayer}
              />
              <View style={[styles.actionIcon, { backgroundColor: accent.greenSoft }]}>
                <TabBarIcon name="sync-outline" color={accent.green} size={22} />
              </View>
              <View style={styles.actionTextBlock}>
                <Text style={styles.actionTitle}>Run Store Check Now</Text>
                <Text style={styles.actionSubtitle}>
                  Runs the same logic as the background task
                </Text>
              </View>
            </TouchableOpacity>

            {backgroundTestStatus ? (
              <Text style={styles.testStatus}>{backgroundTestStatus}</Text>
            ) : null}
          </View>
        )}

        <TouchableOpacity
          onPress={accountLogout}
          activeOpacity={0.76}
          style={styles.logoutButton}
        >
          <TabBarIcon name="log-out-outline" color={accent.red} size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleVersionPress}
          activeOpacity={1}
          style={{ marginTop: 24, marginBottom: 8, alignItems: "center" }}
        >
          <Text style={{ fontFamily: "Rubik400", color: colors.muted, fontSize: 12 }}>
            VPrime App v1.0.0
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showWishlist && (
        <View style={styles.modalContainer}>
          <View style={styles.modalSheet}>
            <AppBlurView
              tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
              intensity={74}
              style={styles.blurLayer}
            />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalEyebrow, { color: accent.blue }]}>Saved</Text>
                <Text style={styles.modalTitle}>Your Wishlist</Text>
              </View>
              <TouchableOpacity
                onPress={handleWishlist}
                style={styles.iconButton}
                activeOpacity={0.72}
              >
                <TabBarIcon name="close" color={colors.text} size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.notificationRow}>
              <View style={styles.notificationTextBlock}>
                <Text style={styles.notificationText}>Notifications</Text>
                <Text style={styles.notificationHint}>Alerts for your saved skins</Text>
              </View>
              <Switch
                backgroundActive={accent.blue}
                backgroundInactive={colors.surfaceStrong}
                circleActiveColor={colors.text}
                circleInActiveColor={colors.muted}
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
              showsVerticalScrollIndicator={true}
              indicatorStyle={theme === "dark" ? "white" : "black"}
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

function createStyles(colors: any, accent: any, theme: string) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    blurLayer: {
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
      paddingBottom: 150,
      gap: 16,
    },
    profileCard: {
      borderRadius: 8,
      padding: 16,
      overflow: "hidden",
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      gap: 16,
      shadowColor: "#000000",
      shadowOpacity: 0.28,
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
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    userTextContainer: {
      flex: 1,
    },
    eyebrow: {
      color: accent.green,
      fontFamily: "Rubik700",
      fontSize: 12,
    },
    gameNameText: {
      color: colors.text,
      fontSize: 25,
      fontFamily: "Rubik800",
    },
    taglineText: {
      color: colors.muted,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.hairline,
      padding: 10,
      justifyContent: "center",
    },
    statLabel: {
      color: colors.subtle,
      fontFamily: "Rubik600",
      fontSize: 12,
    },
    statValue: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 18,
    },
    section: {
      borderRadius: 8,
      padding: 12,
      overflow: "hidden",
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      gap: 10,
    },
    sectionTitle: {
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 20,
      paddingHorizontal: 4,
    },
    actionRow: {
      minHeight: 70,
      borderRadius: 8,
      overflow: "hidden",
      padding: 12,
      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.03)",
      borderWidth: 1,
      borderColor: colors.hairline,
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
      backgroundColor: accent.ultraDarkRed,
    },
    careerIcon: {
      backgroundColor: accent.blueSoft,
    },
    actionTextBlock: {
      flex: 1,
    },
    actionTitle: {
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 17,
    },
    actionSubtitle: {
      color: colors.muted,
      fontFamily: "Rubik400",
      fontSize: 13,
    },
    testStatus: {
      color: colors.muted,
      fontFamily: "Rubik500",
      fontSize: 13,
      lineHeight: 18,
      paddingHorizontal: 4,
    },
    logoutButton: {
      minHeight: 52,
      borderRadius: 8,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      backgroundColor: accent.ultraDarkRed,
      borderWidth: 1,
      borderColor: "rgba(255,77,97,0.32)",
    },
    logoutText: {
      fontSize: 16,
      textAlign: "center",
      fontFamily: "Rubik700",
      color: accent.red,
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
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.96)" : "rgba(248,250,252,0.96)",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      padding: 16,
      overflow: "hidden",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    modalEyebrow: {
      fontFamily: "Rubik700",
      fontSize: 12,
    },
    modalTitle: {
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 28,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceStrong,
    },
    notificationRow: {
      flexDirection: "row",
      gap: 14,
      marginBottom: 14,
      alignItems: "center",
      borderRadius: 8,
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      padding: 12,
    },
    notificationTextBlock: {
      flex: 1,
    },
    notificationText: {
      fontFamily: "Rubik700",
      color: colors.text,
      fontSize: 16,
    },
    notificationHint: {
      fontFamily: "Rubik400",
      color: colors.muted,
      fontSize: 12,
    },
    wishlistFlatList: {
      flex: 1,
    },
    wishlistContent: {
      gap: 12,
      paddingBottom: 100,
    },
    wishlistItem: {
      minHeight: 102,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      gap: 10,
    },
    wishlistItemText: {
      flex: 1,
      fontFamily: "Rubik700",
      color: colors.text,
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
      color: colors.muted,
      fontSize: 17,
      fontFamily: "Rubik500",
      textAlign: "center",
    },
  });
}
