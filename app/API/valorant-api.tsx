import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { useState } from "react";

export let skins: any = [];
export let bundles: any = [];
export let featuredBundle: any = {};
export let nightMarket: any = {
    Offers: [],
    TimeRemaining: 0
};
export let storeSkins: any = [];
export let wishListSkins: any = [];


export const extraHeaders = {
    "X-Riot-ClientVersion": "43.0.1.4195386.4190634",
    "X-Riot-ClientPlatform": btoa(
      JSON.stringify({
        platformType: "PC",
        platformOS: "Windows",
        platformOSVersion: "10.0.19042.1.256.64bit",
        platformChipset: "Unknown",
      }),
    ),
  };

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

export async function getGameSkins() {
    skins = null;
    await axios({
        url: `https://valorant-api.com/v1/weapons/skins?en-US`,
        method: "GET",
    }).then((response) => {
        skins = response.data.data
            .filter((skin: any) => 
                !skin.displayName.toLowerCase().includes("default") && 
                !skin.displayName.toLowerCase().includes("standard") && 
                !skin.displayName.toLowerCase().includes("random")
            )
            .sort((a: any, b: any) => 
                a.displayName.localeCompare(b.displayName)
            ); // Ordenar las skins alfabéticamente
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

    let bundle: any = bundles.find((bundle: any) => bundle.uuid === featuredBundleObject.DataAssetID);

    if (bundle) {
        for (let i = 0; i < featuredBundleItems.length; i++) {
            // Accede al ItemID dentro de cada elemento del bundle
            let skin: any = skins.find((skin: any) => skin.levels[0].uuid === featuredBundleItems[i].Item.ItemID);

            if (skin != null && skin != undefined) {
                // Obtén el precio descontado directamente
                let costValue = featuredBundleItems[i].DiscountedPrice;

                // Si el precio existe, lo formatea y asigna
                if (costValue) {
                    skin.Cost = formatNumberWithCommas(costValue);
                }
                
                items.push(skin);
            }
        }

        if (items != null && items != undefined) {
            bundle.bundleItems = items;
        }
        else {
            bundle.bundleItems = null;
        }

        bundle.bundlePrice = formatNumberWithCommas(featuredBundleObject.TotalDiscountedCost[featuredBundleObject.CurrencyID]);
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
        let skin: any = skins.find((skin: any) => skin.levels[0].uuid === singleItem[i].OfferID);

        if (skin) {
            let costValues = Object.values(singleItem[i].Cost);

            if (costValues.length > 0) {
                // Asignar el costo y formatearlo con la función personalizada
                let costValue:any = costValues[0];
                skin.Cost = formatNumberWithCommas(costValue); // Usar la función personalizada
                
                // Opcional: convertir a número si es necesario para otras operaciones
                let numericCostValue = Number(costValue);

                if (numericCostValue >= 2175) {
                    skin.VariantColor = '#ff844f';
                } else if (numericCostValue === 1775) {
                    skin.VariantColor = '#df668c';
                } else if (numericCostValue === 1275) {
                    skin.VariantColor = '#4dc785';
                } else if (numericCostValue <= 875) {
                    skin.VariantColor = '#6cb2e3';
                }               
            }
            storeSkins.OffersTimeRemaining = shop.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds;
            storeSkins.push(skin);
        }
    }

    parseFeaturedBundle(shop);
    parseNightMarket(shop);
}

function parseNightMarket(shop: any) {
    nightMarket = {
        Offers: [], // Aquí será un arreglo plano de objetos de skins
        TimeRemaining: 0
    };

    if (shop.BonusStore != null && shop.BonusStore != undefined) {

        console.log("SE ENCONTRO TIENDA NOCTURNA");

        let nightMarketOffers: any[] = shop.BonusStore.BonusStoreOffers;

        for (let i = 0; i < nightMarketOffers.length; i++) {
            // Busca el skin en la lista de skins
            let skin: any = skins.find((skin: any) => skin.levels[0].uuid === nightMarketOffers[i].Offer.OfferID);

            if (skin) {
                console.log("SE ENCONTRO UNA SKIN EN LA TIENDA NOCTURNA");
                let costValues = Object.values(nightMarketOffers[i].DiscountCosts);
                let originalCostValues = Object.values(nightMarketOffers[i].Offer.Cost);

                if (originalCostValues.length > 0) {
                    let originalCostValue: any = originalCostValues[0];
                    let costValue: any = costValues[0];

                    skin.Cost = formatNumberWithCommas(costValue);
                    skin.OriginalCost = formatNumberWithCommas(originalCostValue);

                    let numericCostValue = Number(originalCostValue);

                    // Asignar un color según el costo
                    if (numericCostValue >= 2175) {
                        skin.VariantColor = '#ff844f';
                    } else if (numericCostValue === 1775) {
                        skin.VariantColor = '#df668c';
                    } else if (numericCostValue === 1275) {
                        skin.VariantColor = '#4dc785';
                    } else if (numericCostValue <= 875) {
                        skin.VariantColor = '#6cb2e3';
                    }
                }

                // Agregar cada skin individualmente a nightMarket.Offers
                nightMarket.Offers.push(skin);
            }
        }

        nightMarket.TimeRemaining = shop.BonusStore.BonusStoreRemainingDurationInSeconds;
    } else {
        console.log("NO SE ENCONTRO TIENDA NOCTURNA!");
        nightMarket = null;
    }
}



export async function getSkin(skinUUID: string) {
    let skin: any = storeSkins.find((skin: any) => skin.levels[0].uuid === skinUUID);

    return skin;
}


export async function addSkinToWishList(skin: any) {
    const skinExists: boolean = wishListSkins.find((skinInWishList: any) => skinInWishList.uuid === skin.uuid);


    if (!skinExists) {
        // Agregar la skin si no está en la wishlist
        wishListSkins.push(skin);
        try {
            await AsyncStorage.setItem('wishListSkins', JSON.stringify(wishListSkins));
        } catch (error) {
            console.error('Error guardando en AsyncStorage:', error);
        }
    } else {
        // Eliminar la skin de la wishlist si ya existe
        wishListSkins = wishListSkins.filter((skinInWishList: any) => skinInWishList.uuid !== skin.uuid);
        try {
            await AsyncStorage.setItem('wishListSkins', JSON.stringify(wishListSkins));
        } catch (error) {
            console.error('Error eliminando en AsyncStorage:', error);
        }
    } 
}

export async function isInWishList(skin: any) {
    const skinExists: boolean = wishListSkins.find((skinInWishList: any) => skinInWishList.uuid === skin.uuid);
    return skinExists;
}


export async function fetchSkinsWishList() {
    try {
        const storageWishList = await AsyncStorage.getItem('wishListSkins');

        if (storageWishList) {
            wishListSkins = JSON.parse(storageWishList);
        } else {
            wishListSkins = [];
        }
    } catch (error) {
        console.error('Error fetching skins from AsyncStorage:', error);
    }
}
