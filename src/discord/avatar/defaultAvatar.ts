import { RESTGetAPICurrentUserResult } from "discord-api-types/v10";
import { Env } from "../..";
import CachedImageData from "../../lib/CachedImageData";
import { sendAndCacheImageRequestResponse, sendCachedImageRequestResponse } from "../../lib/responseUtil";

export default async function getDefaultAvatar(env: Env): Promise<Response> {
    const cachedAvatarJson = await env.CACHE.get("avatar_default");
    if (cachedAvatarJson !== null) {
        const cachedAvatarData: CachedImageData = JSON.parse(cachedAvatarJson);
        const avatar = await fetch(`https://cdn.discordapp.com/avatars/${env.DISCORD_ID}/${cachedAvatarData.hash}?size=1024`);
        return sendCachedImageRequestResponse(avatar, cachedAvatarData);
    }

    const req = await fetch("https://discord.com/api/v10/users/@me", {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${await env.CREDS.get("access_token")}`
        }
    });

    if (!req.ok) {
        throw new Error("Failed to get default avatar hash");
    }

    const response: RESTGetAPICurrentUserResult = await req.json();

    const avatar = await fetch(`https://cdn.discordapp.com/avatars/${env.DISCORD_ID}/${response.avatar}?size=1024`);
    return await sendAndCacheImageRequestResponse(avatar, { guildId: "default", hash: response.avatar! }, env);
}
