import { z } from "zod";
import { builder } from "@/graphql/builder.js";

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

export const TV = builder.prismaObject("SimklShow", {
  name: "TV",
  fields: (t) => ({
    simklId: t.exposeString("simklId"),
    title: t.exposeString("title"),
    episode: t.exposeString("episode"),
    nextEpisode: t.field({
      type: "String",
      nullable: true,
      resolve: (root) => root.nextEpisode,
    }),
    lastWatchedAt: t.field({
      type: "Date",
      nullable: true,
      resolve: (root) =>
        root.lastWatchedAt ? new Date(root.lastWatchedAt) : null,
    }),
    coverUrl: t.field({
      type: "String",
      nullable: true,
      resolve: (root) => root.coverUrl,
    }),
    simklLink: t.field({
      type: "String",
      nullable: true,
      resolve: (root) => root.simklLink,
    }),
    createdAt: t.field({
      type: "Date",
      resolve: (root) => root.createdAt,
    }),
    updatedAt: t.field({
      type: "Date",
      resolve: (root) => root.updatedAt,
    }),
  }),
});
