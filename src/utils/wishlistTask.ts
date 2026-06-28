import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { pushNotification } from "../../API/notifications-api";

const BACKGROUND_WISHLIST_CHECK = "BACKGROUND_WISHLIST_CHECK";

// Register the background task
TaskManager.defineTask(BACKGROUND_WISHLIST_CHECK, async () => {
  console.log("[Background Fetch] Running wishlist storefront check task...");
  try {
    const accessToken = await SecureStore.getItemAsync("accessToken");
    const idToken = await SecureStore.getItemAsync("idToken");
    const playerUUID = await AsyncStorage.getItem("playerUUID");
    const shard = await AsyncStorage.getItem("shard");
    const storageWishlist = await AsyncStorage.getItem("wishListSkins");

    if (!accessToken || !idToken || !playerUUID || !shard || !storageWishlist) {
      console.log("[Background Fetch] Missing auth credentials or wishlist. Skipping.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const wishListSkins = JSON.parse(storageWishlist);
    if (wishListSkins.length === 0) {
      console.log("[Background Fetch] Wishlist is empty. Skipping.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 1. Get Entitlement Token
    const entitlementsRes = await axios.post(
      "https://entitlements.auth.riotgames.com/api/token/v1",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const entitlementsToken = entitlementsRes.data.entitlements_token;

    // 2. Query Storefront
    const storeRes = await axios.request({
      url: `https://pd.${shard}.a.pvp.net/store/v3/storefront/${playerUUID}`,
      method: "POST",
      headers: {
        "X-Riot-ClientVersion": "43.0.1.4195386.4190634",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Riot-Entitlements-JWT": entitlementsToken,
      },
      data: {},
    });

    const storefront = storeRes.data;
    if (!storefront.SkinsPanelLayout || !storefront.SkinsPanelLayout.SingleItemStoreOffers) {
      console.log("[Background Fetch] Storefront response missing skins layout.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const dailyOffers = storefront.SkinsPanelLayout.SingleItemStoreOffers;

    // 3. Match against wishlist
    const foundSkins = wishListSkins.filter((wishSkin: any) => {
      const levelUuid = wishSkin.levels?.[0]?.uuid;
      return dailyOffers.includes(levelUuid) || dailyOffers.includes(wishSkin.uuid);
    });

    if (foundSkins.length > 0) {
      const skinNames = foundSkins.map((s: any) => s.displayName).join(", ");
      console.log(`[Background Fetch] Found wishlisted skins: ${skinNames}! Triggering notification.`);
      await pushNotification(
        "Wishlist skin in shop! 🎯",
        `The following skins are available in your shop today: ${skinNames}!`,
        null
      );
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    console.log("[Background Fetch] No wishlisted skins found in daily shop today.");
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error("[Background Fetch] Error checking wishlist shop:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Helper function to register the task dynamically
export async function registerBackgroundWishlistTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WISHLIST_CHECK);
    if (!isRegistered) {
      // Configure task to run every 12 hours (minimum interval is around 15 minutes in iOS/Android backgrounds)
      await BackgroundFetch.registerTaskAsync(BACKGROUND_WISHLIST_CHECK, {
        minimumInterval: 12 * 60 * 60, // 12 hours
        stopOnTerminate: false,        // Keep running if device restarts
        startOnBoot: true,             // Run task when system boots up
      });
      console.log("[Background Task] Successfully registered background wishlist check.");
    } else {
      console.log("[Background Task] Background wishlist check task is already registered.");
    }
  } catch (err) {
    console.warn("[Background Task] Failed to register background fetch task:", err);
  }
}
