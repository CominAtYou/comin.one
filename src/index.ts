/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import discordAvatar from "./discord/discordAvatar";
import checkForGuildMembership from "./discord/guilds";

const map = new Map([
	["/discord-avatar", discordAvatar]
]);

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	CACHE: KVNamespace;
	CREDS: KVNamespace;
	CLIENT_ID: string;
	CLIENT_SECRET: string;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/") {
			return Response.redirect("https://www.cominatyou.com", 301);
		}
		if (!map.has(url.pathname)) {
			return new Response(`Can't find ${url.pathname}`, { status: 404, statusText: "Not Found" });
		}
		//@ts-ignore
		return await map.get(url.pathname)(request, env, ctx);
	}
};
