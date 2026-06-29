import {
  StyleSheet,
  Image,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Text } from "react-native";
import { isInWishList } from "../../API/valorant-api";
import { useShopStore } from "../../src/store/useShopStore";
import { useNavigation } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SkinPreview } from "@/components/SkinPreview";
import { LinearGradient } from "expo-linear-gradient";
import { AppBlurView } from "@/src/components/common/AppBlurView";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useTheme } from "@/src/hooks/useTheme";

export default function SkinsScreen() {
  const skins = useShopStore((state) => state.skins);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleSkins, setVisibleSkins] = useState(skins);
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  const { colors, theme, accent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, accent), [colors, accent]);

  useEffect(() => {
    setVisibleSkins(skins);
  }, [skins]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setSelectedSkin(null);
      setSearchQuery("");
      setVisibleSkins(skins);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });

    return unsubscribe;
  }, [navigation, skins]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const searchTerms = query.toLowerCase().split(" ").filter(Boolean);

    if (searchTerms.length === 0) {
      setVisibleSkins(skins);
    } else {
      const filteredSkins = skins.filter((skin: any) =>
        searchTerms.every((term) =>
          skin.displayName.toLowerCase().includes(term)
        )
      );
      setVisibleSkins(filteredSkins);
    }
  };

  const handleSkinPress = async (skin: any) => {
    setSelectedSkin(skin);
    const lastLevel: any = Object.keys(skin.levels).sort().reverse()[0];
    setVideoPreview(skin.levels[lastLevel].streamedVideo);
  };

  const handleWishlistPress = async (skin: any) => {
    const wishlisted = await isInWishList(skin);
    setInWishlist(wishlisted);
  };

  const handleSearchIcon = () => {
    if (searchQuery) {
      setSearchQuery("");
      handleSearch("");
    }
  };

  const headerPreview = visibleSkins?.[0] || skins?.[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppBlurView
          tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
          intensity={58}
          style={styles.blurLayer}
        />
        {headerPreview && (
          <Image
            source={{
              uri: headerPreview.levels[0].displayIcon || headerPreview.displayIcon,
            }}
            blurRadius={22}
            style={styles.headerImage}
          />
        )}
        <LinearGradient
          colors={[
            theme === "dark" ? "rgba(16,17,20,0.62)" : "rgba(248,250,252,0.62)",
            accent.blueSoft,
            theme === "dark" ? "rgba(16,17,20,0.9)" : "rgba(248,250,252,0.9)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGlass}
        />
        <Text style={styles.eyebrow}>Collection</Text>
        <Text style={styles.title}>Skins</Text>
        <Text style={styles.subtitle}>
          Search weapons by name and open a skin to review its variants.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TabBarIcon name="search-outline" color={colors.subtle} size={22} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search skins by name"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={colors.subtle}
        />
        <TouchableOpacity
          onPress={handleSearchIcon}
          style={styles.searchIconTouch}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={searchQuery ? "close" : "tune"}
            size={22}
            color={searchQuery ? colors.text : accent.blue}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countText}>{visibleSkins.length} skins found</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={visibleSkins}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              handleSkinPress(item);
              handleWishlistPress(item);
            }}
            activeOpacity={0.76}
            style={styles.listItemTouch}
          >
            <AppBlurView
              tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
              intensity={34}
              style={styles.blurLayer}
            />
            <LinearGradient
              colors={[
                theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                item.TierColor || accent.blueSoft
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            />
            <View style={styles.cardGlassTop} />
            <View style={styles.listTextBlock}>
              <Text style={styles.listMeta} numberOfLines={1}>
                {item.TierName || "Weapon Skin"}
              </Text>
              <Text style={styles.listItemText} numberOfLines={2}>
                {item.displayName}
              </Text>
            </View>
            <Image
              source={{
                uri: item.levels[0].displayIcon || item.displayIcon,
              }}
              style={styles.listItemImage}
            />
          </TouchableOpacity>
        )}
        style={styles.flatList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={theme === "dark" ? "white" : "black"}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No skins found.</Text>
          </View>
        )}
      />

      {selectedSkin && (
        <SkinPreview
          selectedSkin={selectedSkin}
          videoPreview={videoPreview}
          inWishlist={inWishlist}
          handleWishlistPress={handleWishlistPress}
          setSelectedSkin={setSelectedSkin}
          price={selectedSkin.Cost}
        />
      )}
    </View>
  );
}

function createStyles(colors: any, accent: any) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    header: {
      borderRadius: 8,
      padding: 18,
      marginBottom: 14,
      overflow: "hidden",
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      shadowColor: "#000000",
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    headerImage: {
      position: "absolute",
      width: "118%",
      height: "150%",
      right: "-18%",
      top: "-24%",
      resizeMode: "contain",
      opacity: 0.38,
    },
    headerGlass: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    blurLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    eyebrow: {
      color: accent.blue,
      fontFamily: "Rubik700",
      fontSize: 13,
    },
    title: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 34,
    },
    subtitle: {
      color: colors.muted,
      fontFamily: "Rubik400",
      fontSize: 14,
      lineHeight: 20,
    },
    searchContainer: {
      height: 52,
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      gap: 10,
      borderRadius: 8,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontFamily: "Rubik500",
      fontSize: 16,
      color: colors.text,
      paddingVertical: 0,
    },
    searchIconTouch: {
      width: 34,
      height: 34,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceStrong,
    },
    countRow: {
      minHeight: 40,
      justifyContent: "center",
    },
    countText: {
      fontSize: 13,
      fontFamily: "Rubik600",
      color: colors.muted,
    },
    flatList: {
      width: "100%",
      flex: 1,
    },
    listContent: {
      paddingBottom: 150,
      gap: 12,
    },
    listItemTouch: {
      minHeight: 116,
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      shadowColor: "#000000",
      shadowOpacity: 0.14,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 7 },
      elevation: 5,
    },
    cardGradient: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      opacity: 0.42,
    },
    cardGlassTop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.theme === "dark" ? "rgba(255,255,255,0.36)" : "rgba(255,255,255,0.6)",
    },
    listTextBlock: {
      flex: 1,
      gap: 4,
      paddingRight: 10,
    },
    listMeta: {
      color: colors.muted,
      fontFamily: "Rubik600",
      fontSize: 12,
      textTransform: "uppercase",
    },
    listItemText: {
      fontFamily: "Rubik700",
      color: colors.text,
      fontSize: 19,
      lineHeight: 23,
    },
    listItemImage: {
      width: "42%",
      resizeMode: "contain",
      aspectRatio: 16 / 9,
    },
    emptyWrap: {
      minHeight: 180,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      color: colors.muted,
      fontSize: 17,
      fontFamily: "Rubik500",
      textAlign: "center",
    },
  });
}
