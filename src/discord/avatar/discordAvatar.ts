import { Env } from "../..";
import checkForGuildMembership from "../guilds";
import updateToken from "../tokenManagement";
import getDefaultAvatar from "./defaultAvatar";
import getGuildAvatar from "./guildAvatar";

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
