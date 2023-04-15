import { parse as parseToml } from "toml";
import fs from "fs";
import { z } from "zod";
import { SpotifyConfig } from "@providers/spotify/model.js";
import { KindleConfig } from "@providers/kindle/model.js";
import { SimklConfig } from "@providers/simkl/model.js";

const ServerConfig = z.object({
	authToken: z.string().optional()
})

export const Config = z.object({
	server: ServerConfig,
	spotify: SpotifyConfig,
	kindle: KindleConfig,
	simkl: SimklConfig
});

export type Config = z.infer<typeof Config>;

export function readConfig(configPath: string): Config {
	// it's ok for this to be sync because it's only run once
	const configStr = fs.readFileSync(configPath, "utf-8");
	return Config.parse(parseToml(configStr));
}
