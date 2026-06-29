import {
  StyleSheet,
  Image,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  InteractionManager,
} from "react-native";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text } from "react-native";
import { isInWishList } from "../../API/valorant-api";
import { useShopStore } from "../../src/store/useShopStore";
import { useFocusEffect } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SkinPreview } from "@/components/SkinPreview";
import { LinearGradient } from "expo-linear-gradient";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useTheme } from "@/src/hooks/useTheme";
import { SegmentHeader } from "@/src/components/common/SegmentHeader";

type ArmorySkinCardProps = {
  item: any;
  styles: ReturnType<typeof createStyles>;
  theme: string;
  accent: any;
  onPress: (skin: any) => void;
};

const ArmorySkinCard = memo(
  ({ item, styles, theme, accent, onPress }: ArmorySkinCardProps) => (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      style={styles.gridCard}
    >
      <LinearGradient
        colors={[
          theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          item.TierColor || accent.goldSoft,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      />
      <View style={styles.cardGlassTop} />
      <View style={styles.cardContent}>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {item.TierName || "Weapon Skin"}
        </Text>

        <Image
          source={{
            uri: item.levels?.[0]?.displayIcon || item.displayIcon,
          }}
          style={styles.cardImage}
          fadeDuration={0}
        />

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.displayName}
        </Text>
      </View>
    </TouchableOpacity>
  )
);

export default function SkinsScreen() {
  const skins = useShopStore((state) => state.skins);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListReady, setIsListReady] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<any | null>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  const { colors, theme, accent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, accent, theme), [colors, accent, theme]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setIsListReady(true);
    });

    return () => {
      task.cancel();
    };
  }, []);

  const visibleSkins = useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().split(" ").filter(Boolean);

    if (searchTerms.length === 0) {
      return skins;
    }

    return skins.filter((skin: any) =>
      searchTerms.every((term) =>
        skin.displayName.toLowerCase().includes(term)
      )
    );
  }, [searchQuery, skins]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedSkin(null);
        setSearchQuery("");
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      };
    }, [])
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSkinPress = useCallback((skin: any) => {
    setSelectedSkin(skin);
    const lastLevel: any = Object.keys(skin.levels).sort().reverse()[0];
    setVideoPreview(skin.levels[lastLevel].streamedVideo);
  }, []);

  const handleWishlistPress = useCallback(async (skin: any) => {
    const wishlisted = await isInWishList(skin);
    setInWishlist(wishlisted);
  }, []);

  const handleArmoryCardPress = useCallback(
    (skin: any) => {
      handleSkinPress(skin);
      handleWishlistPress(skin);
    },
    [handleSkinPress, handleWishlistPress]
  );

  const handleSearchIcon = useCallback(() => {
    if (searchQuery) {
      setSearchQuery("");
    }
  }, [searchQuery]);

  const renderSkin = useCallback(
    ({ item }: { item: any }) => (
      <ArmorySkinCard
        item={item}
        styles={styles}
        theme={theme}
        accent={accent}
        onPress={handleArmoryCardPress}
      />
    ),
    [accent, handleArmoryCardPress, styles, theme]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerInfo}>
        <Text style={styles.headerCount}>{visibleSkins.length} skins cataloged</Text>
      </View>
    ),
    [styles, visibleSkins.length]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No weapon skins found in armory.</Text>
      </View>
    ),
    [styles]
  );

  return (
    <View style={styles.container}>
      <SegmentHeader activeSegment="skins" />

      {/* Floating Modern Glass Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <TabBarIcon name="search-outline" color={colors.subtle} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search weapons catalog..."
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
              size={20}
              color={searchQuery ? colors.text : accent.gold}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isListReady ? (
        <FlatList
          ref={flatListRef}
          data={visibleSkins}
          keyExtractor={(item) => item.uuid}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={renderSkin}
          style={styles.flatList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle={theme === "dark" ? "white" : "black"}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={60}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== "ios"}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={accent.gold} />
        </View>
      )}

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

function createStyles(colors: any, accent: any, theme: string) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    searchWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    searchContainer: {
      height: 48,
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      gap: 10,
      borderRadius: 14,
      paddingHorizontal: 14,
      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    searchInput: {
      flex: 1,
      fontFamily: "Rubik500",
      fontSize: 15,
      color: colors.text,
      paddingVertical: 0,
    },
    searchIconTouch: {
      width: 30,
      height: 30,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceStrong,
    },
    headerInfo: {
      paddingVertical: 8,
    },
    headerCount: {
      fontSize: 13,
      fontFamily: "Rubik700",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    flatList: {
      width: "100%",
      flex: 1,
      paddingHorizontal: 16,
    },
    listContent: {
      paddingBottom: 60,
    },
    gridRow: {
      justifyContent: "space-between",
      marginBottom: 14,
    },
    gridCard: {
      width: "48%",
      aspectRatio: 0.95,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      padding: 12,
    },
    cardGradient: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      opacity: 0.38,
    },
    cardGlassTop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)",
    },
    cardContent: {
      flex: 1,
      justifyContent: "space-between",
    },
    cardMeta: {
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    cardImage: {
      width: "100%",
      height: "46%",
      resizeMode: "contain",
      alignSelf: "center",
    },
    cardTitle: {
      fontFamily: "Rubik800",
      color: colors.text,
      fontSize: 14,
      textAlign: "center",
    },
    emptyWrap: {
      minHeight: 180,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      color: colors.muted,
      fontSize: 15,
      fontFamily: "Rubik600",
      textAlign: "center",
    },
    loadingWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
}
