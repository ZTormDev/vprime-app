import * as Device from 'expo-device';
import Constants from "expo-constants"; // Optional
import { Platform } from 'react-native';
import { useState, useEffect, useRef } from "react";

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  Notifications = {
    scheduleNotificationAsync: async () => {},
    setNotificationHandler: () => {},
    getPermissionsAsync: async () => ({ status: 'undetermined' }),
    requestPermissionsAsync: async () => ({ status: 'undetermined' }),
    getExpoPushTokenAsync: async () => ({ data: '' }),
    setNotificationChannelAsync: async () => {},
    addNotificationReceivedListener: () => ({ remove: () => {} }),
    addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
    removeNotificationSubscription: () => {},
    AndroidImportance: {
      MAX: 5
    },
    AndroidAudioUsage: {
      ALARM: 4
    },
    AndroidAudioContentType: {
      SONIFICATION: 4
    }
  };
}

export async function pushNotification(title: string, body: any, trigger: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      ...(body ? { body: body } : {}),
      sound: "notification.wav",
    },
    trigger: trigger,
  });
}

// Función para programar notificación a las 24:00 UTC
export async function scheduleDailyNotification(title: string, trigger: number, body?: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body ?? 'Check out the new store items! 🛒🔥',
      sound: "notification.wav",
    },
    trigger: {
      seconds: trigger,
      repeats: false,
    },
    identifier: 'storeNotificationTask',
  });
}


export interface PushNotificationState {
  expoPushToken?: any;
  notification?: any;
}

export const usePushNotifications = (): PushNotificationState => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldSetBadge: true,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<any>();

  const [notification, setNotification] = useState<any>();



  async function registerForPushNotificationsAsync() {
    let token;
    try {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          console.warn("Failed to get push token for push notification: Permission not granted");
          return;
        }

        token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas.projectId,
        });
      } else {
        console.warn("Must be using a physical device for Push notifications");
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          lightColor: "#FF231F7C",
          sound: "notification.wav",
          audioAttributes: {
            usage: Notifications.AndroidAudioUsage.ALARM,
            contentType: Notifications.AndroidAudioContentType.SONIFICATION,
          },
        });
      }
    } catch (err: any) {
      const errMsg = err?.toString() || "";
      if (errMsg.includes("SERVICE_NOT_AVAILABLE")) {
        console.log("Push notifications are disabled in this environment (Google Play Services unavailable).");
      } else {
        console.warn("Error registering for push notifications:", err);
      }
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) setExpoPushToken(token);
      })
      .catch((err) => {
        console.warn("Failed to register push notifications in hook:", err);
      });

    const notificationSubscription =
      Notifications.addNotificationReceivedListener((notification: any) => {
        setNotification(notification);
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        // console.log(response);
      });

    return () => {
      if (notificationSubscription && typeof notificationSubscription.remove === "function") {
        notificationSubscription.remove();
      }
      if (responseSubscription && typeof responseSubscription.remove === "function") {
        responseSubscription.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};


export let notificationsEnabled = true;
export const setNotificationsEnabled = (value: boolean) => {
  notificationsEnabled = value;
  
};