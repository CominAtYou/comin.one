import { RESTGetAPIGuildMemberResult } from "discord-api-types/v10";
import { Env } from "../..";
import CachedImageData from "../../lib/CachedImageData";
import { sendAndCacheImageRequestResponse, sendCachedImageRequestResponse } from "../../lib/responseUtil";
import getDefaultAvatar from "./defaultAvatar";

export default async function getGuildAvatar(id: string, env: Env): Promise<Response> {
    const cachedGuildAvatarJson = await env.CACHE.get(`avatar_${id}`);
    if (cachedGuildAvatarJson !== null) {
        const cachedAvatarData: CachedImageData = JSON.parse(cachedGuildAvatarJson);

        if (cachedAvatarData.hash === "default") {
            return await getDefaultAvatar(env);
        }

        const avatar = await fetch(`https://cdn.discordapp.com/guilds/${id}/users/${env.DISCORD_ID}/avatars/${cachedAvatarData.hash}?size=1024`);
        return sendCachedImageRequestResponse(avatar, cachedAvatarData);
    }

    const req = await fetch(`https://discord.com/api/v10/users/@me/guilds/${id}/member`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${await env.CREDS.get("access_token")}`
        }
    });

    if (!req.ok) {
        throw new Error("Failed to fetch avatar for guild with ID " + id);
    }

    const response: RESTGetAPIGuildMemberResult = await req.json();

    if (!response.avatar) {
        await env.CACHE.put(`avatar_${id}`, "default", { expirationTtl: 600 });
        return await getDefaultAvatar(env);
    }
    else {
        const avatar = await fetch(`https://cdn.discordapp.com/guilds/${id}/users/${env.DISCORD_ID}/avatars/${response.avatar as string}?size=1024`);
        return await sendAndCacheImageRequestResponse(avatar, { guildId: id, hash: response.avatar! }, env);
    }
}
