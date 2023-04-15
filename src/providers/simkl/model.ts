import { z } from "zod";
import { objectType } from "nexus";

/**
 * Users should either supply a client secret (for fetching an access token)
 * or the access token itself
 */
export const SimklConfig = z.object({
  enabled: z.boolean().default(false),
  accessToken: z.string().optional(),
  clientId: z.string(),
  flow: z
    .object({
      redirectUri: z.string(),
      clientSecret: z.string(),
    })
    .optional(),
});

export type SimklConfig = z.infer<typeof SimklConfig>;

export const TV = objectType({
  name: "TV",
  definition(t) {
    t.nonNull.string("simklId");
    t.nonNull.string("title");
    t.nonNull.string("episode");
    t.string("nextEpisode");
    t.nonNull.field("lastWatchedAt", { type: "DateTime" });
    t.string("coverUrl");
    t.string("simklLink");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
  },
});
