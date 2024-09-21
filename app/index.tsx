import { useState } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { jwtDecode } from "jwt-decode";
import React from "react";
import axios from "axios";

const riotAuth =
  "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid";

const styles = StyleSheet.create({
  webView: {
    flex: 1,
    borderWidth: 5,
    borderColor: '#189F8F',
  },
  title: {
    fontSize: 25,
    marginBottom: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  tokenText: {
    fontSize: 16,
    marginVertical: 5,
    color: 'green',
  },
  decodedText: {
    fontSize: 14,
    marginVertical: 5,
    color: 'purple',
  },
  customButton: {
    backgroundColor: '#fe4a4a',
    padding: 18,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

interface CustomButtonProps {
  title: string;
  onPress: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.customButton} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function Index() {
  const [showWebView, setShowWebView] = useState(false);
  const [tokens, setTokens] = useState({ accessToken: "", idToken: "", expiresIn: "" });
  const [decodedTokens, setDecodedTokens] = useState({ accessTokenDecoded: {}, idTokenDecoded: {} });
  const [playerUUID, setPlayerUUID] = useState("");
  const [entitlementToken, setEntitlementToken] = useState("");
  const [storeData, setStoreData] = useState(null);

  // Función para extraer los valores de la URL
  const extractTokensFromUrl = (url: string) => {
    const accessTokenMatch = url.match(/access_token=([^&]*)/);
    const idTokenMatch = url.match(/id_token=([^&]*)/);
    const expiresInMatch = url.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && idTokenMatch && expiresInMatch) {
      const accessToken = accessTokenMatch[1];
      const idToken = idTokenMatch[1];
      const expiresIn = expiresInMatch[1];

      // Decodificar los tokens usando jwtDecode
      const accessTokenDecoded = jwtDecode(accessToken);
      const idTokenDecoded = jwtDecode(idToken);

      setPlayerUUID(JSON.stringify(accessTokenDecoded.sub));
      setTokens({ accessToken, idToken, expiresIn });
      setDecodedTokens({ accessTokenDecoded, idTokenDecoded });
      setShowWebView(false); // Ocultar el WebView después de obtener los tokens

      // Obtener el entitlement token
      getEntitlementToken(accessToken);
    }
  };

  // Función para obtener el entitlement token
  const getEntitlementToken = async (accessToken: string) => {
    try {
      const response = await axios.post(
        "https://entitlements.auth.riotgames.com/api/token/v1",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setEntitlementToken(response.data.entitlements_token);
      fetchStoreData(response.data.entitlements_token, accessToken);
    } catch (error) {
      console.error("Error fetching entitlement token:", error);
    }
  };

  // Función para obtener la tienda del jugador
  const fetchStoreData = async (entitlementToken: string, accessToken: string) => {
    const shard = "na"; // Puedes cambiar esto basado en la región del jugador
    const clientPlatform = {
      platformType: "PC",
      platformOS: "Windows",
      platformOSVersion: "10.0.19042.1.256.64bit",
      platformChipset: "Unknown",
    };
    const clientPlatformBase64 = btoa(JSON.stringify(clientPlatform)); // Codifica a base64 el client platform

    try {
      const response = await axios.get(
        `https://pd.${shard}.a.pvp.net/store/v2/storefront/${playerUUID}`,
        {
          headers: {
            "X-Riot-ClientPlatform": clientPlatformBase64,
            "X-Riot-ClientVersion": "release-03.00-shipping-7-531645", // Actualiza a la versión del cliente que estés usando
            "X-Riot-Entitlements-JWT": entitlementToken,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setStoreData(response.data); // Almacena la información de la tienda
    } catch (error) {
      console.error("Error fetching store data:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#252525' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>

        {!showWebView && !tokens.accessToken && (
          <>
            <Text style={styles.title}>Login with your Riot Account</Text>
            <CustomButton title="LOG IN" onPress={() => setShowWebView(true)} />
          </>
        )}

        {tokens.accessToken && (
          <View>
            <Text style={styles.decodedText}>
              Decoded Access Token: {JSON.stringify(decodedTokens.accessTokenDecoded, null, 2)}
            </Text>
            <Text style={styles.decodedText}>
              Decoded ID Token: {JSON.stringify(decodedTokens.idTokenDecoded, null, 2)}
            </Text>
            <Text>PLAYER UUID: {playerUUID}</Text>
            <Text style={styles.tokenText}>Expires In: {tokens.expiresIn}</Text>

            {storeData && (
              <View>
                <Text style={styles.title}>Store Information:</Text>
                <Text style={styles.tokenText}>
                  Featured Bundle: {storeData}
                </Text>
              </View>
            )}
          </View>
        )}

        {showWebView && (
          <View style={{ width: '90%', height: '80%' }}>
            <WebView
              style={styles.webView}
              source={{ uri: riotAuth }}
              onNavigationStateChange={(navState) => {
                extractTokensFromUrl(navState.url);
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
