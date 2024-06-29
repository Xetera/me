import fastify, { FastifyRequest } from "fastify";
import { Task } from "./cron-job.js";
import { Context } from "@providers/index.js";
import mercurius from "mercurius";
import { schema } from "./graphql.js";
import qs from "node:querystring"

export async function startServer(ctx: Readonly<Context>, tasks: Task[]) {
  const server = fastify({
    querystringParser: (str) => qs.parse(str)
  });

  server.get("/run/:name", async (req: FastifyRequest<{
    Params: { name: string },
    Querystring: { auth: string }
  }>, reply) => {
    const { auth } = req.query;
    const { name } = req.params;

    if (auth !== ctx.config.server.authToken) {
      reply.status(401).send("Unauthorized");
      return;
    }

    const task = tasks.find((task) => task.name === name);
    if (!task) {
      reply.status(404).send("Not Found");
      return;
    }
    try {
      await task.callback();
      reply.status(200).send("OK");
    } catch (err) {
      console.error(err)
      reply.status(500).send(err);
    }
  });

  server.get("/health", async (_, reply) => {
    await ctx.prisma.$queryRaw`SELECT 1;`;
    reply.status(200).send("OK");
  });

  server.register(mercurius, {
    schema: schema(),
    graphiql: true,
    context() {
      return ctx;
    },
  });

  console.log("[server] Starting...");
  const address = await server.listen({
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    host: "0.0.0.0",
  });
  console.log(`[server] listening on ${address}`);
}
