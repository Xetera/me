import { z } from "zod";

export const KindleConfig = z.object({
	enabled: z.boolean().default(false),
	deviceToken: z.string(),
	cookies: z.string(),
});

export type KindleConfig = z.infer<typeof KindleConfig>;
