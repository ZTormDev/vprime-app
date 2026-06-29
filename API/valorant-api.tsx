import axios from "axios";
import { useAuthStore } from "../src/store/useAuthStore";
import { useShopStore } from "../src/store/useShopStore";
import type { WalletBalances } from "../src/types/types";

// ==========================================
// Compatibility Global Variables (Getters / Proxies)
// ==========================================
export let storeFrontData: any = {};
export let skins: any = [];
export let bundles: any = [];
export let featuredBundle: any = {};
export let nightMarket: any = { Offers: [], TimeRemaining: 0 };
export let storeSkins: any = [];
export let wishListSkins: any = [];
export let accessoryStoreOffers: any = [];
export let walletBalances: WalletBalances = {
  vp: 0,
  kingdomCredits: 0,
  radianite: 0,
  freeAgents: 0,
  raw: {},
};
export let contentTiers: any = [];
export let PlayerLoadout: any = {};
export let PlayerCard: any = {};
export let MatchHistoryData: any = {};

export let AccessToken: any = null;
export let IdToken: any = null;
export let EntitlementsToken: any = null;
export let ExpiresIn: any = null;
export let PlayerUUID: any = null;
export let Shard: any = null;
export let GameName: any = null;
export let TagLine: any = null;

export let Maps: any = null;
export let Agents: any = null;
export let RankTiers: any = null;
export let PlayerMMR: any = null;

// Subscribe to Zustand store changes to keep compatibility exports synchronized
useShopStore.subscribe((state) => {
  skins = state.skins || [];
  bundles = state.bundles || [];
  contentTiers = state.contentTiers || [];
  storeSkins = state.storeSkins || [];
  featuredBundle = state.featuredBundle || {};
  nightMarket = state.nightMarket || { Offers: [], TimeRemaining: 0 };
  accessoryStoreOffers = state.accessoryStoreOffers || [];
  walletBalances = state.walletBalances;
  wishListSkins = state.wishListSkins || [];
  PlayerMMR = state.playerMMR;
  PlayerCard = state.playerCard || {};
  MatchHistoryData = state.matchHistory || {};
});

useAuthStore.subscribe((state) => {
  AccessToken = state.accessToken;
  IdToken = state.idToken;
  PlayerUUID = state.playerUUID;
  Shard = state.shard;
  GameName = state.gameName;
  TagLine = state.tagline;
});

// ==========================================
// Core HTTP Request Headers
// ==========================================
export const extraHeaders = {
  "X-Riot-ClientVersion": "43.0.1.4195386.4190634",
  "X-Riot-ClientPlatform": btoa(
    JSON.stringify({
      platformType: "PC",
      platformOS: "Windows",
      platformOSVersion: "10.0.19042.1.256.64bit",
      platformChipset: "Unknown",
    })
  ),
};

type StorefrontRequest = {
  shard: string;
  playerUuid: string;
  accessToken: string;
  entitlementsToken: string;
  clientVersion?: string;
};

type ValorantAuthenticatedRequest = {
  shard: string;
  playerUuid: string;
  accessToken: string;
  entitlementsToken: string;
};

const CURRENCY_IDS = {
  vp: "85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741",
  kingdomCredits: "85ca954a-41f2-ce94-9b45-8ca3dd39a00d",
  freeAgents: "f08d4ae3-939c-4576-ab26-09ce1f23bb37",
  radianite: "e59aa87c-4cbf-517a-5983-6e81511be9b7",
} as const;

