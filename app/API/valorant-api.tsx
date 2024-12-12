import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { useState } from "react";

export let skins: any = [];
export let bundles: any = [];
export let featuredBundle: any = {};
export let nightMarket: any = {
  Offers: [],
  TimeRemaining: 0,
};
export let storeSkins: any = [];
export let wishListSkins: any = [];
export let contentTiers: any = {};
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

export async function getRankTiers() {
  RankTiers = null;

  const url = `https://valorant-api.com/v1/competitivetiers`;

  try {
    await axios({
      url: url,
      method: "GET",
    }).then((response) => {
      RankTiers = response.data.data;
      return RankTiers;
    });
  } catch (error) {
    console.error("Error consiguiendo los rank tiers: " + error);
  }
}

export const matchDetails = async (
  shard: any,
  authToken: any,
  entitlementToken: any,
  matchID: any
) => {
  const url = `https://pd.${shard}.a.pvp.net/match-details/v1/matches/${matchID}`;

  const headers = {
    "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
    "X-Riot-ClientVersion": extraHeaders["X-Riot-ClientVersion"],
    "X-Riot-Entitlements-JWT": entitlementToken,
    Authorization: `Bearer ${authToken}`,
  };

  await axios
    .get(url, { headers })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Failed to get match details: " + error);
    });
};

export async function getMaps() {
  Maps = null;
  await axios({
    url: `https://valorant-api.com/v1/maps`,
    method: "GET",
  }).then((response) => {
    Maps = response.data.data;
    return Maps;
  });
}

export async function getAgents() {
  Agents = null;
  await axios({
    url: `https://valorant-api.com/v1/agents`,
    method: "GET",
  }).then((response) => {
    Agents = response.data.data;
    return Agents;
  });
}

export async function getPlayerMMR() {
  PlayerMMR = null;

  const url = `https://pd.${Shard}.a.pvp.net/mmr/v1/players/${PlayerUUID}`;
  const headers = {
    "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
    "X-Riot-ClientVersion": extraHeaders["X-Riot-ClientVersion"],
    "X-Riot-Entitlements-JWT": EntitlementsToken,
    Authorization: `Bearer ${AccessToken}`,
  };

  try {
    const response = await axios.get(url, { headers });
    const playerMmr = response.data;

    if (playerMmr) {
      PlayerMMR = playerMmr;

      const playerRank = RankTiers[RankTiers.length - 1].tiers.find(
        (rank: any) =>
          rank.tier === playerMmr.LatestCompetitiveUpdate.TierBeforeUpdate
      );
      if (playerRank) {
        PlayerMMR.Rank = playerRank;
      }
    }
  } catch (error) {
    console.error("ERROR AL CONSEGUIR PLAYER MMR: " + error);
  }
}

export function eraseMathHistory() {
  MatchHistoryData = null;
}

