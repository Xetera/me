import { Context } from "@/graphql/graphql-context";
import { z } from "zod";
import qs from "node:querystring";
import { URL } from "node:url";
const simklPosterUrl = (id: string): URL =>
  new URL(`https://simkl.in/posters/${id}_m.webp`);
export const SimklItem = z.object({
  last_watched_at: z.string(),
  status: z.string().nullable(),
  // user_rating: z.object({}).nullable(),
  last_watched: z.string().nullable(),
  next_to_watch: z.string().nullable(),
  watched_episodes_count: z.number(),
  total_episodes_count: z.number(),
  not_aired_episodes_count: z.number(),
  show: z.object({
    title: z.string(),
    poster: z
      .string()
      .optional()
      .transform((e) => (e ? simklPosterUrl(e) : undefined)),
    year: z.number(),
    ids: z
      .object({
        // I have a bad feeling about the simkl
        // id being a number
        simkl: z.coerce.string(),
      })
      .extend({
        slug: z.string().optional(),
        fb: z.string().optional(),
        instagram: z.string().optional(),
        tw: z.string().optional(),
        imdb: z.string().optional(),
        zap2it: z.string().optional(),
        tvdbslug: z.string().optional(),
        tmdb: z.string().optional(),
        offen: z.string().optional(),
        tvdb: z.string().optional(),
      }),
  }),
});

const SimklItemsResponse = z.object({
  shows: z.array(SimklItem).optional(),
  anime: z.array(SimklItem).optional(),
});

export const SimklActivity = z.object({
  all: z.string(),
});

type SimklActivity = z.infer<typeof SimklActivity>;

function getHeaders(config: Context["config"]): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.simkl.accessToken}`,
    // idk why the api key is the client id
    "simkl-api-key": config.simkl.clientId,
  };
}

export async function getActivities(ctx: Context): Promise<SimklActivity> {
  const response = await ctx.httpClient.get(
    "https://api.simkl.com/sync/activities",
    { headers: getHeaders(ctx.config) }
  );
  return SimklActivity.parse(response.body);
}

export async function getItems(ctx: Context, dateFrom: string) {
  const params = qs.stringify({
    episode_watched_at: "yes",
    ...(dateFrom ? { date_from: dateFrom } : {}),
  });
  const response = await ctx.httpClient.get(
    `https://api.simkl.com/sync/all-items/all/all?${params}`,
    { headers: getHeaders(ctx.config) }
  );
  return SimklItemsResponse.parse(response.body);
}
