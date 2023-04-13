import { z } from "zod";

export const SpotifyConfig = z.object({
	enabled: z.boolean().default(false),
	refreshToken: z.string(),
	clientId: z.string(),
	clientSecret: z.string(),
	redirectUri: z.string(),
});

export type SpotifyConfig = z.infer<typeof SpotifyConfig>;
