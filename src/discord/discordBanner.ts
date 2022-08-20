import { RESTGetAPICurrentUserResult } from "discord-api-types/v10";
import { Env } from "..";
import updateToken from "./tokenManagement";

export default async function discordBanner(request: Request, env: Env): Promise<Response> {
    const cachedBannerHash = await env.CACHE.get("banner_hash");
    if (cachedBannerHash !== null) {
        return await fetch(`https://cdn.discordapp.com/banners/${env.DISCORD_ID}/${cachedBannerHash}?size=1024`);
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
    await env.CACHE.put("banner_hash", response.banner as string, { expirationTtl: 600 });

    return await fetch(`https://cdn.discordapp.com/banners/${env.DISCORD_ID}/${response.banner}?size=1024`);
}