export async function getMatchHistory() {
  MatchHistoryData = null;
  const startIndex = "0";
  const endIndex = "15";

  const url = `https://pd.${Shard}.a.pvp.net/mmr/v1/players/${PlayerUUID}/competitiveupdates?startIndex=${startIndex}&endIndex=${endIndex}`;

  const headers = {
    "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
    "X-Riot-ClientVersion": extraHeaders["X-Riot-ClientVersion"],
    "X-Riot-Entitlements-JWT": EntitlementsToken,
    Authorization: `Bearer ${AccessToken}`,
  };

  try {
    const response = await axios.get(url, { headers });
    MatchHistoryData = response.data;

    if (MatchHistoryData && MatchHistoryData.Matches) {
      // Agregar detalles para cada partida
      await Promise.all(
        MatchHistoryData.Matches.map(async (match: any, index: any) => {
          const matchDetailsUrl = `https://pd.${Shard}.a.pvp.net/match-details/v1/matches/${match.MatchID}`;
          try {
            const matchDetailsResponse = await axios.get(matchDetailsUrl, {
              headers,
            });
            MatchHistoryData.Matches[index].Details = matchDetailsResponse.data;

            // BUSCAR EL MAPA
            const map = Maps.find(
              (map: any) =>
                map.mapUrl === matchDetailsResponse.data.matchInfo.mapId
            );

            if (map) {
              MatchHistoryData.Matches[index].Details.MapDetails = map;
            }

            // Buscar el jugador cuyo `subject` coincida con el `playerUUID`
            const player = matchDetailsResponse.data.players.find(
              (p: any) => p.subject === PlayerUUID
            );

            if (player) {
              const playerAgent = Agents.find(
                (agent: any) => agent.uuid === player.characterId
              );

              if (playerAgent) {
                MatchHistoryData.Matches[index].Details.PlayerAgent =
                  playerAgent;
              }

              // Encontrar el equipo correspondiente al jugador
              const playerTeam = match.Details.teams.find(
                (t: any) => t.teamId === player.teamId
              );

              // Set EnemyTeamRoundsWon to the rounds won by the opposing team
              const enemyTeam = matchDetailsResponse.data.teams.find(
                (t: any) => t.teamId !== player.teamId
              );

              if (player && playerTeam && enemyTeam) {
                MatchHistoryData.Matches[index].Details.Player = player;
                MatchHistoryData.Matches[index].Details.PlayerTeamRoundsWon =
                  playerTeam.roundsWon;
                MatchHistoryData.Matches[index].Details.EnemyTeamRoundsWon =
                  enemyTeam.roundsWon;
                MatchHistoryData.Matches[index].Details.playerTeam =
                  playerTeam.teamId;

                const playerRank = RankTiers[RankTiers.length - 1].tiers.find(
                  (rank: any) => rank.tier === match.TierAfterUpdate
                );
                if (playerRank) {
                  MatchHistoryData.Matches[index].Details.Player.Rank =
                    playerRank;
                }

                // Assign the result (Victory, Defeat, or Draw) based on rounds won
                if (playerTeam.roundsWon > enemyTeam.roundsWon) {
                  MatchHistoryData.Matches[index].Details.result = "Victory";
                } else if (playerTeam.roundsWon < enemyTeam.roundsWon) {
                  MatchHistoryData.Matches[index].Details.result = "Defeat";
                } else {
                  MatchHistoryData.Matches[index].Details.result = "Draw";
                }
              }
            }
          } catch (matchError) {
            console.error(
              `Error al obtener detalles para la partida ${match.MatchID}: `,
              matchError
            );
          }
        })
      );
    }
  } catch (error) {
    console.error("ERROR AL CONSEGUIR PLAYER MATCH HISTORY: " + error);
  }
}

export async function getPlayerCard() {
  PlayerCard = null;

  const url = `https://valorant-api.com/v1/playercards/${PlayerLoadout.Identity.PlayerCardID}`;
  await axios
    .get(url)
    .then((response) => {
      PlayerCard = response.data.data;
    })
    .catch((error) => {
      console.error("ERROR AL CONSEGUIR PLAYER CARD: " + error);
    });
}

export async function GetPlayerLoadout() {
  PlayerLoadout = null;

  // Configura la URL del endpoint
  const url = `https://pd.${Shard}.a.pvp.net/personalization/v2/players/${PlayerUUID}/playerloadout`;

  // Configura los headers requeridos
  const headers = {
    "X-Riot-ClientPlatform": extraHeaders["X-Riot-ClientPlatform"],
    "X-Riot-ClientVersion": extraHeaders["X-Riot-ClientVersion"],
    "X-Riot-Entitlements-JWT": EntitlementsToken,
    Authorization: `Bearer ${AccessToken}`,
  };

  // Realiza la solicitud
  await axios
    .get(url, { headers })
    .then((response) => {
      // Devuelve la respuesta
      PlayerLoadout = response.data;
    })
    .catch((error) => {
      console.error("ERROR AL CONSEGUIR PLAYER LOADOUT: " + error);
    });
}

export function SetPlayerUUID(puuid: any) {
  PlayerUUID = puuid;
}
export function SetAccessToken(access_token: any) {
  AccessToken = access_token;
}
export function SetIdToken(id_token: any) {
  IdToken = id_token;
}
export function SetExpiresIn(expires: any) {
  ExpiresIn = expires;
}
export function SetTagline(tagline: any) {
  TagLine = tagline;
}
export function SetGameName(gamename: any) {
  GameName = gamename;
}
export function SetEntitlementsToken(token: any) {
  EntitlementsToken = token;
}

