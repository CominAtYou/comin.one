import discordAvatar from "./discord/discordAvatar";

const processedRedirects = new Map([
	["/discord-avatar", discordAvatar]
]);

const simpleRedirects = new Map([
	["/favicon.ico", "https://cominatyou.com/favicons/favicon-light.ico"]
])

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
		else if (processedRedirects.has(url.pathname)) {
			return await processedRedirects.get(url.pathname)!(request, env, ctx);
		}
		else if (simpleRedirects.has(url.pathname)) {
			return Response.redirect(simpleRedirects.get(url.pathname)!, 301);
		}
		else {
			return await fetch("https://http.cat/" + 404);
		}
	}
};
