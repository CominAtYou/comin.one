import { Env } from "..";
import { RESTGetAPICurrentUserGuildsResult } from "discord-api-types/v10";

export default async function checkForGuildMembership(env: Env, guildId: string): Promise<boolean> {
    const guilds = await env.CACHE.get("guild_cache");
    if (guilds !== null) {
        return (JSON.parse(guilds) as RESTGetAPICurrentUserGuildsResult).some(s => s.id === guildId);
    }

    const req = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${await env.CREDS.get("access_token")}`
        }
    });

    if (!req.ok) throw new Error("Failed to get list of guilds");

    const result: RESTGetAPICurrentUserGuildsResult = await req.json();
    await env.CACHE.put("guild_cache", JSON.stringify(result), { expirationTtl: 604800 });

    return result.some(s => s.id === guildId);
}
