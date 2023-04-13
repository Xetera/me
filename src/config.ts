import { parse as parseToml } from "toml";
import fs from "fs";
import { z } from "zod";
import { SpotifyConfig } from "📁/spotify/config.js";
import { KindleConfig } from "📁/kindle/config.js";

export const Config = z.object({
	spotify: SpotifyConfig,
	kindle: KindleConfig,
});

export type Config = z.infer<typeof Config>;

export function readConfig(configPath: string): Config {
	// it's ok for this to be sync because it's only run once
	const configStr = fs.readFileSync(configPath, "utf-8");
	return Config.parse(parseToml(configStr));
}
