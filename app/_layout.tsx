import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, View, LogBox } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { OfflineBanner } from '../src/components/common/OfflineBanner';

// Ignore known deprecation and environment warnings
LogBox.ignoreLogs([
  "expo-notifications failed to load (expected in Expo Go SDK 53+)",
  "Deep imports from the 'react-native' package are deprecated",
  "expo-background-fetch: This library is deprecated. Use expo-background-task instead.",
  "`Background Fetch` functionality is not available in Expo Go",
  "On iOS `VideoPlayer.replace` loads the asset data synchronously",
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

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

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        const NavigationBarAndroid = NavigationBar as any;
        if (NavigationBarAndroid && typeof NavigationBarAndroid.setBackgroundColorAsync === 'function') {
          NavigationBarAndroid.setVisibilityAsync('visible');
          NavigationBarAndroid.setBackgroundColorAsync('black');
          NavigationBarAndroid.setButtonStyleAsync('dark');
        }
      } catch (err) {
        console.warn("Failed to set native navigation bar color:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
          <OfflineBanner />
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
            <Stack screenOptions={{
              headerShown: false, 
              contentStyle: {backgroundColor: Colors.dark.background},
              }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaView>
        </View>
        <StatusBar style="light" hidden={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
