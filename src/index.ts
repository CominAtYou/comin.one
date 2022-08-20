import discordAvatar from "./discord/discordAvatar";

const map = new Map([
	["/discord-avatar", discordAvatar]
]);

export interface Env {
	// Binding to KV. https://developers.cloudflare.com/workers/runtime-apis/kv/
	CACHE: KVNamespace;
	CREDS: KVNamespace;
	CLIENT_ID: string;
	CLIENT_SECRET: string;
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
