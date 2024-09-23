import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image, ScrollViewBase } from "react-native";
import { WebView } from "react-native-webview";
import { jwtDecode } from "jwt-decode";
import React from "react";
import axios from "axios";
import { getGameSkins, getSkinImage, getSkinName } from "../API/valorant-api";
import AsyncStorage from "@react-native-async-storage/async-storage";



const riotAuth =
  "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
}


const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={{ backgroundColor: '#ff4e4e', padding: 5, paddingHorizontal: 35, borderRadius: 5}} onPress={onPress}>
      <Text style={{ fontFamily: 'OswaldBold', fontSize: 35, fontWeight: 'normal', color: 'white', margin: 0}}>{title}</Text>
    </TouchableOpacity>
  );
};

// Componente para renderizar cada skin de la tienda
const StoreSkin = ({ storeSkin, storeSkinPrice }: { storeSkin: string, storeSkinPrice: any }) => {
  const [skinName, setSkinName] = useState<string | undefined>(undefined);
  const [skinImage, setSkinImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Llamar a las funciones asíncronas y manejar las promesas
    const fetchSkinDetails = async () => {
      const name = await getSkinName(storeSkin);
      const image = await getSkinImage(storeSkin);

      setSkinName(name);
      setSkinImage(image);
    };

    fetchSkinDetails();
  }, [storeSkin]);

  return (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.075)', width: '90%', alignItems: 'center', justifyContent: 'flex-start', borderRadius: 10, padding: 15,}}>
      {skinName && storeSkinPrice && skinImage ? (
        <>
          <View style={{ width: '100%', display: "flex", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20,}}>
            <Text style={{ fontFamily: 'Rubik400' , color: 'white', fontSize: 22,  flex: 1, fontWeight: 500}}>{skinName}</Text>
            <Text style={{ fontFamily: 'Rubik700' , color: 'white', fontSize: 20, fontWeight: 500, backgroundColor: '#fc4e4e', paddingHorizontal: 10, borderRadius: 5}}>{storeSkinPrice} VP</Text>
          </View>

          <Image source={{ uri: skinImage }} style={{ width: '80%', resizeMode: 'contain', aspectRatio: 16/9, }} />
        </>
      ) : (
        <Text style={{ fontFamily: 'Rubik400', fontSize: 25, color: 'white' }}>Loading...</Text>
      )}
    </View>
  );
};

export default function Store() {
  const [tokens, setTokens] = useState({ accessToken: "", idToken: "", expiresIn: "" });
  const [storeData, setStoreData] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(""); 
  const [playerUUID, setPlayerUUID] = useState("");
  const [entitlementToken, setEntitlementToken] = useState("");

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


  

  // Función para obtener la tienda del jugador
  const fetchStoreData = async (entitlementToken: string, accessToken: string, playerUUID: string) => {
    const shard = "na"; // Puedes cambiar esto basado en la región del jugador
    const clientPlatform = "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9";

    try {
      const versionResponse = await axios.get('https://valorant-api.com/v1/version');
      const riotClientVersion = versionResponse.data.data.riotClientVersion;

      const response = await axios.get(
        `https://pd.${shard}.a.pvp.net/store/v2/storefront/${playerUUID}`,
        {
          headers: {
            "X-Riot-ClientPlatform": clientPlatform,
            "X-Riot-ClientVersion": riotClientVersion, // Actualiza a la versión del cliente que estés usando
            "X-Riot-Entitlements-JWT": entitlementToken,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setStoreData(response.data.SkinsPanelLayout.SingleItemStoreOffers);
    } catch (error) {
      console.error("Error fetching store data:", error);
    }
  };
  

  const getStoreTimeRemaining = () => {
    const now = new Date();
    
    // Hora actual en UTC
    const nowUTC = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    );
  
    // Establecer la fecha y hora objetivo en UTC (9:00 PM UTC)
    const targetTimeUTC = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      24, // 9 PM (chile) 12am (UTC)
      0,  // Minutos
      0   // Segundos
    );
  
    // Si la hora actual ya pasó las 9 PM UTC, calcular para el siguiente día
    if (nowUTC > targetTimeUTC) {
      targetTimeUTC.setUTCDate(nowUTC.getUTCDate() + 1); // Sumar un día
    }
  
    // Calcular la diferencia en milisegundos
    const timeDifference = targetTimeUTC.getTime() - nowUTC.getTime();
  
    // Convertir a horas, minutos y segundos
    const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((timeDifference % (1000 * 60)) / 1000);
  
    // Usamos padStart para asegurar que se muestre con dos dígitos
    const formattedHours = String(hoursRemaining).padStart(2, "0");
    const formattedMinutes = String(minutesRemaining).padStart(2, "0");
    const formattedSeconds = String(secondsRemaining).padStart(2, "0");
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };
  
  

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getStoreTimeRemaining());
    }, 1000); // Actualizar cada segundo

    // Limpiar el intervalo cuando se desmonte el componente
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getAllData = async () => {
      try {
        // Verificar que todos los valores estén disponibles
        if (tokens.accessToken && playerUUID && entitlementToken) {
          fetchStoreData(entitlementToken, tokens.accessToken, playerUUID);
        }
      } catch (error) {
        console.error("Error checking login status", error);
      }
    };
  
    getAllData();
  }, [tokens.accessToken, playerUUID, entitlementToken]); // Dependencias
  
  
  return (
    <View style={{ flexGrow: 1, width: '100%', backgroundColor: '#252525' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
        {tokens.accessToken && storeData && (
          <ScrollView style={{ width: '100%', marginBottom: 40,}}>
            <Text style={{ fontFamily: 'Rubik500', color: 'white', textAlign: 'center', fontSize: 45, margin: 25}}>Your Store</Text>
            <View style={{ alignItems: 'center', gap: 35,}}>
              <View style={{ alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{ fontFamily: 'Rubik400', color: '#e1e1e1', textAlign: 'center', fontSize: 22}}>Next Store In:</Text>
                <Text style={{ fontFamily: 'Rubik700', color: '#fc4e4e', textAlign: 'center', fontSize: 25, marginTop: -10}}>{timeRemaining}</Text>
              </View>
              {storeData.map((storeSkin, index) => {
                const skinPrice: any = Object.values(storeSkin.Cost)[0]; // Extraer el primer valor de los costos si es un objeto con múltiples precios
                return <StoreSkin key={index} storeSkin={storeSkin.OfferID} storeSkinPrice={skinPrice} />;
              })}
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

