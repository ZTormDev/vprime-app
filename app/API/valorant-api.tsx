import axios from "axios";
import jwtDecode from "jwt-decode";

export async function getGameSkins() {
    try {
        const response = await axios("https://valorant-api.com/v1/weapons/skins");
        return response.data;
    }
    catch (error) {
        console.error(error);
    }
}

export async function getSkinImage(skinUUID: string) {
    try {
        const response = await axios(`https://valorant-api.com/v1/weapons/skinlevels/${skinUUID}`);
        return response.data.data.displayIcon;
    }
    catch (error) {
        console.error(error);
    }
}

export async function getSkinName(skinUUID: string) {
    try {
        const response = await axios(`https://valorant-api.com/v1/weapons/skinlevels/${skinUUID}`);
        return JSON.stringify(response.data.data.displayName).replace(/"/g, '');
    }
    catch (error) {
        console.error(error);
    }
}

export async function getSkinPrice(skinUUID: string) {
    try {
        const response = await axios(`https://valorant-api.com/v1/weapons/skinlevels/${skinUUID}`);
        return JSON.stringify(response.data.data.displayName).replace(/"/g, '');
    }
    catch (error) {
        console.error(error);
    }
}