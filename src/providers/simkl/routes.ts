import { FastifyInstance, FastifyRequest } from "fastify";
import qs from "node:querystring";
import type { Context } from "@providers/index.js";

const SIMKL_ERROR =
  "Simkl login flow is disabled. Go to config.toml and add a [simkl.flow] field with your credentials to enable getting an access token.";

export function simklRoutes(server: FastifyInstance, ctx: Readonly<Context>) {
  server.get(
    "/simkl/login",
    (
      request: FastifyRequest<{
        Querystring: { client_id: string; redirect_uri: string };
      }>,
      reply
    ) => {
      if (!ctx.config.simkl.flow) {
        reply.status(500).send(SIMKL_ERROR);
        return;
      }
      const { client_id, redirect_uri } = request.query;
      const params = qs.stringify({
        response_type: "code",
        client_id,
        redirect_uri,
      });
      reply.redirect(`https://simkl.com/oauth/authorize?${params}`);
    }
  );

  server.get(
    "/simkl/callback",
    async (
      request: FastifyRequest<{ Querystring: { code: string } }>,
      reply
    ) => {
      const code = request.query.code;
      if (!ctx.config.simkl.flow) {
        reply.status(500).send(SIMKL_ERROR);
        return;
      }
      const { clientSecret, redirectUri } = ctx.config.simkl.flow;
      return await fetch("https://api.simkl.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          client_id: ctx.config.simkl.clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      }).then((r) => r.json());
    }
  );
}
