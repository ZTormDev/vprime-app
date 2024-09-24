import axios from "axios";
import jwtDecode from "jwt-decode";

export let skins: any[] = [];
export let storeSkins: any[] = [];

export async function getGameSkins() {
    try {
        const response = await axios({
            url: `https://valorant-api.com/v1/weapons/skins?en-US`,
            method: "GET",
        });
        skins = response.data.data;
        return skins;
    }
    catch (error) {
        console.error(error);
    }
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
        let skin: any = skins.find((skin) => skin.levels[0].uuid === singleItem[i].OfferID);

        if (skin) {
            let costValues = Object.values(singleItem[i].Cost);

            if (costValues.length > 0) {
                skin.Cost = costValues[0];
            }
            storeSkins.push(skin);
        }
    }
}

export async function getSkin(skinUUID: string) {
    let skin: any = storeSkins.find((skin) => skin.levels[0].uuid === skinUUID);

    return skin;
}