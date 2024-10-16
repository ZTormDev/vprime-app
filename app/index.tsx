import { Alert, Text, View, } from "react-native";
import { WebView } from "react-native-webview";
import { jwtDecode, JwtPayload } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from "@/constants/Colors";
import axios from "axios";
import * as Updates from 'expo-updates'; // Importa expo-updates para reiniciar la app
import { getGameSkins, fetchSkinsWishList, loadVersion, getBundles } from "./API/valorant-api";
import { usePushNotifications, setNotificationsEnabled } from "./API/notifications-api";

interface CustomJwtPayload extends JwtPayload {
    acct: {
        game_name: string;
        tag_line: string;
        // add other properties that you expect
    };
    // add any other properties that may exist in your payload
}

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
                    RCTNetworking.clearCookies((result: any) => {});
                    await AsyncStorage.clear();
                    await Updates.reloadAsync(); // Reinicia la app
                }
            },
        ]
    );
}


export default function Index() {
    const [isLogged, setLogged] = useState<boolean | null>(null);
    const [webViewShow, setShowWebView] = useState<boolean>(true);
    const riotAuth = "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid";
    const [PlayerName, SetPlayerName] = useState(null);

    usePushNotifications();
    
    useEffect(() => {
        fetchNotificationStatus();
        loadVersion();
    }, []);



    const fetchNotificationStatus = async () => {
        try {
        const notifyStatus: any = (await AsyncStorage.getItem('Notify')) ?? null;
        if (notifyStatus) {
            setNotificationsEnabled(notifyStatus === 'true');
        }
        } catch (error) {
        console.error('Error al obtener los tokens de AsyncStorage:', error);
        }
    };

    const extractTokensFromUrl = async (url: string) => {
        AsyncStorage.removeItem('accessToken');
        AsyncStorage.removeItem('idToken');
        AsyncStorage.removeItem('expiresIn');
        AsyncStorage.removeItem('playerUUID');
        AsyncStorage.removeItem('entitlementToken');

        const accessTokenMatch = url.match(/access_token=([^&]*)/);
        const idTokenMatch = url.match(/id_token=([^&]*)/);
        const expiresInMatch = url.match(/expires_in=([^&]*)/);
        
        if (accessTokenMatch && idTokenMatch && expiresInMatch) {
            const accessToken = accessTokenMatch[1];
            const idToken = idTokenMatch[1];
            const expiresIn = expiresInMatch[1];
            
            // Decoding the tokens using jwtDecode
            const accessTokenDecoded = jwtDecode<JwtPayload>(accessToken);
            const idTokenDecoded = jwtDecode<CustomJwtPayload>(idToken); // Use the custom interface here
        
            const playerUUIDstring = JSON.stringify(accessTokenDecoded.sub).replace(/"/g, '');
            const playerUUID = playerUUIDstring;
        
            AsyncStorage.setItem('accessToken', accessToken);
            AsyncStorage.setItem('idToken', idToken);
            AsyncStorage.setItem('expiresIn', expiresIn);
            AsyncStorage.setItem('playerUUID', playerUUID);
        
            const gameName: string = idTokenDecoded.acct.game_name + '#' + idTokenDecoded.acct.tag_line; // This should work now
            
            SetPlayerName(gameName);
            AsyncStorage.setItem('PlayerName', gameName);
        
            await fetchSkinsWishList().then(async res => {
                await getEntitlementToken(accessToken);
            });
        }
    };

    

    const getEntitlementToken = async (accessToken: string) => {

          await axios.post(
            "https://entitlements.auth.riotgames.com/api/token/v1",
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          ).then (async (response) => {

            AsyncStorage.setItem('entitlementToken', response.data.entitlements_token);
          
            await getGameSkins().then(async () => {
                await getBundles().then(async () => {
                    await checkTokens();
                }).catch((error) => {
                    console.error("Error fetching bundles:", error);
                });
            }).catch((error) => {
                console.error("Error fetching skins:", error);
            });

            

          });
      };

    const checkTokens = async () => {
 
        await AsyncStorage.getItem('accessToken').then(async (accessToken) => {
            if (accessToken) {
                await AsyncStorage.getItem('entitlementToken').then(async (entitlementToken) => {
                    if (entitlementToken) {
                        await AsyncStorage.getItem('playerUUID').then((playerUUID) => {
                            if(playerUUID){
                                setLogged(true);                    
                                console.log('Estás logeado, tienes los tokens');
                            }
                            else {
                                setLogged(false);
                                console.log('No estas logeado faltan tokens');
                            }
                        });
                    }
                });
            }
        }); 
    };


  return (
    <>
        {!isLogged ? (
            <>
                <View style={{ flexGrow: 1, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background, display: webViewShow ? 'flex' : 'none'}}>
                    <Text style={{ fontFamily: 'Rubik700', fontSize: 25, color: Colors.red.color, marginBottom: 15 , textAlign: 'center', textTransform: 'uppercase'}}>Login with your Riot Account</Text>
                    <View style={{ width: '90%', height: '80%', borderRadius: 10, backgroundColor: 'red' }}>
                        <WebView
                            style={{}}
                            source={{ uri: riotAuth }}
                            onNavigationStateChange={(navState) => {
                                const { url } = navState;

                                // Verifica si la URL contiene los tokens
                                if (
                                    url.includes('access_token') &&
                                    url.includes('id_token') &&
                                    url.includes('expires_in')
                                ) {
                                    setShowWebView(false); // Oculta el WebView
                                    extractTokensFromUrl(url); // Extrae los tokens de la URL
                                }
                            }}
                        />
                    </View>
                </View>
                {!webViewShow && (
                    <View style={{ flexGrow: 1, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background}}>
                        <Text style={{ fontFamily: 'Rubik700', fontSize: 25, color: Colors.red.color, marginBottom: 15 , textAlign: 'center', textTransform: 'uppercase'}}>Fetching data...</Text>
                    </View>
                )}
            </>
        ) : (
            <Redirect href='/(tabs)/store'/>
        )}
    </>
);};
