import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from "expo-constants"; // Optional
import { Platform } from 'react-native';
import { useState, useEffect, useRef } from "react";

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
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({shouldPlaySound: true,shouldShowAlert: true,shouldSetBadge: true,}),
  });

  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

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

    console.log(token);

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
        console.log(response);
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