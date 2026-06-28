import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";

const tabLabelStyle = (focused: boolean) => ({
  color: focused ? Colors.dark.text : Colors.dark.subtle,
  fontFamily: "Rubik600",
  fontSize: 11,
  marginTop: -3,
});

const tabIconColor = (focused: boolean) =>
  focused ? Colors.accent.blue : Colors.dark.subtle;

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="store"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 12,
          height: 70,
          backgroundColor: Colors.dark.tabBar,
          borderTopWidth: 1,
          borderWidth: 1,
          borderColor: Colors.dark.border,
          borderRadius: 26,
          paddingBottom: Platform.OS === "android" ? 9 : 12,
          paddingTop: 9,
          shadowColor: Colors.shadow.color,
          shadowOpacity: Colors.shadow.mediumOpacity,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 10 },
          elevation: 18,
        },
        tabBarItemStyle: {
          borderRadius: 22,
          marginHorizontal: 5,
        },
      }}
    >
      <Tabs.Screen
        name="store"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={tabLabelStyle(focused)}>Store</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? "bag" : "bag-outline"}
              color={tabIconColor(focused)}
              style={{ fontSize: 25 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="skins"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={tabLabelStyle(focused)}>Skins</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? "sparkles" : "sparkles-outline"}
              color={tabIconColor(focused)}
              style={{ fontSize: 25 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={tabLabelStyle(focused)}>Account</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              color={tabIconColor(focused)}
              style={{ fontSize: 27 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
