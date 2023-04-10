import fastify from "fastify";
import { Task } from "./cron.js";
import { Context, providers } from "./providers/index.js";

const setNestedProperty = <T>(
	obj: Record<string, any>,
	path: string,
	value: T,
) => {
	const pathArray = path.split(".");
	let currentObj = obj;

	for (let i = 0; i < pathArray.length - 1; i++) {
		const key = pathArray[i];
		if (!currentObj.hasOwnProperty(key)) {
			currentObj[key] = {};
		}
		currentObj = currentObj[key];
	}

	const last = pathArray.at(-1);

	if (!last) {
		throw Error("empty path");
	}

	currentObj[last] = value;
};

export async function startServer(ctx: Readonly<Context>, tasks: Task[]) {
	const server = fastify({ logger: true });
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

	server.get("/api/v1/latest", async (_, reply) => {
		const results = await Promise.all(
			Object.values(providers).map(async (provider) => {
				return [provider.name, await provider.queryLatest(ctx)] as const;
			}),
		);
		const out: Record<string, unknown> = {};

		for (const [name, result] of results) {
			if ((Array.isArray(result) && result.length === 0) || !result) {
				continue;
			}
			setNestedProperty(out, name, result);
		}

		reply
			.status(200)
			// TODO: set cache-control relative to when the next job is scheduled
			.header("Cache-Control", "public, max-age=3600, must-revalidate")
			.send(out);
	});

	console.log("[server] Starting...");
	const address = await server.listen({
		port: process.env.PORT ? Number(process.env.PORT) : 3000,
		host: "0.0.0.0",
	});
	console.log(`[server] listening on ${address}`);
}
