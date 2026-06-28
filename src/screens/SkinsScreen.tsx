import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { addSkinToWishList, isInWishList } from "../../API/valorant-api";
import { useShopStore } from "../../src/store/useShopStore";
import { useNavigation } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SkinPreview } from "@/components/SkinPreview";

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
  }, [navigation]);

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
    let inWishlist = await isInWishList(skin);
    setInWishlist(inWishlist);
  };

  const handleSearchIcon = () => {
    if (searchQuery) {
      setSearchQuery("");
      handleSearch("");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search skins by name..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          onPress={handleSearchIcon}
          style={styles.searchIconTouch}
        >
          <MaterialIcons style={styles.searchIcon}>
            {searchQuery ? "close" : "search"}
          </MaterialIcons>
        </TouchableOpacity>
      </View>

      <Text style={styles.countText}>
        ( {visibleSkins.length} Skins Founded )
      </Text>

      <FlatList
        ref={flatListRef}
        data={visibleSkins}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <View style={styles.listItemContainer}>
            <TouchableHighlight
              key={item.uuid}
              onPress={() => {
                handleSkinPress(item);
                handleWishlistPress(item);
              }}
              activeOpacity={0.25}
              underlayColor={Colors.dark.cardPress}
              style={styles.listItemTouch}
            >
              <View style={styles.listItemContent}>
                <Text style={styles.listItemText}>{item.displayName}</Text>
                <Image
                  source={{
                    uri: item.levels[0].displayIcon || item.displayIcon,
                  }}
                  style={styles.listItemImage}
                />
              </View>
            </TouchableHighlight>
          </View>
        )}
        style={styles.flatList}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No skins found.</Text>
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
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  searchContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    marginTop: 30,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 12,
    paddingHorizontal: 20,
    width: "90%",
    fontFamily: "Rubik500",
    fontSize: 18,
    color: "black",
  },
  searchIconTouch: {
    padding: 5,
    position: "absolute",
    right: "10%",
    marginTop: 8,
  },
  searchIcon: {
    fontSize: 30,
    color: "#888",
  },
  countText: {
    fontSize: 16,
    fontFamily: "Rubik600",
    color: Colors.text.highlighted,
    textTransform: "uppercase",
  },
  listItemContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  listItemTouch: {
    backgroundColor: Colors.dark.card,
    borderRadius: 2,
    width: "90%",
    borderWidth: 1,
    borderColor: Colors.dark.cardPress,
  },
  listItemContent: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listItemText: {
    width: "60%",
    fontFamily: "Rubik500",
    color: "white",
    fontSize: 18,
    flexWrap: "wrap",
  },
  listItemImage: {
    width: "40%",
    resizeMode: "contain",
    aspectRatio: 16 / 9,
  },
  flatList: {
    width: "100%",
    flex: 1,
  },
  emptyText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Rubik500",
    textAlign: "center",
  },
});