// ==========================================
// Stateless Valorant Api Service (Service Layer)
// ==========================================
export const ValorantApiService = {
  /**
   * Fetches current client version info from valorant-api
   */
  async fetchClientVersion(): Promise<string> {
    try {
      const response = await axios.get("https://valorant-api.com/v1/version");
      return response.data.data.riotClientVersion;
    } catch (error) {
      console.warn("[API Service] Failed to fetch live client version:", error);
      return "release-09.00-shipping-13-2559641";
    }
  },

  /**
   * Fetches Entitlements token from pas.si.riotgames
   */
  async fetchEntitlementsToken(accessToken: string): Promise<string> {
    try {
      const response = await axios.post(
        "https://entitlements.auth.riotgames.com/api/token/v1",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.entitlements_token;
    } catch (error: any) {
      console.error("[API Service] Failed to fetch entitlements token:", error?.response?.data || error?.message);
      throw error;
    }
  },

  /**
   * Resolves player account regional Shard affinity
   */
  async fetchShardAffinity(accessToken: string, idToken: string): Promise<string> {
    try {
      const response = await axios.put(
        "https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant",
        { id_token: idToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const live = response.data.affinities.live;
      // Map LATAM and BR regions back to NA Shard cluster due to Riot hosting routes
      if (live === "latam" || live === "br") {
        return "na";
      }
      return live;
    } catch (error: any) {
      console.error("[API Service] Shard affinity resolve error:", error?.response?.data || error?.message);
      throw error;
    }
  },

  /**
   * Fetches raw storefront data from Riot PDT endpoints
   */
  async fetchStorefrontRaw(
    shard: string,
    playerUuid: string,
    accessToken: string,
    entitlementsToken: string,
    clientVersion?: string
  ): Promise<any> {
    const version = clientVersion || extraHeaders["X-Riot-ClientVersion"];
    try {
      const response = await axios.post(
        `https://pd.${shard}.a.pvp.net/store/v3/storefront/${playerUuid}`,
        {},
        {
          headers: {
            "X-Riot-ClientVersion": version,
            "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-Riot-Entitlements-JWT": entitlementsToken,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("[API Service] Storefront raw fetch error:", error?.response?.data || error?.message);
      throw error;
    }
  },

  async fetchStorefront(request: StorefrontRequest): Promise<any> {
    return ValorantApiService.fetchStorefrontRaw(
      request.shard,
      request.playerUuid,
      request.accessToken,
      request.entitlementsToken,
      request.clientVersion
    );
  },

  async fetchWallet(
    shard: string,
    playerUuid: string,
    accessToken: string,
    entitlementsToken: string
  ): Promise<any> {
    const url = `https://pd.${shard}.a.pvp.net/store/v1/wallet/${playerUuid}`;
    const headers = {
      "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
      "X-Riot-ClientVersion": extraHeaders["X-Riot-ClientVersion"],
      "X-Riot-Entitlements-JWT": entitlementsToken,
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      console.error("[API Service] Wallet fetch error:", error?.response?.data || error?.message);
      throw error;
    }
  },

  /**
   * Fetches competitive player MMR rank data
   */
  async fetchCompetitiveUpdates(
    request: ValorantAuthenticatedRequest,
    startIndex = 0,
    endIndex = 6
  ): Promise<any> {
    const url = `https://pd.${request.shard}.a.pvp.net/mmr/v1/players/${request.playerUuid}/competitiveupdates?startIndex=${startIndex}&endIndex=${endIndex}`;
    const headers = {
      "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
      "X-Riot-ClientVersion": extraHeaders["X-Riot-ClientVersion"],
      "X-Riot-Entitlements-JWT": request.entitlementsToken,
      Authorization: `Bearer ${request.accessToken}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      console.error("[API Service] Competitive updates fetch error:", error?.response?.data || error?.message);
      throw error;
    }
  },

  async fetchPlayerMMR(
    shard: string,
    playerUuid: string,
    accessToken: string,
    entitlementsToken: string,
    rankTiers: any[]
  ): Promise<any> {
    const url = `https://pd.${shard}.a.pvp.net/mmr/v1/players/${playerUuid}`;
    const headers = {
      "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
      "X-Riot-ClientVersion": extraHeaders["X-Riot-ClientVersion"],
      "X-Riot-Entitlements-JWT": entitlementsToken,
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await axios.get(url, { headers });
      const playerMmr = response.data;

      if (playerMmr && playerMmr.LatestCompetitiveUpdate) {
        const playerRank = rankTiers?.[rankTiers.length - 1]?.tiers?.find(
          (rank: any) => rank.tier === playerMmr.LatestCompetitiveUpdate.TierBeforeUpdate
        ) || rankTiers?.[rankTiers.length - 1]?.tiers?.[0] || getFallbackUnranked(rankTiers);

        playerMmr.Rank = playerRank;
        return playerMmr;
      }
      throw new Error("No competitive update in profile data");
    } catch (error: any) {
      if (error.response?.status === 404 || error.message === "No competitive update in profile data") {
        console.log("[API Service] MMR 404. Running competitive history updates fallback query...");
        try {
          const compData = await ValorantApiService.fetchCompetitiveUpdates(
            { shard, playerUuid, accessToken, entitlementsToken },
            0,
            1
          );

          if (compData && compData.Matches && compData.Matches.length > 0) {
            const latestMatch = compData.Matches[0];
            const tierId = latestMatch.TierAfterUpdate;
            const playerRank = rankTiers?.[rankTiers.length - 1]?.tiers?.find(
              (rank: any) => rank.tier === tierId
            ) || getFallbackUnranked(rankTiers);

            return {
              LatestCompetitiveUpdate: {
                RankedRatingBeforeUpdate: latestMatch.RankedRatingAfterUpdate,
                TierBeforeUpdate: tierId,
              },
              Rank: playerRank,
            };
          }
        } catch (fallbackError) {
          console.error("[API Service] Fallback MMR updates parse failed:", fallbackError);
        }
      } else {
        console.error("[API Service] Failed to retrieve player MMR status:", error?.response?.data || error?.message);
      }
      // Return default unranked model
      return {
        LatestCompetitiveUpdate: {
          RankedRatingBeforeUpdate: 0,
          TierBeforeUpdate: 0,
        },
        Rank: getFallbackUnranked(rankTiers),
      };
    }
  },

  /**
   * Fetches match details log history
   */
  async fetchMatchDetails(
    request: ValorantAuthenticatedRequest,
    matchId: string
  ): Promise<any> {
    const url = `https://pd.${request.shard}.a.pvp.net/match-details/v1/matches/${matchId}`;
    const headers = {
      "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
      "X-Riot-ClientVersion": extraHeaders["X-Riot-ClientVersion"],
      "X-Riot-Entitlements-JWT": request.entitlementsToken,
      Authorization: `Bearer ${request.accessToken}`,
    };

    const response = await axios.get(url, { headers });
    return response.data;
  },

  async fetchMatchHistory(
    shard: string,
    playerUuid: string,
    accessToken: string,
    entitlementsToken: string,
    maps: any[],
    agents: any[],
    rankTiers: any[]
  ): Promise<any> {
    const request = { shard, playerUuid, accessToken, entitlementsToken };

    try {
      const history = await ValorantApiService.fetchCompetitiveUpdates(request, 0, 6);

      if (history && history.Matches) {
        await Promise.all(
          history.Matches.map(async (match: any, index: number) => {
            try {
              const details = await ValorantApiService.fetchMatchDetails(request, match.MatchID);
              history.Matches[index].Details = details;

              // Match active map
              const map = maps?.find((m: any) => m.mapUrl === details.matchInfo.mapId);
              if (map) history.Matches[index].Details.MapDetails = map;

              // Match player statistics
              const player = details.players?.find((p: any) => p.subject === playerUuid);
              if (player) {
                const agent = agents?.find((a: any) => a.uuid === player.characterId);
                if (agent) history.Matches[index].Details.PlayerAgent = agent;

                const playerTeam = details.teams?.find((t: any) => t.teamId === player.teamId);
                const enemyTeam = details.teams?.find((t: any) => t.teamId !== player.teamId);

                if (playerTeam && enemyTeam) {
                  history.Matches[index].Details.Player = player;
                  history.Matches[index].Details.PlayerTeamRoundsWon = playerTeam.roundsWon;
                  history.Matches[index].Details.EnemyTeamRoundsWon = enemyTeam.roundsWon;
                  history.Matches[index].Details.playerTeam = playerTeam.teamId;

                  const rank = rankTiers?.[rankTiers.length - 1]?.tiers?.find(
                    (r: any) => r.tier === match.TierAfterUpdate
                  );
                  if (rank) history.Matches[index].Details.Player.Rank = rank;

                  if (playerTeam.roundsWon > enemyTeam.roundsWon) {
                    history.Matches[index].Details.result = "Victory";
                  } else if (playerTeam.roundsWon < enemyTeam.roundsWon) {
                    history.Matches[index].Details.result = "Defeat";
                  } else {
                    history.Matches[index].Details.result = "Draw";
                  }
                }
              }
            } catch (err) {
              console.error(`[API Service] Failed to retrieve match details for ${match.MatchID}:`, err);
            }
          })
        );
      }
      return history;
    } catch (error) {
      console.error("[API Service] Failed to load match history logs:", error);
      return { Matches: [] };
    }
  },

  /**
   * Fetches active player personalization loadout selections
   */
  async fetchPlayerLoadout(shard: string, playerUuid: string, accessToken: string, entitlementsToken: string): Promise<any> {
    const url = `https://pd.${shard}.a.pvp.net/personalization/v2/players/${playerUuid}/playerloadout`;
    const headers = {
      "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
      "X-Riot-ClientVersion": extraHeaders["X-Riot-ClientVersion"],
      "X-Riot-Entitlements-JWT": entitlementsToken,
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      console.error("[API Service] Failed to retrieve player loadout items:", error?.response?.data || error?.message);
      return null;
    }
  },

  /**
   * Fetches specific player card customization graphic
   */
  async fetchPlayerCardDetails(cardId: string): Promise<any> {
    try {
      const response = await axios.get(`https://valorant-api.com/v1/playercards/${cardId}`);
      return response.data.data;
    } catch (error) {
      console.error("[API Service] Failed to query playercard assets:", error);
      return null;
    }
  },

  async fetchPlayerCard(cardId: string): Promise<any> {
    return ValorantApiService.fetchPlayerCardDetails(cardId);
  },

  /**
   * Fetches global competitivetiers list from valorant-api
   */
  async fetchRankTiersList(): Promise<any[]> {
    try {
      const response = await axios.get("https://valorant-api.com/v1/competitivetiers");
      return response.data.data;
    } catch (error) {
      console.error("[API Service] Failed to retrieve rank tier listings:", error);
      return [];
    }
  },

  /**
   * Fetches global maps list from valorant-api
   */
  async fetchMapsList(): Promise<any[]> {
    try {
      const response = await axios.get("https://valorant-api.com/v1/maps");
      return response.data.data;
    } catch (error) {
      console.error("[API Service] Failed to load maps information:", error);
      return [];
    }
  },

  /**
   * Fetches global agents character list from valorant-api
   */
  async fetchAgentsList(): Promise<any[]> {
    try {
      const response = await axios.get("https://valorant-api.com/v1/agents");
      return response.data.data;
    } catch (error) {
      console.error("[API Service] Failed to query agents metadata:", error);
      return [];
    }
  },

  /**
   * Fetches global content tiers categories from valorant-api
   */
  async fetchContentTiersList(): Promise<any[]> {
    try {
      const response = await axios.get("https://valorant-api.com/v1/contenttiers");
      return response.data.data;
    } catch (error) {
      console.error("[API Service] Failed to query content tiers:", error);
      return [];
    }
  },

  /**
   * Fetches global weapon skins catalog from valorant-api
   */
  async fetchWeaponSkinsList(): Promise<any[]> {
    try {
      const response = await axios.get("https://valorant-api.com/v1/weapons/skins?en-US");
      return response.data.data
        .filter(
          (skin: any) =>
            !skin.displayName.toLowerCase().includes("default") &&
            !skin.displayName.toLowerCase().includes("standard") &&
            !skin.displayName.toLowerCase().includes("random")
        )
        .sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
    } catch (error) {
      console.error("[API Service] Failed to load weapons catalog:", error);
      return [];
    }
  },

  /**
   * Fetches global featured bundles collections list from valorant-api
   */
  async fetchBundlesList(): Promise<any[]> {
    try {
      const response = await axios.get("https://valorant-api.com/v1/bundles?en-US");
      return response.data.data;
    } catch (error) {
      console.error("[API Service] Failed to load featured bundles:", error);
      return [];
    }
  },
};

// ==========================================
// Helper Utility Logic
// ==========================================
function getFallbackUnranked(rankTiers: any[]) {
  return rankTiers?.[rankTiers.length - 1]?.tiers?.[0] || {
    tier: 0,
    tierName: "Unranked",
    largeIcon: "",
    color: "ffffff",
  };
}

function formatNumberWithCommas(number: number): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseWalletBalances(wallet: any): WalletBalances {
  const balances = wallet?.Balances || {};

  return {
    vp: balances[CURRENCY_IDS.vp] || 0,
    kingdomCredits: balances[CURRENCY_IDS.kingdomCredits] || 0,
    radianite: balances[CURRENCY_IDS.radianite] || 0,
    freeAgents: balances[CURRENCY_IDS.freeAgents] || 0,
    raw: balances,
  };
}

function findCatalogItemById(items: any[], itemId: string) {
  return items.find(
    (item: any) =>
      item.uuid === itemId ||
      item.levels?.some((level: any) => level.uuid === itemId)
  );
}

function getTierColor(skinTier: any): string {
  switch (skinTier.rank) {
    case 0:
      return "#5FE233";
    case 1:
      return "#009583";
    case 2:
      return "#D1548D";
    case 3:
      return "#F59533";
    case 4:
      return "#FAD663";
    default:
      return "#5FE233";
  }
}

// ==========================================
// Compatibility Backwards Wrappers (State Synced)
// ==========================================
export async function loadVersion() {
  const version = await ValorantApiService.fetchClientVersion();
  extraHeaders["X-Riot-ClientVersion"] = version;
}

export async function SetAccountShard() {
  const auth = useAuthStore.getState();
  const shard = await ValorantApiService.fetchShardAffinity(auth.accessToken || "", auth.idToken || "");
  useAuthStore.setState({ shard });
  return shard;
}

export async function getRankTiers() {
  const tiers = await ValorantApiService.fetchRankTiersList();
  RankTiers = tiers;
  return tiers;
}

export async function getMaps() {
  const maps = await ValorantApiService.fetchMapsList();
  Maps = maps;
  return maps;
}

export async function getAgents() {
  const agents = await ValorantApiService.fetchAgentsList();
  Agents = agents;
  return agents;
}

export async function getContentTiers() {
  const tiers = await ValorantApiService.fetchContentTiersList();
  useShopStore.setState({ contentTiers: tiers });
}

export async function getGameSkins() {
  const list = await ValorantApiService.fetchWeaponSkinsList();
  useShopStore.setState({ skins: list });
  return list;
}

export async function getBundles() {
  const list = await ValorantApiService.fetchBundlesList();
  useShopStore.setState({ bundles: list });
  return list;
}

export async function GetPlayerLoadout() {
  const auth = useAuthStore.getState();
  const loadout = await ValorantApiService.fetchPlayerLoadout(
    auth.shard || "",
    auth.playerUUID || "",
    auth.accessToken || "",
    EntitlementsToken || ""
  );
  PlayerLoadout = loadout;
  return loadout;
}

export async function getPlayerCard() {
  if (!PlayerLoadout?.Identity?.PlayerCardID) {
    console.warn("[Legacy Bridge] Cannot fetch player card: Loadout identity card details missing.");
    return;
  }
  const card = await ValorantApiService.fetchPlayerCardDetails(PlayerLoadout.Identity.PlayerCardID);
  useShopStore.setState({ playerCard: card });
}

export async function getPlayerMMR() {
  const auth = useAuthStore.getState();
  const mmr = await ValorantApiService.fetchPlayerMMR(
    auth.shard || "",
    auth.playerUUID || "",
    auth.accessToken || "",
    EntitlementsToken || "",
    RankTiers || []
  );
  useShopStore.setState({ playerMMR: mmr });
}

export async function getWallet() {
  const auth = useAuthStore.getState();
  const wallet = await ValorantApiService.fetchWallet(
    auth.shard || "",
    auth.playerUUID || "",
    auth.accessToken || "",
    EntitlementsToken || ""
  );
  const balances = parseWalletBalances(wallet);
  useShopStore.setState({ walletBalances: balances });
  return balances;
}

export function eraseMathHistory() {
  useShopStore.setState({ matchHistory: null });
}

export async function getMatchHistory() {
  const auth = useAuthStore.getState();
  const history = await ValorantApiService.fetchMatchHistory(
    auth.shard || "",
    auth.playerUUID || "",
    auth.accessToken || "",
    EntitlementsToken || "",
    Maps || [],
    Agents || [],
    RankTiers || []
  );
  useShopStore.setState({ matchHistory: history });
}

export async function getSkin(skinUUID: string) {
  const shop = useShopStore.getState();
  return shop.storeSkins?.find((skin: any) => skin.levels[0].uuid === skinUUID) || null;
}

export async function addSkinToWishList(skin: any) {
  const shop = useShopStore.getState();
  await shop.toggleWishlist(skin);
}

export async function isInWishList(skin: any) {
  const shop = useShopStore.getState();
  return !!shop.wishListSkins?.find((s: any) => s.uuid === skin.uuid);
}

export async function fetchSkinsWishList() {
  await useShopStore.getState().loadWishlist();
}

export function SetPlayerUUID(puuid: any) {
  useAuthStore.setState({ playerUUID: puuid });
}
export function SetAccessToken(access_token: any) {
  useAuthStore.setState({ accessToken: access_token });
}
export function SetIdToken(id_token: any) {
  useAuthStore.setState({ idToken: id_token });
}
export function SetExpiresIn(expires: any) {
  useAuthStore.setState({ expiresIn: expires });
}
export function SetTagline(tagline: any) {
  useAuthStore.setState({ tagline: tagline });
}
export function SetGameName(gamename: any) {
  useAuthStore.setState({ gameName: gamename });
}
export function SetEntitlementsToken(token: any) {
  EntitlementsToken = token;
}

// ==========================================
// Parsing & Formatting Services
// ==========================================
export const fetchStoreData = async () => {
  const auth = useAuthStore.getState();
  try {
    const request = {
      shard: auth.shard || "",
      playerUuid: auth.playerUUID || "",
      accessToken: auth.accessToken || "",
      entitlementsToken: EntitlementsToken || "",
    };
    const [raw, wallet] = await Promise.all([
      ValorantApiService.fetchStorefrontRaw(
        request.shard,
        request.playerUuid,
        request.accessToken,
        request.entitlementsToken
      ),
      ValorantApiService.fetchWallet(
        request.shard,
        request.playerUuid,
        request.accessToken,
        request.entitlementsToken
      ).catch((error) => {
        console.error("[Legacy Bridge] Error fetching wallet data:", error);
        return null;
      }),
    ]);

    storeFrontData = raw;
    if (wallet) {
      useShopStore.setState({ walletBalances: parseWalletBalances(wallet) });
    }
    await parseShop(raw);
  } catch (error) {
    console.error("[Legacy Bridge] Error fetching store data:", error);
  }
};

type ParsedStorefrontData = {
  storeSkins: any[];
  featuredBundle: any;
  nightMarket: { Offers: any[]; TimeRemaining: number };
  accessoryStoreOffers: any[];
};

type StorefrontCatalogs = {
  skins: any[];
  bundles: any[];
  contentTiers: any[];
};

export async function parseStorefront(
  shop: any,
  catalogs: StorefrontCatalogs
): Promise<ParsedStorefrontData> {
  const globalSkins = catalogs.skins || [];
  const globalBundles = catalogs.bundles || [];
  const globalTiers = catalogs.contentTiers || [];

  // Parse storefront daily skins
  const dailyOffers = shop.SkinsPanelLayout?.SingleItemStoreOffers || [];
  const parsedOffers: any[] = [];

  for (let i = 0; i < dailyOffers.length; i++) {
    const offerId = dailyOffers[i].OfferID;
    const skin = globalSkins.find((s: any) => s.levels[0].uuid === offerId);
    if (skin) {
      const clonedSkin: any = { ...skin };
      const costs = Object.values(dailyOffers[i].Cost);
      if (costs.length > 0) {
        clonedSkin.Cost = formatNumberWithCommas(costs[0] as number);
      }
      const tier = globalTiers.find((t: any) => t.uuid === skin.contentTierUuid);
      if (tier) {
        clonedSkin.TierColor = getTierColor(tier);
        clonedSkin.TierName = tier.displayName;
      }
      clonedSkin.remainingSeconds = shop.SkinsPanelLayout?.SingleItemOffersRemainingDurationInSeconds || 0;
      parsedOffers.push(clonedSkin);
    }
  }

  // Parse featured bundle
  let parsedBundle: any = {};
  const rawBundles = shop.FeaturedBundle?.Bundles || [];
  if (rawBundles.length > 0) {
    const rawBundle = rawBundles[0];
    const catalogBundle = globalBundles.find((b: any) => b.uuid === rawBundle.DataAssetID);
    if (catalogBundle) {
      parsedBundle = { ...catalogBundle };
      const bundleSkins: any[] = [];
      const bundleItems = rawBundle.Items || [];

      for (let i = 0; i < bundleItems.length; i++) {
        const item = bundleItems[i];
        const skin = globalSkins.find((s: any) => s.levels[0].uuid === item.Item.ItemID);
        if (skin) {
          const clonedSkin: any = { ...skin };
          const price = item.DiscountedPrice === 0 ? item.BasePrice : item.DiscountedPrice;
          clonedSkin.Cost = formatNumberWithCommas(price);
          const tier = globalTiers.find((t: any) => t.uuid === skin.contentTierUuid);
          if (tier) {
            clonedSkin.TierColor = getTierColor(tier);
            clonedSkin.TierName = tier.displayName;
          }
          bundleSkins.push(clonedSkin);
        }
      }

      parsedBundle.bundleItems = bundleSkins;
      parsedBundle.bundlePrice = formatNumberWithCommas(
        rawBundle.TotalDiscountedCost?.[rawBundle.CurrencyID] || 0
      );
      parsedBundle.remainingSeconds = rawBundle.DurationRemainingInSeconds || 0;
    }
  }

  // Parse night market
  const parsedNightMarket: { Offers: any[]; TimeRemaining: number } = {
    Offers: [],
    TimeRemaining: 0,
  };
  const rawNightMarket = shop.BonusStore?.BonusStoreOffers || [];
  if (rawNightMarket.length > 0) {
    for (let i = 0; i < rawNightMarket.length; i++) {
      const offer = rawNightMarket[i].Offer;
      const skin = globalSkins.find((s: any) => s.levels[0].uuid === offer.OfferID);
      if (skin) {
        const clonedSkin: any = { ...skin };
        const originalCosts = Object.values(offer.Cost);
        const discountCosts = Object.values(rawNightMarket[i].DiscountCosts);
        if (originalCosts.length > 0 && discountCosts.length > 0) {
          clonedSkin.OriginalCost = formatNumberWithCommas(originalCosts[0] as number);
          clonedSkin.Cost = formatNumberWithCommas(discountCosts[0] as number);
        }
        const tier = globalTiers.find((t: any) => t.uuid === skin.contentTierUuid);
        if (tier) {
          clonedSkin.TierColor = getTierColor(tier);
          clonedSkin.TierName = tier.displayName;
        }
        parsedNightMarket.Offers.push(clonedSkin);
      }
    }
    parsedNightMarket.TimeRemaining = shop.BonusStore?.BonusStoreRemainingDurationInSeconds || 0;
  }

  // Parse accessory offers
  const parsedAccessories: any[] = [];
  const rawAccessories = shop.AccessoryStore?.AccessoryStoreOffers || [];
  if (rawAccessories.length > 0) {
    try {
      const [spraysRes, buddiesRes, cardsRes, titlesRes] = await Promise.all([
        axios.get("https://valorant-api.com/v1/sprays"),
        axios.get("https://valorant-api.com/v1/buddies"),
        axios.get("https://valorant-api.com/v1/playercards"),
        axios.get("https://valorant-api.com/v1/playertitles"),
      ]);

      const sprays = spraysRes.data.data;
      const buddies = buddiesRes.data.data;
      const cards = cardsRes.data.data;
      const titles = titlesRes.data.data;
      const accessoryTypeById: Record<string, string> = {
        "dd3bf334-87f3-40cd-b033-6eb857edafb3": "Buddy",
        "d5f120a8-ff8b-4612-ad03-ab9564619d7f": "Spray",
        "3f296c07-64c3-494c-923b-fe692a4fa1bd": "Player Card",
        "de7ea821-1ade-496e-b430-74f83134731a": "Player Title",
      };

      const resolveAccessoryReward = (reward: any) => {
        const itemId = reward?.ItemID;
        const itemTypeId = reward?.ItemTypeID;
        const declaredType = accessoryTypeById[itemTypeId] || "Accessory";

        if (!itemId) {
          return {
            itemId: "",
            itemType: declaredType,
            foundItem: null,
            image: "",
          };
        }

        let foundItem: any = null;
        let itemType = declaredType;
        let image = "";

        if (itemType === "Buddy") {
          foundItem = findCatalogItemById(buddies, itemId);
          image = foundItem?.displayIcon || foundItem?.levels?.[0]?.displayIcon || "";
        } else if (itemType === "Spray") {
          foundItem = findCatalogItemById(sprays, itemId);
          image = foundItem?.fullIcon || foundItem?.displayIcon || foundItem?.levels?.[0]?.displayIcon || "";
        } else if (itemType === "Player Card") {
          foundItem = findCatalogItemById(cards, itemId);
          image = foundItem?.largeArt || foundItem?.wideArt || foundItem?.displayIcon || "";
        } else if (itemType === "Player Title") {
          foundItem = findCatalogItemById(titles, itemId);
        }

        if (!foundItem) {
          const fallbackMatches = [
            { itemType: "Buddy", item: findCatalogItemById(buddies, itemId) },
            { itemType: "Spray", item: findCatalogItemById(sprays, itemId) },
            { itemType: "Player Card", item: findCatalogItemById(cards, itemId) },
            { itemType: "Player Title", item: findCatalogItemById(titles, itemId) },
          ];
          const fallbackMatch = fallbackMatches.find((match) => match.item);

          if (fallbackMatch) {
            itemType = fallbackMatch.itemType;
            foundItem = fallbackMatch.item;
            image =
              foundItem.largeArt ||
              foundItem.wideArt ||
              foundItem.fullIcon ||
              foundItem.displayIcon ||
              foundItem.levels?.[0]?.displayIcon ||
              "";
          }
        }

        return {
          itemId,
          itemType,
          foundItem,
          image,
        };
      };

      for (let i = 0; i < rawAccessories.length; i++) {
        const offer = rawAccessories[i];
        if (!offer.Offer?.Rewards || offer.Offer.Rewards.length === 0) continue;
        const rewards = offer.Offer.Rewards;
        const resolved =
          rewards.map(resolveAccessoryReward).find((reward: any) => reward.foundItem) ||
          resolveAccessoryReward(rewards[0]);
        const costs = Object.values(offer.Offer.Cost || {});

        parsedAccessories.push({
          uuid: offer.Offer.OfferID || resolved.itemId || `accessory-${i}`,
          displayName: resolved.foundItem?.displayName || "Accessory Offer",
          displayIcon: resolved.image,
          Cost: formatNumberWithCommas(costs.length > 0 ? (costs[0] as number) : 0),
          itemType: resolved.itemType,
          originalItem: resolved.foundItem || offer,
        });
      }
    } catch (err) {
      console.error("[Legacy Bridge] Failed to parse accessory store storefront details:", err);
    }
  }

  return {
    storeSkins: parsedOffers,
    featuredBundle: parsedBundle,
    nightMarket: parsedNightMarket,
    accessoryStoreOffers: parsedAccessories,
  };
}

export async function parseShop(shop: any) {
  const shopStore = useShopStore.getState();
  const parsedStorefront = await parseStorefront(shop, {
    skins: shopStore.skins || [],
    bundles: shopStore.bundles || [],
    contentTiers: shopStore.contentTiers || [],
  });

  useShopStore.setState(parsedStorefront);
  return parsedStorefront;
}
