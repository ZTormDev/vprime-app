import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Rubik300: require("../assets/fonts/Rubik-Light.ttf"),
    Rubik400: require("../assets/fonts/Rubik-Regular.ttf"),
    Rubik500: require("../assets/fonts/Rubik-Medium.ttf"),
    Rubik600: require("../assets/fonts/Rubik-SemiBold.ttf"),
    Rubik700: require("../assets/fonts/Rubik-Bold.ttf"),
    Rubik800: require("../assets/fonts/Rubik-ExtraBold.ttf"),
    Rubik900: require("../assets/fonts/Rubik-Black.ttf"),
  });

  const [isLogged, setIsLogged] = useState<boolean | null>(null); // Estado de autenticación

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('accessToken');
        setIsLogged(userToken !== null); // Si hay token, el usuario está logueado
      } catch (error) {
        console.error("Error checking login status", error);
        setIsLogged(false); // Si hay un error, asumimos que no está logueado
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (loaded && isLogged !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLogged]);

  if (!loaded || isLogged === null) {
    return null; // Muestra una pantalla de carga mientras se verifica el estado del login
  }

  return (
    <Stack screenOptions={{
      headerShown: false, 
      statusBarHidden: false, 
      statusBarTranslucent: false, 
      statusBarStyle: 'auto', 
      statusBarColor: 'black', 
      navigationBarColor: 'black', 
      navigationBarHidden: false }}>
        
      {isLogged ? (
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false, 
            statusBarHidden: false, 
            statusBarTranslucent: false, 
            statusBarStyle: 'auto', 
            statusBarColor: 'black', 
            navigationBarColor: 'black', 
            navigationBarHidden: false 
          }} 
        />
      ) : (
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false, 
            statusBarHidden: false, 
            statusBarTranslucent: false, 
            statusBarStyle: 'auto', 
            statusBarColor: 'black', 
            navigationBarColor: 'black', 
            navigationBarHidden: false 
          }} 
        />
      )}
    </Stack>
  );
}
