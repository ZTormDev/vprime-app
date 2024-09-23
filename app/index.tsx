import { Alert, NativeModules, Platform, Text, View, } from "react-native";
import { WebView } from "react-native-webview";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from "@/constants/Colors";
import axios from "axios";
import * as Updates from 'expo-updates'; // Importa expo-updates para reiniciar la app

export async function accountLogout() {
    Alert.alert(
        "Logout Confirm",
        "Are you sure to logout?",
        [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Confirm",
                onPress: async () => {
                    const RCTNetworking = require("react-native/Libraries/Network/RCTNetworking").default;
                    RCTNetworking.clearCookies((result: any) => {
                    });
                    await AsyncStorage.clear();
                    await Updates.reloadAsync(); // Reinicia la app
                }
            },
        ]
    );
}

export default function Index() {
    const [isLogged, setLogged] = useState<boolean | null>(null);
    const riotAuth = "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid";
    const [currentUrl, setCurrentUrl] = useState<string | null>(null); // Estado para la URL
    

    const extractTokensFromUrl = (url: string) => {
        AsyncStorage.clear();

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

        const playerUUIDstring = JSON.stringify(accessTokenDecoded.sub).replace(/"/g, '');
        const playerUUID = playerUUIDstring;

        AsyncStorage.setItem('accessToken', accessToken);
        AsyncStorage.setItem('idToken', idToken);
        AsyncStorage.setItem('expiresIn', expiresIn);
        AsyncStorage.setItem('playerUUID', playerUUID);

        getEntitlementToken(accessToken);
        }
    };

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

          AsyncStorage.setItem('entitlementToken', response.data.entitlements_token);

        } catch (error) {
          console.error("Error fetching entitlement token:", error);
        }
      };

    const checkTokens = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const idToken = await AsyncStorage.getItem('idToken');
        const expiresIn = await AsyncStorage.getItem('expiresIn');
        const playerUUID = await AsyncStorage.getItem('playerUUID');
        const entitlementToken = await AsyncStorage.getItem('entitlementToken');

        if (accessToken && idToken && expiresIn && playerUUID && entitlementToken) {
            setLogged(true);
            console.log('Estás logeado, tienes los tokens');
        } else {
            setLogged(false);
            console.log('No estás logeado, no tienes los tokens');
        }
    };

    useEffect(() => {
        // Verifica los tokens cada 2 segundos
        const intervalId = setInterval(checkTokens, 500);

        // Limpia el intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, []);


  return (
    <>
        {!isLogged ? (
            <View style={{ flexGrow: 1, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background}}>
                <Text style={{ fontFamily: 'Rubik700', fontSize: 25, color: Colors.red.color, marginBottom: 15 , textAlign: 'center', textTransform: 'uppercase'}}>Login with your Riot Account</Text>
                <View style={{ width: '90%', height: '80%', borderRadius: 10, backgroundColor: 'red' }}>
                    <WebView
                    style={{}}
                    source={{ uri: riotAuth }}
                    onNavigationStateChange={(navState) => {
                        setCurrentUrl(navState.url);
                        extractTokensFromUrl(navState.url);
                    }}
                    />
                </View>
            </View>
        ) : (
            <Redirect href='/(tabs)/store' />
        )}
    </>
);};