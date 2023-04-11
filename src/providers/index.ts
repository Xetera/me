import { PrismaClient } from "@prisma/client";
import { CycleTLSClient } from "cycletls";
import { Config } from "../config.js";
import { CronExpression } from "../cron.js";
import kindleProvider from "./kindle.js";
import spotifyLikedProvider from "./spotify.js";

export type Context = {
	prisma: PrismaClient;
	config: Config;
	httpClient: CycleTLSClient;
};

export interface Provider<T> {
	/**
	 * this name will be used for identifying the provider in the api response
	 */
	name: string;
	schedule: CronExpression;
	debug?: boolean;
	run(ctx: Readonly<Context>): Promise<unknown>;
	queryLatest(ctx: Readonly<Context>): Promise<T>;
}

export function makeProvider<T>(p: Provider<T>): Provider<T> {
	return p;
}

export const providers = {
	kindle: kindleProvider,
	spotifyLikedSongs: spotifyLikedProvider,
};
