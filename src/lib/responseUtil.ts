import CachedAvatarData from "./CachedAvatarData";
import { Env } from "..";

/*
* If you don't do this, whenever you try to save the image
* the browser will default to naming it "discord-avatar"
*
* Set Content-Deposition to force the browser to name the file as its hash
*/

/**
 * Send an avatar, pulling data from the KV cache.
 * @param res The response from calling fetch() on the avatar URL.
 * @param data The cached avatar data.
 * @returns A response that should be sent to the client.
 */
export function sendCachedImageRequestResponse(res: Response, data: CachedAvatarData) {
    const response = new Response(res.body, res);
    response.headers.append("Content-Disposition", `inline; filename="${data.hash}.${data.type}"`);
    return response;
}


/**
 * Send an avatar, and cache the response for future requests requesting the same avatar.
 * @param res The response from calling fetch() on the avatar URL.
 * @param kvData Data regarding the avatar to be stored in KV.
 * @param env The environment associated with KV.
 * @returns A response that should be sent to the client.
 */
export async function sendAndCacheImageRequestResponse(res: Response, kvData: { guildId: string, hash: string }, env: Env) {
    const response = new Response(res.body, res);
    const type = res.headers.get("Content-Type")!.replace("image/", "");

    await env.CACHE.put(`avatar_${kvData.guildId}`, JSON.stringify({hash: kvData.hash, type}), { expirationTtl: 600 });

    response.headers.append("Content-Disposition", `inline; filename="${kvData.hash}.${type}"`);
    return response;
}
