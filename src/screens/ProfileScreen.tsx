import {
  TouchableOpacity,
  View,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { accountLogout } from "../../app/index";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import {
  getPlayerMMR,
  isInWishList,
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
import { useFocusEffect } from "expo-router";
import { SkinPreview } from "@/components/SkinPreview";
import { MatchHistory } from "@/components/MatchHistory";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/src/hooks/useTheme";
import { SegmentHeader } from "@/src/components/common/SegmentHeader";
import { AnimatedEntrance, runWhenIdle } from "@/src/components/common/Motion";

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
  const playerCard = useShopStore((state) => state.playerCard);
  const terminalBackgroundArt = playerCard?.largeArt || playerCard?.wideArt;

  useEffect(() => {
    const fetchPlayerMMR = async () => {
      await getPlayerMMR();
    };
    fetchPlayerMMR();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setShowWishlist(false);
        setSelectedSkin(null);
        setShowMatchHistory(false);
      };
    }, [])
  );

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
    const lastLevel: any = Object.keys(skin.levels).sort().reverse()[0];
    setVideoPreview(skin.levels[lastLevel].streamedVideo);
    runWhenIdle(() => {
      setSelectedSkin(skin);
    });
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
        `Check complete: ${result.reason}. Matches: ${
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
      {terminalBackgroundArt && (
        <Image
          source={{ uri: terminalBackgroundArt }}
          style={styles.backgroundImage}
          blurRadius={5}
        />
      )}
      <LinearGradient
        colors={[
          theme === "dark" ? "rgba(9,10,12,0.78)" : "rgba(248,250,252,0.78)",
          colors.background
        ]}
        style={styles.backgroundFade}
      />

      <SegmentHeader activeSegment="profile" transparentBackground />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={theme === "dark" ? "white" : "black"}
      >
        {/* Bento Identity Card */}
        <AnimatedEntrance delay={20} style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              {playerCard?.displayIcon && (
                <Image
                  source={{ uri: playerCard.displayIcon }}
                  style={styles.avatarImage}
                />
              )}
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.eyebrow}>VALORANT TERMINAL</Text>
              <Text style={styles.gameNameText} numberOfLines={1}>
                {GameName}
              </Text>
              <Text style={styles.taglineText}>#{TagLine}</Text>
            </View>
            {PlayerMMR?.Rank?.images?.largeIcon && (
              <Image
                source={{ uri: PlayerMMR.Rank.images.largeIcon }}
                style={styles.rankIcon}
              />
            )}
          </View>
        </AnimatedEntrance>

        {/* Bento Stats Row */}
        <AnimatedEntrance delay={70} style={styles.bentoRow}>
          <TouchableOpacity
            onPress={handleWishlist}
            activeOpacity={0.8}
            style={styles.statsCardBento}
          >
            <TabBarIcon name="heart" color={accent.red} size={24} />
            <View>
              <Text style={styles.statsVal}>{wishListSkins?.length || 0}</Text>
              <Text style={styles.statsLabel}>Wishlist Skins</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMatchHistory}
            activeOpacity={0.8}
            style={styles.statsCardBento}
          >
            <TabBarIcon name="trophy" color={accent.gold} size={24} />
            <View>
              <Text style={styles.statsVal} numberOfLines={1}>
                {PlayerMMR?.Rank?.tierName?.split(" ")[0] || "UNRATED"}
              </Text>
              <Text style={styles.statsLabel}>Competitive Status</Text>
            </View>
          </TouchableOpacity>
        </AnimatedEntrance>

        {/* Terminal Configuration Bento Block */}
        <AnimatedEntrance delay={120} style={styles.section}>
          <Text style={styles.sectionTitle}>System Configuration</Text>

          <View style={styles.settingsRow}>
            <View style={styles.settingsTextCol}>
              <Text style={styles.settingsText}>Local Alerts</Text>
              <Text style={styles.settingsHint}>Notify when wishlist skins appear</Text>
            </View>
            <Switch
              backgroundActive={accent.gold}
              backgroundInactive={colors.surfaceStrong}
              circleActiveColor={colors.text}
              circleInActiveColor={colors.muted}
              circleBorderWidth={0}
              onValueChange={toggleNotifications}
              value={notificationsEnabledF}
              activeText=""
              inActiveText=""
              barHeight={24}
              circleSize={22}
            />
          </View>

          <TouchableOpacity
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
            activeOpacity={0.76}
            style={styles.settingsActionRow}
          >
            <View style={styles.settingsTextCol}>
              <Text style={styles.settingsText}>Color Theme</Text>
              <Text style={styles.settingsHint}>Current mode: {theme.toUpperCase()}</Text>
            </View>
            <TabBarIcon
              name={theme === "dark" ? "moon-outline" : "sunny-outline"}
              color={accent.gold}
              size={20}
            />
          </TouchableOpacity>
        </AnimatedEntrance>

        {/* Developer Block */}
        {showDevOptions && (
          <AnimatedEntrance style={styles.section} distance={12} duration={220}>
            <Text style={styles.sectionTitle}>Developer Diagnostics</Text>

            <TouchableOpacity
              onPress={handleTestNotification}
              activeOpacity={0.76}
              style={styles.settingsActionRow}
            >
              <View style={styles.settingsTextCol}>
                <Text style={styles.settingsText}>Test Notification</Text>
                <Text style={styles.settingsHint}>Schedules local alert immediately</Text>
              </View>
              <TabBarIcon name="notifications-outline" color={accent.blue} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRunBackgroundCheck}
              activeOpacity={0.76}
              style={styles.settingsActionRow}
            >
              <View style={styles.settingsTextCol}>
                <Text style={styles.settingsText}>Wishlist Store Check</Text>
                <Text style={styles.settingsHint}>Triggers live store API task</Text>
              </View>
              <TabBarIcon name="sync-outline" color={accent.green} size={20} />
            </TouchableOpacity>

            {backgroundTestStatus ? (
              <Text style={styles.testStatus}>{backgroundTestStatus}</Text>
            ) : null}
          </AnimatedEntrance>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={accountLogout}
          activeOpacity={0.76}
          style={styles.logoutButton}
        >
          <TabBarIcon name="log-out-outline" color={accent.red} size={20} />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>

        {/* Version tapping area */}
        <TouchableOpacity
          onPress={handleVersionPress}
          activeOpacity={1}
          style={styles.versionWrap}
        >
          <Text style={[styles.versionText, { color: colors.muted }]}>
            VPrime Client Console v1.0.0
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Wishlist Modal Overlay */}
      {showWishlist && (
        <View style={styles.modalContainer}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalEyebrow, { color: accent.blue }]}>Active Monitors</Text>
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
                    No items in wishlist monitor.
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
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      opacity: 0.18,
      resizeMode: "cover",
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
      paddingBottom: 60,
      gap: 16,
    },
    profileCard: {
      borderRadius: 16,
      padding: 16,
      overflow: "hidden",
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    profileTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    avatarContainer: {
      width: 64,
      height: 64,
      overflow: "hidden",
      borderRadius: 12,
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
      color: accent.gold,
      fontFamily: "Rubik700",
      fontSize: 10,
      letterSpacing: 0.5,
    },
    gameNameText: {
      color: colors.text,
      fontSize: 22,
      fontFamily: "Rubik800",
    },
    taglineText: {
      color: colors.muted,
      fontSize: 14,
      fontFamily: "Rubik600",
    },
    rankIcon: {
      width: 48,
      height: 48,
      resizeMode: "contain",
    },
    bentoRow: {
      flexDirection: "row",
      gap: 16,
      width: "100%",
    },
    statsCardBento: {
      flex: 1,
      minHeight: 102,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: "hidden",
      backgroundColor: colors.glass,
      padding: 14,
      justifyContent: "space-between",
    },
    statsVal: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 18,
    },
    statsLabel: {
      color: colors.muted,
      fontFamily: "Rubik600",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    section: {
      borderRadius: 16,
      padding: 16,
      overflow: "hidden",
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      gap: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 17,
      marginBottom: 4,
    },
    settingsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    settingsTextCol: {
      flex: 1,
      gap: 2,
    },
    settingsText: {
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 15,
    },
    settingsHint: {
      color: colors.muted,
      fontFamily: "Rubik500",
      fontSize: 12,
    },
    settingsActionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    testStatus: {
      color: colors.muted,
      fontFamily: "Rubik500",
      fontSize: 12,
      lineHeight: 16,
      marginTop: 4,
    },
    logoutButton: {
      minHeight: 48,
      borderRadius: 14,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      backgroundColor: accent.ultraDarkRed,
      borderWidth: 1,
      borderColor: "rgba(255,77,97,0.22)",
      marginTop: 8,
    },
    logoutText: {
      fontSize: 15,
      textAlign: "center",
      fontFamily: "Rubik700",
      color: accent.red,
    },
    versionWrap: {
      marginTop: 18,
      marginBottom: 10,
      alignItems: "center",
    },
    versionText: {
      fontFamily: "Rubik500",
      fontSize: 11,
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
      height: "82%",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
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
      marginBottom: 16,
    },
    modalEyebrow: {
      fontFamily: "Rubik700",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    modalTitle: {
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 26,
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceStrong,
    },
    wishlistFlatList: {
      flex: 1,
    },
    wishlistContent: {
      gap: 12,
      paddingBottom: 40,
    },
    wishlistItem: {
      minHeight: 88,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 12,
    },
    wishlistItemText: {
      flex: 1,
      fontFamily: "Rubik700",
      color: colors.text,
      fontSize: 16,
    },
    wishlistItemImage: {
      width: "36%",
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
      fontSize: 15,
      fontFamily: "Rubik500",
      textAlign: "center",
    },
  });
}
