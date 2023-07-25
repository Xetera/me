import { Context, providers } from "@providers/index.js";
import { startJobs } from "./cron-job.js";
import { readConfig } from "./config.js";
import { startServer } from "./server.js";
import { prisma } from "./database/client.js";

async function main(configPath: string) {
  console.log("[server] Initiated!");
  const config = readConfig(configPath);
  const ctx: Readonly<Context> = { prisma, config };

  const jobs = startJobs(ctx, providers);
  await startServer(ctx, jobs);
}

main(process.env.CONFIG_PATH ?? "./config.toml");
