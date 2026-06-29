import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Skin, Bundle, AccessoryOffer, WalletBalances } from "../types/types";

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
  walletBalances: WalletBalances;
  wishListSkins: Skin[];
  playerMMR: any;
  playerCard: any;
  matchHistory: any;
  setSkins: (skins: Skin[]) => void;
  setBundles: (bundles: Bundle[]) => void;
  setContentTiers: (contentTiers: any[]) => void;
  setStoreSkins: (storeSkins: any) => void;
  setFeaturedBundle: (featuredBundle: any) => void;
  setNightMarket: (nightMarket: { Offers: any[]; TimeRemaining: number }) => void;
  setAccessoryStoreOffers: (accessoryStoreOffers: AccessoryOffer[]) => void;
  setWalletBalances: (walletBalances: WalletBalances) => void;
  setPlayerCard: (playerCard: any) => void;
  setMatchHistory: (matchHistory: any) => void;
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
  walletBalances: {
    vp: 0,
    kingdomCredits: 0,
    radianite: 0,
    freeAgents: 0,
    raw: {},
  },
  wishListSkins: [],
  playerMMR: null,
  playerCard: null,
  matchHistory: null,

  setSkins: (skins) => set({ skins }),
  setBundles: (bundles) => set({ bundles }),
  setContentTiers: (contentTiers) => set({ contentTiers }),
  setStoreSkins: (storeSkins) => set({ storeSkins }),
  setFeaturedBundle: (featuredBundle) => set({ featuredBundle }),
  setNightMarket: (nightMarket) => set({ nightMarket }),
  setAccessoryStoreOffers: (accessoryStoreOffers) => set({ accessoryStoreOffers }),
  setWalletBalances: (walletBalances) => set({ walletBalances }),
  setPlayerCard: (playerCard) => set({ playerCard }),
  setMatchHistory: (matchHistory) => set({ matchHistory }),

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
