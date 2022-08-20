import { RESTGetAPICurrentUserResult, RESTGetAPIGuildMemberResult } from "discord-api-types/v10";
import { Env } from "..";
import checkForGuildMembership from "./guilds";
import updateToken from "./tokenManagement";

export default async function discordAvatar(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    let id = url.searchParams.get("server");

    // validate ID - if invalid, get default avatar
    if (!/[0-9]{17,19}/.test(id as string)) id = null;

    if (await env.CREDS.get("access_token") === null) {
        await updateToken(env);
    }

    if (id !== null) {
        // If guild ID is not a server I am in, get default avatar
        if (!(await checkForGuildMembership(env, id))) id = null;
    }

    return id === null ? await getDefaultAvatar(env) : await getGuildAvatar(id, env);
}

async function getDefaultAvatar(env: Env): Promise<Response> {
    const cachedAvatarHash = await env.CACHE.get("avatar_default");
    if (cachedAvatarHash !== null) {
        return await fetch(`https://cdn.discordapp.com/avatars/${env.DISCORD_ID}/${cachedAvatarHash}?size=1024`);
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
    await env.CACHE.put("avatar_default", response.avatar as string, { expirationTtl: 600 });

    return await fetch(`https://cdn.discordapp.com/avatars/${env.DISCORD_ID}/${response.avatar}?size=1024`);
}

async function getGuildAvatar(id: string, env: Env): Promise<Response> {
    const cachedGuildAvatarHash = await env.CACHE.get(`avatar_${id}`);

    if (cachedGuildAvatarHash === "default") {
        return await getDefaultAvatar(env);
    }
    else if (cachedGuildAvatarHash !== null) {
        return await fetch(`https://discord.com/guilds/${id}/users/${env.DISCORD_ID}/${cachedGuildAvatarHash}?size=1024`);
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

    if (response.avatar === null) {
        await env.CACHE.put(`avatar_${id}`, "default", { expirationTtl: 600 });
        return await getDefaultAvatar(env);
    }
    else {
        await env.CACHE.put(`avatar_${id}`, response.avatar as string, { expirationTtl: 600 });
        return await fetch(`https://cdn.discordapp.com/guilds/${id}/users/${env.DISCORD_ID}/avatars/${response.avatar as string}?size=1024`);
    }
}
