import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="store"  // Establece la pestaña "store" como la pantalla predeterminada
      screenOptions={{
        tabBarActiveBackgroundColor: Colors.dark.tabBar,
        tabBarInactiveBackgroundColor: Colors.dark.tabBar,
        headerShown: false,
        headerTitle: 'a',
        tabBarStyle: {
          height: 65,
          backgroundColor: Colors.dark.tabBar,
          borderColor: Colors.dark.tabBar,
          paddingBottom: 3,
          paddingTop: 5
        }
      }}>
      <Tabs.Screen
        name="store"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.red.color : Colors.dark.text,
              fontFamily: 'Rubik600',
              fontSize: 14
            }}>
              Store
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name='home' color={focused ? Colors.red.color : Colors.dark.text} style={{ fontSize: 28 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="skins"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.red.color : Colors.dark.text,
              fontFamily: 'Rubik600',
              fontSize: 14
            }}>
              Skins
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name='search' color={focused ? Colors.red.color : Colors.dark.text} style={{ fontSize: 28 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.red.color : Colors.dark.text,
              fontFamily: 'Rubik600',
              fontSize: 14
            }}>
              Account
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name='person-circle' color={focused ? Colors.red.color : Colors.dark.text} style={{ fontSize: 30 }} />
          ),
        }}
      />
    </Tabs>
  );
}
