import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, View, LogBox } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Ignore known deprecation and environment warnings
LogBox.ignoreLogs([
  "expo-notifications failed to load (expected in Expo Go SDK 53+)",
  "Deep imports from the 'react-native' package are deprecated",
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    if (Platform.OS === 'android') {
      if (NavigationBar && typeof NavigationBar.setVisibilityAsync === 'function') {
        NavigationBar.setVisibilityAsync('visible');
      }
      if (NavigationBar && typeof NavigationBar.setBackgroundColorAsync === 'function') {
        NavigationBar.setBackgroundColorAsync('black');
      }
      if (NavigationBar && typeof NavigationBar.setButtonStyleAsync === 'function') {
        NavigationBar.setButtonStyleAsync('light');
      }
    }
  }, []);

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
    <>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
          <Stack screenOptions={{
            headerShown: false, 
            statusBarHidden: false, 
            statusBarTranslucent: true, 
            statusBarStyle: 'light', 
            statusBarColor: 'black', 
            navigationBarColor: 'black', 
            navigationBarHidden: false,
            contentStyle: {backgroundColor: Colors.dark.background},
            }}>
              
            {isLogged ? (
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false, 
                  statusBarHidden: false, 
                  statusBarTranslucent: true, 
                  statusBarStyle: 'light', 
                  statusBarColor: 'black', 
                  navigationBarColor: 'black', 
                  navigationBarHidden: false,
                }} 
              />
            ) : (
              <Stack.Screen 
                name="index" 
                options={{ 
                  headerShown: false, 
                  statusBarHidden: false, 
                  statusBarTranslucent: true, 
                  statusBarStyle: 'light', 
                  statusBarColor: 'black', 
                  navigationBarColor: 'black', 
                  navigationBarHidden: false 
                }} 
              />
            )}
          </Stack>
        </SafeAreaView>
      </View>
      <StatusBar style="light" hidden={false} translucent={true} />
    </>
  );
}
