import { Tabs } from "expo-router";
import React from "react";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="store" // Establece la pestaña "store" como la pantalla predeterminada
      screenOptions={{
        tabBarActiveBackgroundColor: Colors.dark.tabBar,
        tabBarInactiveBackgroundColor: Colors.dark.tabBar,
        headerShown: false,
        tabBarStyle: {
          height: 62,
          backgroundColor: Colors.dark.tabBar,
          borderColor: Colors.dark.tabBar,
          paddingBottom: 0,
          paddingTop: 3,
          boxShadow: "0px -10px 30px 2px rgba(0,0,0,0.6)",
        },
      }}
    >
      <Tabs.Screen
        name="store"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? Colors.accent.color : Colors.dark.text,
                fontFamily: "Rubik600",
                fontSize: 12,
              }}
            >
              Store
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name="home"
              color={focused ? Colors.accent.color : Colors.dark.text}
              style={{ fontSize: 26 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="skins"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? Colors.accent.color : Colors.dark.text,
                fontFamily: "Rubik600",
                fontSize: 12,
              }}
            >
              Skins
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name="search"
              color={focused ? Colors.accent.color : Colors.dark.text}
              style={{ fontSize: 25 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? Colors.accent.color : Colors.dark.text,
                fontFamily: "Rubik600",
                fontSize: 12,
              }}
            >
              Account
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name="person-circle"
              color={focused ? Colors.accent.color : Colors.dark.text}
              style={{ fontSize: 28 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
