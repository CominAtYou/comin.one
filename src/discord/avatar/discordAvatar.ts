import { Env } from "../..";
import checkForGuildMembership from "../guilds";
import updateToken from "../tokenManagement";
import getDefaultAvatar from "./defaultAvatar";
import getGuildAvatar from "./guildAvatar";

export default async function discordAvatar(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const id = url.searchParams.get("server");

    // validate ID
    if (id && !/[0-9]{17,19}/.test(id)) {
        return new Response("Invalid server ID", { status: 400 });
    }

    if (!(await env.CREDS.get("access_token"))) {
        await updateToken(env);
    }

    if (id && !(await checkForGuildMembership(env, id))) {
        return new Response("Not Found", { status: 404 });
    }

    return id ? await getGuildAvatar(id, env) : await getDefaultAvatar(env);
}
