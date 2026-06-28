import {
  StyleSheet,
  Image,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { isInWishList } from "../../API/valorant-api";
import { useShopStore } from "../../src/store/useShopStore";
import { useNavigation } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SkinPreview } from "@/components/SkinPreview";
import { LinearGradient } from "expo-linear-gradient";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

export default function SkinsScreen() {
  const skins = useShopStore((state) => state.skins);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleSkins, setVisibleSkins] = useState(skins);
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Collection</Text>
        <Text style={styles.title}>Skins</Text>
        <Text style={styles.subtitle}>
          Search weapons by name and open a skin to review its variants.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TabBarIcon name="search-outline" color={Colors.dark.subtle} size={22} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search skins by name"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={Colors.dark.subtle}
        />
        <TouchableOpacity
          onPress={handleSearchIcon}
          style={styles.searchIconTouch}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={searchQuery ? "close" : "tune"}
            size={22}
            color={searchQuery ? Colors.dark.text : Colors.accent.blue}
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
            <LinearGradient
              colors={["rgba(255,255,255,0.08)", item.TierColor || Colors.accent.blueSoft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            />
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
        showsVerticalScrollIndicator={false}
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    borderRadius: 8,
    padding: 18,
    marginBottom: 14,
    backgroundColor: Colors.dark.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  eyebrow: {
    color: Colors.accent.blue,
    fontFamily: "Rubik700",
    fontSize: 13,
  },
  title: {
    color: Colors.dark.text,
    fontFamily: "Rubik800",
    fontSize: 34,
  },
  subtitle: {
    color: Colors.dark.muted,
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
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Rubik500",
    fontSize: 16,
    color: Colors.dark.text,
    paddingVertical: 0,
  },
  searchIconTouch: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.surfaceStrong,
  },
  countRow: {
    minHeight: 40,
    justifyContent: "center",
  },
  countText: {
    fontSize: 13,
    fontFamily: "Rubik600",
    color: Colors.dark.muted,
  },
  flatList: {
    width: "100%",
    flex: 1,
  },
  listContent: {
    paddingBottom: 104,
    gap: 12,
  },
  listItemTouch: {
    minHeight: 116,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.42,
  },
  listTextBlock: {
    flex: 1,
    gap: 4,
    paddingRight: 10,
  },
  listMeta: {
    color: Colors.dark.muted,
    fontFamily: "Rubik600",
    fontSize: 12,
    textTransform: "uppercase",
  },
  listItemText: {
    fontFamily: "Rubik700",
    color: Colors.dark.text,
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
    color: Colors.dark.muted,
    fontSize: 17,
    fontFamily: "Rubik500",
    textAlign: "center",
  },
});
