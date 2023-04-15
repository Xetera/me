import initClient from "cycletls";
import { PrismaClient } from "@prisma/client";
import { Context, providers } from "@providers/index.js";
import { startJobs } from "./cron-job.js";
import { readConfig } from "./config.js";
import { startServer } from "./server.js";

const prisma = new PrismaClient();

async function main(configPath: string) {
  console.log("[server] Initializing cycletls");
  const httpClient = await initClient({ port: 9112, debug: true });
  console.log("[server] Initiated!");
  const config = readConfig(configPath);
  const ctx: Readonly<Context> = { prisma, config, httpClient };

  const jobs = startJobs(ctx, providers);
  await startServer(ctx, jobs);
}

main(process.env.CONFIG_PATH ?? "./config.toml");
