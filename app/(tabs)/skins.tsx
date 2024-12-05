import {
  StyleSheet,
  Image,
  Platform,
  View,
  TouchableHighlight,
  FlatList,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { addSkinToWishList, isInWishList, skins } from "../API/valorant-api";
import { ResizeMode, Video } from "expo-av";
import { useNavigation } from "@react-navigation/native"; // Para obtener el objeto de navegación
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SkinPreview } from "@/components/SkinPreview";

export default function Skins() {
  const [searchQuery, setSearchQuery] = useState(""); // Estado para el texto de búsqueda
  const [visibleSkins, setVisibleSkins] = useState(skins); // Todas las skins visibles por defecto
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null); // Estado para la skin seleccionada
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const navigation = useNavigation(); // Acceso al objeto de navegación
  const flatListRef = useRef<FlatList>(null); // Referencia para FlatList

  // useEffect para escuchar los cambios de pantalla/tab
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setSelectedSkin(null); // Restablece selectedSkin a null
      setSearchQuery(""); // Limpia el campo de búsqueda
      setVisibleSkins(skins); // Restablece las skins visibles

      // Restablece la posición de la lista al inicio
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });

    return unsubscribe;
  }, [navigation]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const searchTerms = query.toLowerCase().split(" ").filter(Boolean); // Divide el texto en palabras y elimina espacios vacíos

    if (searchTerms.length === 0) {
      setVisibleSkins(skins);
    } else {
      const filteredSkins = skins.filter((skin: any) =>
        searchTerms.every((term) =>
          skin.displayName.toLowerCase().includes(term)
        )
      );
      setVisibleSkins(filteredSkins); // Mostrar solo las skins que coincidan con la búsqueda
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
    } else {
      return null;
    }
  };

  return (
    <View
      style={{
        backgroundColor: Colors.dark.background,
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 15,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          marginTop: 30,
        }}
      >
        <TextInput
          style={{
            backgroundColor: "white",
            borderRadius: 50,
            padding: 15,
            paddingHorizontal: 25,
            width: "90%",
            fontFamily: "Rubik500",
            fontSize: 18,
            color: "black",
          }}
          placeholder="Search skins by name..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          onPress={handleSearchIcon}
          style={{
            padding: 5,
            position: "absolute",
            right: "10%",
            marginTop: 8,
          }}
        >
          <MaterialIcons style={{ fontSize: 30, color: "#888" }}>
            {searchQuery ? "close" : "search"}
          </MaterialIcons>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: 16,
          fontFamily: "Rubik600",
          color: Colors.text.highlighted,
          textTransform: "uppercase",
        }}
      >
        ( {visibleSkins.length} Skins Founded )
      </Text>

      <FlatList
        ref={flatListRef} // Conecta la referencia
        data={visibleSkins}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <View style={{ alignItems: "center", marginBottom: 15 }}>
            <TouchableHighlight
              key={item.uuid}
              onPress={() => {
                handleSkinPress(item);
                handleWishlistPress(item);
              }}
              activeOpacity={0.25}
              underlayColor={Colors.dark.cardPress}
              style={{
                backgroundColor: Colors.dark.card,
                borderRadius: 2,
                width: "90%",
              }}
            >
              <View
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 30,
                  paddingVertical: 20,
                }}
              >
                <Text
                  style={{
                    width: "60%",
                    fontFamily: "Rubik500",
                    color: "white",
                    fontSize: 20,
                    flexWrap: "wrap",
                  }}
                >
                  {item.displayName}
                </Text>
                <Image
                  source={{
                    uri: item.levels[0].displayIcon || item.displayIcon,
                  }}
                  style={{
                    width: "40%",
                    resizeMode: "contain",
                    aspectRatio: 16 / 9,
                  }}
                />
              </View>
            </TouchableHighlight>
          </View>
        )}
        style={{ width: "100%", flex: 1 }}
        ListEmptyComponent={() => (
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontFamily: "Rubik500",
              textAlign: "center",
            }}
          >
            No skins found.
          </Text>
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
