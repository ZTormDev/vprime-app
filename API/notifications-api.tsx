import * as Device from 'expo-device';
import Constants from "expo-constants"; // Optional
import { Platform } from 'react-native';
import { useState, useEffect, useRef } from "react";

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.log("expo-notifications failed to load (expected in Expo Go SDK 53+). Push notifications will be disabled in this environment.");
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
    handleNotification: async () => ({shouldPlaySound: true,shouldShowAlert: true,shouldSetBadge: true,}),
  });

  const [expoPushToken, setExpoPushToken] = useState<any>();

  const [notification, setNotification] = useState<any>();

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification");
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });
    } else {
      alert("Must be using a physical device for Push notifications");
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        lightColor: "#FF231F7C",
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.ALARM,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
      });
    }

    // console.log(token);

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current!
      );

      Notifications.removeNotificationSubscription(responseListener.current!);
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