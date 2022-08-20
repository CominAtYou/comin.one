import { Env } from ".."
import { RESTPostOAuth2ClientCredentialsResult } from "discord-api-types/v10";

export default async function updateToken(env: Env) {
    const req = await fetch("https://discord.com/api/v10/oauth2/token", {
        method: 'POST',
        headers: {
            // @ts-ignore
            Authorization: `Basic ${btoa(`${env.CLIENT_ID}:${env.CLIENT_SECRET}`)}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials&scope=identify%20guilds%20guilds.members.read"
    });

    if (!req.ok) {
        console.log(req.status);
        console.log(await req.text());
        throw new Error("Failed to get token");
    }

    const response: RESTPostOAuth2ClientCredentialsResult = await req.json();
    await env.CREDS.put("access_token", response.access_token, { expirationTtl: response.expires_in });
}
