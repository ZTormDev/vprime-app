import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { jwtDecode, JwtPayload } from "jwt-decode";
import React, { useEffect, useState, useRef } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../src/store/useAuthStore";
import { useShopStore } from "../src/store/useShopStore";
import { Colors } from "@/constants/Colors";
import axios from "axios";
import * as Updates from "expo-updates";
import { registerBackgroundWishlistTask } from "../src/utils/wishlistTask";
import {
  getGameSkins,
  fetchSkinsWishList,
  loadVersion,
  getBundles,
  getContentTiers,
  GetPlayerLoadout,
  getPlayerCard,
  getMatchHistory,
  SetPlayerUUID,
  SetAccountShard,
  SetAccessToken,
  SetIdToken,
  SetExpiresIn,
  SetTagline,
  SetGameName,
  AccessToken,
  SetEntitlementsToken,
  EntitlementsToken,
  PlayerUUID,
  skins,
  MatchHistoryData,
  PlayerCard,
  bundles,
  PlayerLoadout,
  Shard,
  getMaps,
  getAgents,
  getRankTiers,
  Maps,
  Agents,
  fetchStoreData,
} from "../API/valorant-api";
import {
  usePushNotifications,
  setNotificationsEnabled,
} from "../API/notifications-api";
interface CustomJwtPayload extends JwtPayload {
  acct: {
    game_name: string;
    tag_line: string;
    // add other properties that you expect
  };
  // add any other properties that may exist in your payload
}

// VersionCheck.getLatestVersion() // Automatically choose profer provider using `Platform.select` by device platform.
//   .then((latestVersion) => {
//     if (latestVersion) {
//       console.log(latestVersion); // 0.1.2
//     } else {
//       console.log("ULTIMA VERSION NO CONSEGUIDA!");
//     }
//   });

export async function accountLogout() {
  Alert.alert("Log Out?", "Are you sure you want to log out?", [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "Confirm",
      onPress: async () => {
        const RCTNetworking =
          require("react-native/Libraries/Network/" + "RCTNetworking").default;
        RCTNetworking.clearCookies((result: any) => {});
        await AsyncStorage.clear();
        await Updates.reloadAsync();
      },
    },
  ]);
}

