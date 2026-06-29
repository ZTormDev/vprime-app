import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { AppBlurView } from "@/src/components/common/AppBlurView";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useTheme } from "@/src/hooks/useTheme";

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, theme, accent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.tabBarContainer}>
      <AppBlurView
        tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
        intensity={72}
        style={StyleSheet.absoluteFill}
      />
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let label = "Store";
        let iconName: any = isFocused ? "bag" : "bag-outline";
        let iconSize = 23;

        if (route.name === "skins") {
          label = "Skins";
          iconName = isFocused ? "sparkles" : "sparkles-outline";
        } else if (route.name === "profile") {
          label = "Account";
          iconName = isFocused ? "person-circle" : "person-circle-outline";
          iconSize = 25;
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <TabBarIcon
              name={iconName}
              color={isFocused ? accent.blue : colors.subtle}
              style={{ fontSize: iconSize }}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? colors.text : colors.subtle },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="store"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="store" />
      <Tabs.Screen name="skins" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    tabBarContainer: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 12,
      height: 70,
      flexDirection: "row",
      overflow: "hidden",
      backgroundColor: Platform.OS === "android" ? colors.tabBar : "transparent",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 26,
      paddingBottom: Platform.OS === "android" ? 0 : 4,
      shadowColor: "#000000",
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 18,
    },
    tabItem: {
      flex: 1,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      gap: 2,
    },
    tabLabel: {
      fontFamily: "Rubik600",
      fontSize: 11,
    },
  });
}
