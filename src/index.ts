import discordAvatar from "./discord/avatar/discordAvatar";
import discordBanner from "./discord/discordBanner";

const processedRedirects = new Map([
	["/discord-avatar", discordAvatar],
	["/discord-banner", discordBanner]
]);

const simpleRedirects = new Map([
	["/favicon.ico", "https://cominatyou.com/favicons/favicon-light.ico"],
	["/github", "https://github.com/CominAtYou"],
	["/twitter", "https://www.twitter.com/iiCominAtYou"],
    ["/steam", "https://steamcommunity.com/profiles/76561198366095638"],
    ["/", "https://cominatyou.com"]
]);
export interface Env {
	// Binding to KV. https://developers.cloudflare.com/workers/runtime-apis/kv/
	CACHE: KVNamespace;
	CREDS: KVNamespace;
	CLIENT_ID: string;
	CLIENT_SECRET: string;
	DISCORD_ID: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (processedRedirects.has(url.pathname)) {
			return await processedRedirects.get(url.pathname)!(request, env);
		}
		else if (simpleRedirects.has(url.pathname)) {
			return Response.redirect(simpleRedirects.get(url.pathname)!, 301);
		}
		else {
			return await fetch("https://http.cat/404");
		}
	}
};
