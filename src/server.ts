import fastify from "fastify";
import { Task } from "./cron.js";
import { Context } from "📁/index.js";
import mercurius from "mercurius";
import { schema } from "./graphql.js";

export async function startServer(ctx: Readonly<Context>, tasks: Task[]) {
	const server = fastify();

	server.get("/run/:name", async (req, reply) => {
		const name = (req.params as { name: string }).name;
		const task = tasks.find((task) => task.name === name);
		if (!task) {
			reply.status(404).send("Not Found");
			return;
		}
		await task.callback();
		reply.status(200).send("OK");
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