export default function Index() {
  const [isLogged, setLogged] = useState<boolean | null>(null);
  const [webViewShow, setShowWebView] = useState<boolean>(true);
  const riotAuth =
    "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid";

  const isProcessingToken = useRef(false);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  usePushNotifications();

  useEffect(() => {
    fetchNotificationStatus();
    loadVersion();
    registerBackgroundWishlistTask();

    const initSession = async () => {
      console.log("Checking for stored session...");
      const restored = await restoreSession();
      if (restored) {
        const state = useAuthStore.getState();
        SetAccessToken(state.accessToken!);
        SetIdToken(state.idToken!);
        SetPlayerUUID(state.playerUUID!);
        SetExpiresIn(state.expiresIn || "");
        SetTagline(state.tagline || "");
        SetGameName(state.gameName || "");

        try {
          await SetAccountShard();
          await getEntitlementToken();
          await getGameSkins();
          await getBundles();
          await getContentTiers();
          await fetchSkinsWishList();
          await GetPlayerLoadout();
          await getPlayerCard();
          await getMaps();
          await getAgents();
          await getRankTiers();
          await checkTokens();
        } catch (error) {
          console.error("Failed to restore session assets:", error);
          setLogged(false);
        }
      } else {
        setLogged(false);
      }
    };

    initSession();
  }, []);

  const fetchNotificationStatus = async () => {
    try {
      const notifyStatus: any = (await AsyncStorage.getItem("Notify")) ?? null;
      if (notifyStatus) {
        setNotificationsEnabled(notifyStatus === "true");
      }
    } catch (error) {
      console.error("Error reading notification status from AsyncStorage:", error);
    }
  };

  const extractTokensFromUrl = async (url: string) => {
    const accessTokenMatch = url.match(/access_token=([^&]*)/);
    const idTokenMatch = url.match(/id_token=([^&]*)/);
    const expiresInMatch = url.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && idTokenMatch && expiresInMatch) {
      const accessToken = accessTokenMatch[1];
      const idToken = idTokenMatch[1];
      const expiresIn = expiresInMatch[1];

      const accessTokenDecoded = jwtDecode<JwtPayload>(accessToken);
      const idTokenDecoded = jwtDecode<CustomJwtPayload>(idToken);

      const playerUUIDstring = JSON.stringify(accessTokenDecoded.sub).replace(
        /"/g,
        ""
      );
      const playerUUID = playerUUIDstring;

      // Set the tokens and other values
      SetPlayerUUID(playerUUID);
      SetAccessToken(accessToken);
      SetIdToken(idToken);
      const resolvedShard = await SetAccountShard();
      SetExpiresIn(expiresIn);
      SetTagline(idTokenDecoded.acct.tag_line);
      SetGameName(idTokenDecoded.acct.game_name);

      await useAuthStore.getState().setSession(
        accessToken,
        idToken,
        playerUUID,
        resolvedShard || "na",
        expiresIn,
        idTokenDecoded.acct.game_name,
        idTokenDecoded.acct.tag_line
      );

      await getEntitlementToken();
      await getGameSkins();
      await getBundles();
      await getContentTiers();
      await fetchSkinsWishList();
      await GetPlayerLoadout();
      await getPlayerCard();
      await getMaps();
      await getAgents();
      await getRankTiers();

      await checkTokens();
    }
  };

  async function getEntitlementToken() {
    await axios
      .post(
        "https://entitlements.auth.riotgames.com/api/token/v1",
        {},
        {
          headers: {
            Authorization: `Bearer ${AccessToken}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(async (response) => {
        SetEntitlementsToken(response.data.entitlements_token);
      });
  }

  async function checkTokens() {
    console.log("CHECKING TOKENS");

    if (
      AccessToken &&
      EntitlementsToken &&
      PlayerUUID &&
      Shard &&
      skins &&
      bundles &&
      Maps &&
      Agents
    ) {
      await fetchStoreData();
      setLogged(true);
      console.log("Logged in with all required tokens");
    } else {
      setLogged(false);
      console.log("Not logged in, missing required tokens");
    }
  }

  return (
    <>
      {isLogged === null ? (
        <View style={styles.centerScreen}>
          <View style={styles.statusCard}>
            <ActivityIndicator size="large" color={Colors.accent.blue} />
            <Text style={styles.statusTitle}>Restoring Session</Text>
            <Text style={styles.statusSubtitle}>Preparing your store and profile.</Text>
          </View>
        </View>
      ) : !isLogged ? (
        <>
          <View style={[styles.loginScreen, { display: webViewShow ? "flex" : "none" }]}>
            <View style={styles.loginHeader}>
              <Text style={styles.loginEyebrow}>VPrime</Text>
              <Text style={styles.loginTitle}>Login</Text>
              <Text style={styles.loginSubtitle}>
                Connect your Riot account to load the store, skins and career data.
              </Text>
            </View>
            <View style={styles.webViewCard}>
              <WebView
                style={styles.webView}
                source={{ uri: riotAuth }}
                onNavigationStateChange={(navState) => {
                  const { url } = navState;

                  if (
                    url.includes("access_token") &&
                    url.includes("id_token") &&
                    url.includes("expires_in")
                  ) {
                    if (isProcessingToken.current) return;
                    isProcessingToken.current = true;
                    setShowWebView(false);
                    extractTokensFromUrl(url);
                  }
                }}
              />
            </View>
          </View>
          {!webViewShow && (
            <View style={styles.centerScreen}>
              <View style={styles.statusCard}>
                <ActivityIndicator size="large" color={Colors.accent.blue} />
                <Text style={styles.statusTitle}>Fetching Data</Text>
                <Text style={styles.statusSubtitle}>Syncing inventory and account data.</Text>
              </View>
            </View>
          )}
        </>
      ) : (
        <Redirect href="/(tabs)/store" />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  centerScreen: {
    flexGrow: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
    padding: 16,
  },
  statusCard: {
    width: "100%",
    borderRadius: 8,
    padding: 22,
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statusTitle: {
    fontFamily: "Rubik800",
    fontSize: 24,
    color: Colors.dark.text,
    textAlign: "center",
  },
  statusSubtitle: {
    fontFamily: "Rubik400",
    fontSize: 14,
    color: Colors.dark.muted,
    textAlign: "center",
  },
  loginScreen: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
    padding: 16,
    gap: 14,
  },
  loginHeader: {
    width: "100%",
    borderRadius: 8,
    padding: 18,
    backgroundColor: Colors.dark.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  loginEyebrow: {
    fontFamily: "Rubik700",
    fontSize: 13,
    color: Colors.accent.green,
  },
  loginTitle: {
    fontFamily: "Rubik800",
    fontSize: 34,
    color: Colors.dark.text,
  },
  loginSubtitle: {
    fontFamily: "Rubik400",
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark.muted,
  },
  webViewCard: {
    width: "100%",
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.dark.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  webView: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundAlt,
  },
});
