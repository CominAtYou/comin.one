import { RESTGetAPICurrentUserResult } from "discord-api-types/v10";
import { Env } from "..";
import CachedImageData from "../lib/CachedImageData";
import { sendAndCacheImageRequestResponse, sendCachedImageRequestResponse } from "../lib/responseUtil";
import updateToken from "./tokenManagement";

export default async function discordBanner(_request: Request, env: Env): Promise<Response> {
    const cachedBannerData = await env.CACHE.get("banner_data");
    if (cachedBannerData !== null) {
        const bannerData: CachedImageData = JSON.parse(cachedBannerData);
        const banner = await fetch(`https://cdn.discordapp.com/banners/${env.DISCORD_ID}/${bannerData.hash}?size=1024`);
        return sendCachedImageRequestResponse(banner, bannerData);
    }

    if (await env.CREDS.get("access_token") === null) {
        await updateToken(env);
    }

    const req = await fetch("https://discord.com/api/v10/users/@me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${await env.CREDS.get("access_token")}`
        }
    });

    if (!req.ok) {
        throw new Error("Failed to get banner hash");
    }

    const response: RESTGetAPICurrentUserResult = await req.json();
    const banner = await fetch(`https://cdn.discordapp.com/banners/${env.DISCORD_ID}/${response.banner}?size=1024`);

    return sendAndCacheImageRequestResponse(banner, { guildId: "default", hash: response.banner! }, env, true);
}
