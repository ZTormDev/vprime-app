import { addSkinToWishList } from "@/app/API/valorant-api";
import { Video, ResizeMode } from "expo-av";
import React from "react";
import { TouchableHighlight, View, Text, StyleSheet } from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import CurrencyIcon from "./CurrencyIcon";

export const SkinPreview = ({ selectedSkin, videoPreview, inWishlist, handleWishlistPress, setSelectedSkin, }, price?) => {

  return (
    <View
      style={{
        backgroundColor: "rgba(0,0,0,0.75)",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.dark.background,
          zIndex: 11,
          width: "95%",
          justifyContent: "center",
          alignItems: "center",
          padding: 25,
          borderRadius: 20,
          gap: 30,
        }}
      >
        <View style={{width: '100%', gap: 5, flexDirection: 'column'}}>
            <Text style={{ fontFamily: "Rubik500", color: "white", fontSize: 28, textAlign: "center" }}>
            {selectedSkin.displayName}
            </Text>
            {price && (
                <View style={{marginTop: 0,paddingHorizontal: 5 ,width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5}}>
                    <CurrencyIcon icon="vp" size={24}/>
                    <Text style={{ fontFamily: 'Rubik400' , color: Colors.dark.text, fontSize: 24}}>{selectedSkin.Cost}</Text>
                </View>
            )}
        </View>
        {videoPreview ? (
          <Video
            ref={null}
            style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 10, marginVertical: 0 }}
            source={{
              uri: videoPreview,
            }}
            useNativeControls={false}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay
            isMuted={false}
            volume={1}
          />
        ) : (
          <Text
            style={{
              color: Colors.red.color,
              fontSize: 20,
              fontFamily: "Rubik500",
              textAlign: "center",
              marginVertical: 50,
            }}
          >
            No video found for this Skin.
          </Text>
        )}
        <TouchableHighlight
          onPress={() => {
            addSkinToWishList(selectedSkin);
            handleWishlistPress(selectedSkin);
          }}
          activeOpacity={0.25}
          underlayColor="#fffff"
          style={!inWishlist ? Styles.addWishListButton : Styles.removeWishListButton}
            
        >
          <View style={{ flexDirection: "row", gap: 5 }}>
            <Text
              style={{
                fontFamily: "Rubik500",
                color: !inWishlist ? Colors.text.highlighted : Colors.text.dark,
                fontSize: 20,
                textAlign: "center",
              }}
            >
              {!inWishlist ? "Add To Wishlist" : "Remove from Wishlist"}
            </Text>
            <TabBarIcon
              name={!inWishlist ? "heart-outline" : "heart"}
              color={!inWishlist ? Colors.text.highlighted : Colors.text.dark}
              style={{ fontWeight: 700 }}
              size={30}
            />
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => setSelectedSkin(null)}
          activeOpacity={0.25}
          underlayColor="#ff8888"
          style={{ backgroundColor: "#ff5454", borderRadius: 50, padding: 6, width: "100%" }}
        >
          <Text style={{ fontFamily: "Rubik500", color: "white", fontSize: 23, textAlign: "center" }}>Close</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
};



const Styles = StyleSheet.create({
    addWishListButton: {
        borderWidth: 3,
        borderColor: Colors.text.highlighted,
        backgroundColor: 'transparent', 
        borderRadius: 50, 
        padding: 6, 
        paddingHorizontal: 20,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeWishListButton: {
        borderWidth: 3,
        borderColor: Colors.text.highlighted,
        backgroundColor: Colors.text.highlighted, 
        borderRadius: 50, 
        padding: 6, 
        paddingHorizontal: 20,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
})