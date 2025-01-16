import { ActivityIndicator, Alert, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { jwtDecode, JwtPayload } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import axios from "axios";
import * as Updates from "expo-updates"; // Importa expo-updates para reiniciar la app
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
} from "./API/valorant-api";
import {
  usePushNotifications,
  setNotificationsEnabled,
} from "./API/notifications-api";
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
  Alert.alert("Logout Confirm", "Are you sure to logout?", [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "Confirm",
      onPress: async () => {
        const RCTNetworking =
          require("react-native/Libraries/Network/RCTNetworking").default;
        RCTNetworking.clearCookies((result: any) => {});
        await AsyncStorage.clear();
        await Updates.reloadAsync(); // Reinicia la app
      },
    },
  ]);
}

export default function Index() {
  const [isLogged, setLogged] = useState<boolean | null>(null);
  const [webViewShow, setShowWebView] = useState<boolean>(true);
  const riotAuth =
    "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid";

  usePushNotifications();

  useEffect(() => {
    fetchNotificationStatus();
    loadVersion();
    checkTokens();
  }, []);

  const fetchNotificationStatus = async () => {
    try {
      const notifyStatus: any = (await AsyncStorage.getItem("Notify")) ?? null;
      if (notifyStatus) {
        setNotificationsEnabled(notifyStatus === "true");
      }
    } catch (error) {
      console.error("Error al obtener los tokens de AsyncStorage:", error);
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

      // Decoding the tokens using jwtDecode
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
      SetAccountShard();
      SetExpiresIn(expiresIn);
      SetTagline(idTokenDecoded.acct.tag_line);
      SetGameName(idTokenDecoded.acct.game_name);

      // Fetch data only after tokens are set
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

      // Once everything is fetched, check tokens
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
    console.warn("CHECKING TOKENS");

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
      console.log("Estás logeado, tienes todos los tokens");
    } else {
      setLogged(false);
      console.log("No estás logeado, faltan tokens");
    }
  }

  return (
    <>
      {!isLogged ? (
        <>
          <View
            style={{
              flexGrow: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.dark.background,
              display: webViewShow ? "flex" : "none",
            }}
          >
            <Text
              style={{
                fontFamily: "Rubik700",
                fontSize: 25,
                color: Colors.accent.color,
                marginBottom: 15,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              Login with your Riot Account
            </Text>
            <View
              style={{
                width: "90%",
                height: "80%",
                borderRadius: 10,
                backgroundColor: "red",
              }}
            >
              <WebView
                style={{}}
                source={{ uri: riotAuth }}
                onNavigationStateChange={(navState) => {
                  const { url } = navState;

                  // Verifica si la URL contiene los tokens
                  if (
                    url.includes("access_token") &&
                    url.includes("id_token") &&
                    url.includes("expires_in")
                  ) {
                    setShowWebView(false); // Oculta el WebView
                    extractTokensFromUrl(url); // Extrae los tokens de la URL
                  }
                }}
              />
            </View>
          </View>
          {!webViewShow && (
            <View
              style={{
                flexGrow: 1,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.dark.background,
              }}
            >
              <Text
                style={{
                  fontFamily: "Rubik700",
                  fontSize: 25,
                  color: Colors.accent.color,
                  marginBottom: 15,
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                Fetching data...
              </Text>
              <ActivityIndicator size="large" color={Colors.accent.color} />
            </View>
          )}
        </>
      ) : (
        <Redirect href="/(tabs)/store" />
      )}
    </>
  );
}
