import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Skin, Bundle, AccessoryOffer } from "../types/types";

interface ShopState {
  skins: Skin[];
  bundles: Bundle[];
  contentTiers: any[];
  storeSkins: any;
  featuredBundle: any;
  nightMarket: {
    Offers: any[];
    TimeRemaining: number;
  };
  accessoryStoreOffers: AccessoryOffer[];
  wishListSkins: Skin[];
  playerMMR: any;
  setSkins: (skins: Skin[]) => void;
  setBundles: (bundles: Bundle[]) => void;
  setContentTiers: (contentTiers: any[]) => void;
  setStoreSkins: (storeSkins: any) => void;
  setFeaturedBundle: (featuredBundle: any) => void;
  setNightMarket: (nightMarket: { Offers: any[]; TimeRemaining: number }) => void;
  setAccessoryStoreOffers: (accessoryStoreOffers: AccessoryOffer[]) => void;
  loadWishlist: () => Promise<void>;
  toggleWishlist: (skin: Skin) => Promise<boolean>;
  isInWishlist: (skin: Skin) => boolean;
}

export const useShopStore = create<ShopState>((set, get) => ({
  skins: [],
  bundles: [],
  contentTiers: [],
  storeSkins: [],
  featuredBundle: {},
  nightMarket: {
    Offers: [],
    TimeRemaining: 0,
  },
  accessoryStoreOffers: [],
  wishListSkins: [],
  playerMMR: null,

  setSkins: (skins) => set({ skins }),
  setBundles: (bundles) => set({ bundles }),
  setContentTiers: (contentTiers) => set({ contentTiers }),
  setStoreSkins: (storeSkins) => set({ storeSkins }),
  setFeaturedBundle: (featuredBundle) => set({ featuredBundle }),
  setNightMarket: (nightMarket) => set({ nightMarket }),
  setAccessoryStoreOffers: (accessoryStoreOffers) => set({ accessoryStoreOffers }),

  loadWishlist: async () => {
    try {
      const storageWishList = await AsyncStorage.getItem("wishListSkins");
      if (storageWishList) {
        set({ wishListSkins: JSON.parse(storageWishList) });
      } else {
        set({ wishListSkins: [] });
      }
    } catch (error) {
      console.error("Error loading wishlist from storage:", error);
    }
  },

  toggleWishlist: async (skin) => {
    const { wishListSkins } = get();
    const skinExists = wishListSkins.find((s) => s.uuid === skin.uuid);
    let updatedList: Skin[] = [];
    let added = false;

    if (!skinExists) {
      updatedList = [...wishListSkins, skin];
      added = true;
    } else {
      updatedList = wishListSkins.filter((s) => s.uuid !== skin.uuid);
      added = false;
    }

    try {
      await AsyncStorage.setItem("wishListSkins", JSON.stringify(updatedList));
      set({ wishListSkins: updatedList });
    } catch (error) {
      console.error("Error updating wishlist in storage:", error);
    }
    return added;
  },

  isInWishlist: (skin) => {
    const { wishListSkins } = get();
    return !!wishListSkins.find((s) => s.uuid === skin.uuid);
  },
}));
