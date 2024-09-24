import { useState, useEffect } from "react";
import { View, ScrollView, Text, Image, TouchableHighlight } from 'react-native';
import React from "react";
import axios from "axios";
import { getSkin, parseShop, storeSkins } from "../API/valorant-api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import { Video, ResizeMode } from 'expo-av';

export default function Store() {
  const [tokens, setTokens] = useState({ accessToken: "", idToken: "", expiresIn: "" });
  const [storeData, setStoreData] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(""); 
  const [playerUUID, setPlayerUUID] = useState("");
  const [entitlementToken, setEntitlementToken] = useState("");
  const [isSkinPanelShown, setSkinPanelShown] = useState<boolean | null>(null);
  const [skinPreview, setSkinPreview] = useState<any>(null); // or use a more specific type
  const [videoPreview, setVideoPreview] = useState<any>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const accessToken = (await AsyncStorage.getItem('accessToken')) ?? "";
        const idToken = (await AsyncStorage.getItem('idToken')) ?? "";
        const expiresIn = (await AsyncStorage.getItem('expiresIn')) ?? "";
        const playerUUID = (await AsyncStorage.getItem('playerUUID')) ?? "";
        const entitlementToken = (await AsyncStorage.getItem('entitlementToken')) ?? "";

        setEntitlementToken(entitlementToken);
        setPlayerUUID(playerUUID);
        setTokens({ accessToken, idToken, expiresIn });
      } catch (error) {
        console.error('Error al obtener los tokens de AsyncStorage:', error);
      }
    };
  
    fetchTokens();
  }, []);

  const fetchStoreData = async (entitlementToken: string, accessToken: string, playerUUID: string) => {
    const shard = "na";
    const clientPlatform = "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9";

    try {
      const versionResponse = await axios.get('https://valorant-api.com/v1/version');
      const riotClientVersion = versionResponse.data.data.riotClientVersion;

      const response = await axios.get(
        `https://pd.${shard}.a.pvp.net/store/v2/storefront/${playerUUID}`,
        {
          headers: {
            "X-Riot-ClientPlatform": clientPlatform,
            "X-Riot-ClientVersion": riotClientVersion,
            "X-Riot-Entitlements-JWT": entitlementToken,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      await parseShop(response.data)
      .then(() => {
        setStoreData(storeSkins);
      });

    } catch (error) {
      console.error("Error fetching store data:", error);
    }
  };

  const getStoreTimeRemaining = () => {
    const now = new Date();
    const nowUTC = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    );
  
    const targetTimeUTC = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      24,
      0,
      0
    );
  
    if (nowUTC > targetTimeUTC) {
      targetTimeUTC.setUTCDate(nowUTC.getUTCDate() + 1);
    }
  
    const timeDifference = targetTimeUTC.getTime() - nowUTC.getTime();
    const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((timeDifference % (1000 * 60)) / 1000);
  
    const formattedHours = String(hoursRemaining).padStart(2, "0");
    const formattedMinutes = String(minutesRemaining).padStart(2, "0");
    const formattedSeconds = String(secondsRemaining).padStart(2, "0");
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getStoreTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getAllData = async () => {
      try {
        if (tokens.accessToken && playerUUID && entitlementToken) {
          fetchStoreData(entitlementToken, tokens.accessToken, playerUUID);
        }
      } catch (error) {
        console.error("Error checking login status", error);
      }
    };
  
    getAllData();
  }, [tokens.accessToken, playerUUID, entitlementToken]);

  const showSkinPanel = async (show: boolean, skinUUID: any) => {
    
    if(show){
      const skin = await getSkin(skinUUID);
      setSkinPreview(skin);

      const lastLevel: any = Object.keys(skin.levels).sort().reverse()[0];

      setVideoPreview(skin.levels[lastLevel].streamedVideo);

      setSkinPanelShown(show);
    }
    else {
      setSkinPanelShown(show);
    }
  }

  return (
    <View style={{ flexGrow: 1, width: '100%', backgroundColor: '#252525'}}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", zIndex: 1}}>
        {tokens.accessToken && storeData && (
          <ScrollView style={{ width: '100%', marginBottom: 40,}}>
            <Text style={{ fontFamily: 'Rubik500', color: 'white', textAlign: 'center', fontSize: 45, margin: 25}}>Your Store</Text>
            <View style={{ alignItems: 'center', gap: 35,}}>
              <View style={{ alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{ fontFamily: 'Rubik400', color: '#e1e1e1', textAlign: 'center', fontSize: 22}}>Next Store In:</Text>
                <Text style={{ fontFamily: 'Rubik700', color: '#fc4e4e', textAlign: 'center', fontSize: 25, marginTop: -10}}>{timeRemaining}</Text>
              </View>
              {storeSkins.map((skin) => 
                <TouchableHighlight key={skin.uuid} activeOpacity={0.25} underlayColor={Colors.red.color} onPress={() => showSkinPanel(true, skin.levels[0].uuid)} style={{ backgroundColor: 'rgba(255,255,255,0.075)', width: '90%', alignItems: 'center', justifyContent: 'flex-start', borderRadius: 15, padding: 15,}}>
                  <View style={{alignItems: 'center', justifyContent: 'flex-start'}}>
                    <View style={{ width: '100%', display: "flex", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20,}}>
                      <Text style={{ fontFamily: 'Rubik400' , color: 'white', fontSize: 22,  flex: 1, fontWeight: 500}}>{skin.displayName}</Text>
                      <Text style={{ fontFamily: 'Rubik700' , color: 'white', fontSize: 20, fontWeight: 500, backgroundColor: '#fc4e4e', paddingHorizontal: 10, borderRadius: 5}}>{skin.Cost} VP</Text>
                    </View>
                    <View>
                      <Image source={{uri: skin.chromas[0].displayIcon}} style={{ width: '80%', resizeMode: 'contain', aspectRatio: 16/9, }} />
                    </View>
                  </View>
                </TouchableHighlight> 
              )}
            </View>
          </ScrollView>
        )}
      </ScrollView>
      {isSkinPanelShown && 
        <View style={{ 
          backgroundColor: 'rgba(0,0,0,0.75)', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 10
        }}>
          <View style={{ backgroundColor: Colors.dark.background, zIndex: 11, width: '95%', justifyContent: 'center', alignItems: 'center', padding: 25, borderRadius: 20, gap: 10}}>
            <Text style={{ fontFamily: 'Rubik500', color: 'white', fontSize: 28, textAlign: 'center' }}>{skinPreview.displayName}</Text>
            <Video
              ref={null}
              style={{ width: '100%', aspectRatio: 16/12, borderRadius: 5 }}
              source={{
                uri: videoPreview,
              }}
              useNativeControls={false}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay
              isMuted={false}
              volume={1}
            />
            <TouchableHighlight onPress={() => showSkinPanel(false, null)} activeOpacity={0.5} underlayColor='#ff8888' style={{marginTop: 30, backgroundColor: '#ff5454', borderRadius: 50, padding: 6, width: '100%' }}>
              <Text style={{ fontFamily: 'Rubik500', color: 'white', fontSize: 23, textAlign: 'center' }}>Close</Text>
            </TouchableHighlight>
          </View>
        </View>
      }
    </View>
  );
}