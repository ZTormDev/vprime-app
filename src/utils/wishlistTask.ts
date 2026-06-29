import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { pushNotification } from "../../API/notifications-api";

export const BACKGROUND_WISHLIST_CHECK = "BACKGROUND_WISHLIST_CHECK";

type WishlistCheckOptions = {
  forceStoreNotification?: boolean;
  forceWishlistNotification?: boolean;
};

type WishlistCheckResult = {
  result: BackgroundFetch.BackgroundFetchResult;
  matchedSkins: string[];
  storeChanged: boolean;
  reason: string;
};

function normalizeOfferIds(offerIds: string[]) {
  return [...offerIds].sort().join("|");
}

async function areNotificationsEnabled() {
  const storedValue = await AsyncStorage.getItem("Notify");
  return storedValue === null ? true : storedValue === "true";
}

export async function runWishlistStorefrontCheckOnce(
  options: WishlistCheckOptions = {}
): Promise<WishlistCheckResult> {
  console.log("[Background Fetch] Running wishlist storefront check task...");

  const accessToken = await SecureStore.getItemAsync("accessToken");
  const idToken = await SecureStore.getItemAsync("idToken");
  const playerUUID = await AsyncStorage.getItem("playerUUID");
  const shard = await AsyncStorage.getItem("shard");
  const storageWishlist = await AsyncStorage.getItem("wishListSkins");
  const notificationsEnabled = await areNotificationsEnabled();

  if (!accessToken || !idToken || !playerUUID || !shard) {
    console.log("[Background Fetch] Missing auth credentials. Skipping.");
    return {
      result: BackgroundFetch.BackgroundFetchResult.NoData,
      matchedSkins: [],
      storeChanged: false,
      reason: "Missing auth credentials",
    };
  }

  const wishListSkins = storageWishlist ? JSON.parse(storageWishlist) : [];

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

  let clientVersion = "release-09.00-shipping-13-2559641";
  try {
    const versionRes = await axios.get("https://valorant-api.com/v1/version");
    clientVersion = versionRes.data.data.riotClientVersion;
  } catch (versionErr) {
    console.warn("[Background Fetch] Failed to fetch live client version, using default:", versionErr);
  }

  const clientPlatform = btoa(
    JSON.stringify({
      platformType: "PC",
      platformOS: "Windows",
      platformOSVersion: "10.0.19042.1.256.64bit",
      platformChipset: "Unknown",
    })
  );

  const storeRes = await axios.request({
    url: `https://pd.${shard}.a.pvp.net/store/v3/storefront/${playerUUID}`,
    method: "POST",
    headers: {
      "X-Riot-ClientVersion": clientVersion,
      "X-Riot-ClientPlatform": clientPlatform,
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Riot-Entitlements-JWT": entitlementsToken,
    },
    data: {},
  });

  const storefront = storeRes.data;
  if (
    !storefront.SkinsPanelLayout ||
    !storefront.SkinsPanelLayout.SingleItemStoreOffers
  ) {
    console.log("[Background Fetch] Storefront response missing skins layout.");
    return {
      result: BackgroundFetch.BackgroundFetchResult.NoData,
      matchedSkins: [],
      storeChanged: false,
      reason: "Storefront response missing skins layout",
    };
  }

  const dailyOffers = storefront.SkinsPanelLayout.SingleItemStoreOffers;
  const currentOfferSignature = normalizeOfferIds(dailyOffers);
  const previousOfferSignature = await AsyncStorage.getItem("lastDailyOfferIds");
  const storeChanged =
    !!previousOfferSignature && previousOfferSignature !== currentOfferSignature;

  await AsyncStorage.setItem("lastDailyOfferIds", currentOfferSignature);

  const foundSkins = wishListSkins.filter((wishSkin: any) => {
    const levelUuid = wishSkin.levels?.[0]?.uuid;
    return dailyOffers.includes(levelUuid) || dailyOffers.includes(wishSkin.uuid);
  });

  const matchedSkinNames = foundSkins.map((s: any) => s.displayName);

  if (
    notificationsEnabled &&
    (storeChanged || options.forceStoreNotification)
  ) {
    await pushNotification(
      "New daily store is live",
      "Open VPrime to check today's offers.",
      null
    );
  }

  if (
    notificationsEnabled &&
    (matchedSkinNames.length > 0 || options.forceWishlistNotification)
  ) {
    const skinNames =
      matchedSkinNames.length > 0
        ? matchedSkinNames.join(", ")
        : "Test wishlist skin";

    console.log(
      `[Background Fetch] Found wishlisted skins: ${skinNames}. Triggering notification.`
    );
    await pushNotification(
      "Wishlist skin in shop!",
      `The following skins are available in your shop today: ${skinNames}.`,
      null
    );
  }

  if (storeChanged || matchedSkinNames.length > 0) {
    return {
      result: BackgroundFetch.BackgroundFetchResult.NewData,
      matchedSkins: matchedSkinNames,
      storeChanged,
      reason: "Store changed or wishlist skin found",
    };
  }

  console.log("[Background Fetch] No wishlisted skins found in daily shop today.");
  return {
    result: BackgroundFetch.BackgroundFetchResult.NoData,
    matchedSkins: [],
    storeChanged,
    reason: "No changes detected",
  };
}

TaskManager.defineTask(BACKGROUND_WISHLIST_CHECK, async () => {
  try {
    const checkResult = await runWishlistStorefrontCheckOnce();
    return checkResult.result;
  } catch (error) {
    console.error("[Background Fetch] Error checking wishlist shop:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundWishlistTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_WISHLIST_CHECK
    );

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_WISHLIST_CHECK, {
        minimumInterval: 12 * 60 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log(
        "[Background Task] Successfully registered background wishlist check."
      );
    } else {
      console.log(
        "[Background Task] Background wishlist check task is already registered."
      );
    }
  } catch (err) {
    console.warn("[Background Task] Failed to register background fetch task:", err);
  }
}
