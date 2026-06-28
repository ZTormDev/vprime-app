import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  accessToken: string | null;
  idToken: string | null;
  playerUUID: string | null;
  shard: string | null;
  expiresIn: string | null;
  gameName: string | null;
  tagline: string | null;
  isLogged: boolean | null;
  isRestoring: boolean;
  setSession: (
    accessToken: string,
    idToken: string,
    playerUUID: string,
    shard: string,
    expiresIn: string,
    gameName: string,
    tagline: string
  ) => Promise<void>;
  clearSession: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  idToken: null,
  playerUUID: null,
  shard: null,
  expiresIn: null,
  gameName: null,
  tagline: null,
  isLogged: null,
  isRestoring: true,

  setSession: async (
    accessToken,
    idToken,
    playerUUID,
    shard,
    expiresIn,
    gameName,
    tagline
  ) => {
    try {
      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("idToken", idToken);
      await AsyncStorage.setItem("playerUUID", playerUUID);
      await AsyncStorage.setItem("shard", shard);
      await AsyncStorage.setItem("expiresIn", expiresIn);
      await AsyncStorage.setItem("gameName", gameName);
      await AsyncStorage.setItem("tagline", tagline);

      set({
        accessToken,
        idToken,
        playerUUID,
        shard,
        expiresIn,
        gameName,
        tagline,
        isLogged: true,
        isRestoring: false,
      });
    } catch (error) {
      console.error("Error saving auth session:", error);
    }
  },

  clearSession: async () => {
    try {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("idToken");
      await AsyncStorage.removeItem("playerUUID");
      await AsyncStorage.removeItem("shard");
      await AsyncStorage.removeItem("expiresIn");
      await AsyncStorage.removeItem("gameName");
      await AsyncStorage.removeItem("tagline");

      set({
        accessToken: null,
        idToken: null,
        playerUUID: null,
        shard: null,
        expiresIn: null,
        gameName: null,
        tagline: null,
        isLogged: false,
        isRestoring: false,
      });
    } catch (error) {
      console.error("Error clearing auth session:", error);
    }
  },

  restoreSession: async () => {
    set({ isRestoring: true });
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const idToken = await SecureStore.getItemAsync("idToken");
      const playerUUID = await AsyncStorage.getItem("playerUUID");
      const shard = await AsyncStorage.getItem("shard");
      const expiresIn = await AsyncStorage.getItem("expiresIn");
      const gameName = await AsyncStorage.getItem("gameName");
      const tagline = await AsyncStorage.getItem("tagline");

      if (accessToken && idToken && playerUUID && shard) {
        set({
          accessToken,
          idToken,
          playerUUID,
          shard,
          expiresIn,
          gameName,
          tagline,
          isLogged: true,
          isRestoring: false,
        });
        return true;
      }
    } catch (error) {
      console.error("Error restoring auth session:", error);
    }
    set({ isLogged: false, isRestoring: false });
    return false;
  },
}));
