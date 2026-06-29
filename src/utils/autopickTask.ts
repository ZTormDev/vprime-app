import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { ValorantApiService } from "../../API/valorant-api";
import * as Notifications from "expo-notifications";

export const BACKGROUND_AUTOPICK_TASK = "BACKGROUND_AUTOPICK_TASK";

const GLZ_REGIONS = ["na", "latam", "br", "eu", "ap", "kr"];

function getRegionCandidates(shard?: string | null) {
  const preferred = shard && GLZ_REGIONS.includes(shard) ? shard : "na";
  return [preferred, ...GLZ_REGIONS.filter((region) => region !== preferred)];
}

export async function runAutopickCheckOnce() {
  console.log("[Background Autopick] Checking for active pregame lobby...");

  const accessToken = await SecureStore.getItemAsync("accessToken");
  const playerUUID = await AsyncStorage.getItem("playerUUID");
  const shard = await AsyncStorage.getItem("shard");
  
  const autopickActive = (await AsyncStorage.getItem("autoPickEnabled")) === "true";
  const queueAlertActive = (await AsyncStorage.getItem("queueAlertEnabled")) === "true";
  const selectedAgentId = await AsyncStorage.getItem("autopickAgentId");

  if (!accessToken || !playerUUID || !shard) {
    console.log("[Background Autopick] Missing credentials. Skipping.");
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  if (!autopickActive && !queueAlertActive) {
    console.log("[Background Autopick/Alert] Neither task is active. Skipping.");
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  // Fetch entitlements token
  const entitlementsToken = await ValorantApiService.fetchEntitlementsToken(accessToken);
  if (!entitlementsToken) {
    console.log("[Background Autopick] Failed to fetch entitlements. Skipping.");
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }

  const regionCandidates = getRegionCandidates(shard);

  for (const candidateRegion of regionCandidates) {
    const request = {
      region: candidateRegion,
      shard: shard,
      playerUuid: playerUUID,
      accessToken,
      entitlementsToken,
    };

    try {
      const pregamePlayer = await ValorantApiService.fetchPreGamePlayer(request);
      const matchId = pregamePlayer?.MatchID || pregamePlayer?.MatchId || pregamePlayer?.matchId || "";

      if (matchId) {
        console.log(`[Background Autopick] Found pregame match: ${matchId} in region ${candidateRegion}.`);

        // Dodge Preventer Alert
        if (queueAlertActive) {
          const lastAlertedMatchId = await AsyncStorage.getItem("lastAlertedMatchId");
          if (matchId !== lastAlertedMatchId) {
            await AsyncStorage.setItem("lastAlertedMatchId", matchId);
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "🎯 ¡PARTIDA ENCONTRADA!",
                body: "Lobby de selección de agente activo. ¡Regresa a tu PC!",
                sound: "alarm.wav",
              },
              trigger: null,
            });
          }
        }

        // Autopick locking
        if (autopickActive && selectedAgentId) {
          console.log(`[Background Autopick] Locking agent: ${selectedAgentId}`);
          // Try to select agent
          await ValorantApiService.selectPreGameAgent(request, matchId, selectedAgentId);
          // Try to lock agent
          await ValorantApiService.lockPreGameAgent(request, matchId, selectedAgentId);

          const lastLockedMatchId = await AsyncStorage.getItem("lastLockedMatchId");
          if (matchId !== lastLockedMatchId) {
            await AsyncStorage.setItem("lastLockedMatchId", matchId);
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Autopick Locked!",
                body: `Locked agent in the background. Good luck!`,
                sound: "notification.wav",
              },
              trigger: null,
            });
          }
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
      }
    } catch (e: any) {
      // Quietly ignore or log failure for candidate region
    }
  }

  return BackgroundFetch.BackgroundFetchResult.NoData;
}

TaskManager.defineTask(BACKGROUND_AUTOPICK_TASK, async () => {
  try {
    const res = await runAutopickCheckOnce();
    return res;
  } catch (error) {
    console.error("[Background Autopick] Task failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundAutopickTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_AUTOPICK_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_AUTOPICK_TASK, {
        minimumInterval: 10, // 10 seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("[Background Autopick] Task registered successfully.");
    }
  } catch (e) {
    console.error("[Background Autopick] Registration failed:", e);
  }
}

export async function unregisterBackgroundAutopickTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_AUTOPICK_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_AUTOPICK_TASK);
      console.log("[Background Autopick] Task unregistered.");
    }
  } catch (e) {
    console.error("[Background Autopick] Unregistration failed:", e);
  }
}
