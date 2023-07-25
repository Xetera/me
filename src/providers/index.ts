import { PrismaClient } from "@prisma/client";
import { Config } from "@/config.js";
import { CronExpression } from "@/cron-job.js";
import kindleProvider from "@providers/kindle/kindle-provider.js";
import spotifyLikedProvider from "@providers/spotify/spotify-provider.js";
import simklProvider from "@providers/simkl/simkl-provider.js";

export type Context = {
  prisma: PrismaClient;
  config: Config;
};

export interface Provider<T> {
  /**
   * this name will be used for identifying the provider in the api response
   */
  name: string;
  schedule: CronExpression;
  debug?: boolean;
  run(ctx: Readonly<Context>): Promise<unknown>;
  queryLatest?(ctx: Readonly<Context>): Promise<T>;
}

export function makeProvider<T>(p: Provider<T>): Provider<T> {
  return p;
}

export const providers = {
  kindle: kindleProvider,
  spotifyLikedSongs: spotifyLikedProvider,
  simkl: simklProvider,
};