export async function SetAccountShard() {
  try {
    const res = await axios.request({
      url: "https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant",
      method: "PUT",
      headers: {
        Authorization: `Bearer ${AccessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        id_token: IdToken,
      },
    });

    const live = res.data.affinities.live;
    switch (live) {
      case "latam":
        return (Shard = "na");
      case "br":
        return (Shard = "na");
      case "na":
        return (Shard = "na");
      case "eu":
        return (Shard = "eu");
      case "ap":
        return (Shard = "ap");
      case "kr":
        return (Shard = "kr");
    }
  } catch (error: any) {
    console.error(
      "Error fetching shard information:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function loadVersion() {
  try {
    const res = await axios.request({
      url: "https://valorant-api.com/v1/version",
      method: "GET",
    });

    extraHeaders["X-Riot-ClientVersion"] = res.data.data.riotClientVersion;
  } catch (e) {
    console.log(e);
  }
}

export async function getContentTiers() {
  contentTiers = null;
  await axios({
    url: "https://valorant-api.com/v1/contenttiers",
    method: "GET",
  }).then((response) => {
    contentTiers = response.data.data;
  });
}

export async function getGameSkins() {
  skins = null;
  await axios({
    url: `https://valorant-api.com/v1/weapons/skins?en-US`,
    method: "GET",
  }).then((response) => {
    skins = response.data.data
      .filter(
        (skin: any) =>
          !skin.displayName.toLowerCase().includes("default") &&
          !skin.displayName.toLowerCase().includes("standard") &&
          !skin.displayName.toLowerCase().includes("random")
      )
      .sort((a: any, b: any) => a.displayName.localeCompare(b.displayName)); // Ordenar las skins alfabéticamente
    return skins;
  });
}

export async function getBundles() {
  bundles = null;
  await axios({
    url: `https://valorant-api.com/v1/bundles?en-US`,
    method: "GET",
  }).then((response) => {
    bundles = response.data.data;
    return bundles;
  });
}

function parseFeaturedBundle(shop: any) {
  let featuredBundleObject = shop.FeaturedBundle.Bundles[0];
  let featuredBundleItems = featuredBundleObject.Items;
  let items: any[] = [];

  featuredBundle = {};
  let bundle: any = bundles.find(
    (bundle: any) => bundle.uuid === featuredBundleObject.DataAssetID
  );

  if (bundle) {
    for (let i = 0; i < featuredBundleItems.length; i++) {
      // Accede al ItemID dentro de cada elemento del bundle
      let skin: any = skins.find(
        (skin: any) =>
          skin.levels[0].uuid === featuredBundleItems[i].Item.ItemID
      );

      if (skin != null && skin != undefined) {
        // Obtén el precio descontado directamente
        let costValue = null;
        if (featuredBundleItems[i].DiscountedPrice == 0) {
          costValue = featuredBundleItems[i].BasePrice;
        } else {
          costValue = featuredBundleItems[i].DiscountedPrice;
        }

        if (costValue) {
          skin.Cost = formatNumberWithCommas(costValue);
        }

        let skinTier: any = contentTiers.find(
          (tier: any) => tier.uuid === skin.contentTierUuid
        );

        if (skinTier) {
          skin.TierColor = getTierColor(skinTier);
          skin.TierName = skinTier.displayName;
        }

        items.push(skin);
      }
    }

    if (items != null && items != undefined) {
      bundle.bundleItems = items;
    } else {
      bundle.bundleItems = null;
    }

    bundle.bundlePrice = formatNumberWithCommas(
      featuredBundleObject.TotalDiscountedCost[featuredBundleObject.CurrencyID]
    );
    bundle.timeRemaining = featuredBundleObject.DurationRemainingInSeconds;
    featuredBundle = bundle;
  }
}

function formatNumberWithCommas(number: number) {
  // Convierte el número a una cadena y utiliza una expresión regular para agregar comas
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export async function parseShop(shop: any) {
  /* NORMAL SHOP */
  let singleItemOffers = shop.SkinsPanelLayout.SingleItemStoreOffers;
  let singleItem: any[] = [];
  storeSkins = [];

  singleItemOffers.forEach((item: any) => {
    singleItem.push(item);
  });

  for (let i = 0; i < singleItem.length; i++) {
    // Busca el skin en la lista de skins
    let skin: any = skins.find(
      (skin: any) => skin.levels[0].uuid === singleItem[i].OfferID
    );

    if (skin) {
      let costValues = Object.values(singleItem[i].Cost);

      if (costValues.length > 0) {
        // Asignar el costo y formatearlo con la función personalizada
        let costValue: any = costValues[0];
        skin.Cost = formatNumberWithCommas(costValue); // Usar la función personalizada
      }

      let skinTier: any = contentTiers.find(
        (tier: any) => tier.uuid === skin.contentTierUuid
      );

      if (skinTier) {
        skin.TierColor = getTierColor(skinTier);
        skin.TierName = skinTier.displayName;
      }

      storeSkins.OffersTimeRemaining =
        shop.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds;
      storeSkins.push(skin);
    }
  }

  parseFeaturedBundle(shop);
  parseNightMarket(shop);
}

function parseNightMarket(shop: any) {
  nightMarket = null;

  if (shop.BonusStore != null && shop.BonusStore != undefined) {
    let nightMarketOffers: any[] = shop.BonusStore.BonusStoreOffers;

    for (let i = 0; i < nightMarketOffers.length; i++) {
      // Busca el skin en la lista de skins
      let skin: any = skins.find(
        (skin: any) =>
          skin.levels[0].uuid === nightMarketOffers[i].Offer.OfferID
      );

      if (skin) {
        let costValues = Object.values(nightMarketOffers[i].DiscountCosts);
        let originalCostValues = Object.values(nightMarketOffers[i].Offer.Cost);

        if (originalCostValues.length > 0) {
          let originalCostValue: any = originalCostValues[0];
          let costValue: any = costValues[0];

          skin.Cost = formatNumberWithCommas(costValue);
          skin.OriginalCost = formatNumberWithCommas(originalCostValue);
        }

        let skinTier: any = contentTiers.find(
          (tier: any) => tier.uuid === skin.contentTierUuid
        );

        if (skinTier) {
          skin.TierColor = getTierColor(skinTier);
          skin.TierName = skinTier.displayName;
        }

        // Agregar cada skin individualmente a nightMarket.Offers
        nightMarket.Offers.push(skin);
      }
    }

    nightMarket.TimeRemaining =
      shop.BonusStore.BonusStoreRemainingDurationInSeconds;
  } else {
    console.log("NO SE ENCONTRO TIENDA NOCTURNA!");
    nightMarket = null;
  }
}

export async function getSkin(skinUUID: string) {
  let skin: any = storeSkins.find(
    (skin: any) => skin.levels[0].uuid === skinUUID
  );
  return skin;
}

export async function addSkinToWishList(skin: any) {
  const skinExists: boolean = wishListSkins.find(
    (skinInWishList: any) => skinInWishList.uuid === skin.uuid
  );

  if (!skinExists) {
    // Agregar la skin si no está en la wishlist
    wishListSkins.push(skin);
    try {
      await AsyncStorage.setItem(
        "wishListSkins",
        JSON.stringify(wishListSkins)
      );
    } catch (error) {
      console.error("Error guardando en AsyncStorage:", error);
    }
  } else {
    // Eliminar la skin de la wishlist si ya existe
    wishListSkins = wishListSkins.filter(
      (skinInWishList: any) => skinInWishList.uuid !== skin.uuid
    );
    try {
      await AsyncStorage.setItem(
        "wishListSkins",
        JSON.stringify(wishListSkins)
      );
    } catch (error) {
      console.error("Error eliminando en AsyncStorage:", error);
    }
  }
}

export async function isInWishList(skin: any) {
  const skinExists: boolean = wishListSkins.find(
    (skinInWishList: any) => skinInWishList.uuid === skin.uuid
  );
  return skinExists;
}

export async function fetchSkinsWishList() {
  try {
    const storageWishList = await AsyncStorage.getItem("wishListSkins");

    if (storageWishList) {
      wishListSkins = JSON.parse(storageWishList);
    } else {
      wishListSkins = [];
    }
  } catch (error) {
    console.error("Error fetching skins from AsyncStorage:", error);
  }
}

const getTierColor = (skinTier: any) => {
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
  }
};
