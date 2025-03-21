import { makeProvider } from "@providers/index.js";
import { cronJob } from "@/cron-job.js";
import { z } from "zod";
import { getActivities, getItems } from "./api.js";
import type { PrismaPromise } from "@prisma/client";
import otlp from "@opentelemetry/api";

export const schema = z.object({
  all: z.string(),
  settings: z.record(z.string().optional()),
  tv_shows: z.record(z.string().optional()),
  anime: z.record(z.string().optional()),
  movies: z.record(z.string().optional()),
});

const tracer = otlp.trace.getTracer("simkl");

const simklProvider = makeProvider({
  name: "simkl",
  schedule: cronJob("0 0 * * *"),
  async run(ctx) {
    return tracer.startActiveSpan("simkl.run", async (parent) => {
      const { config, prisma } = ctx;

      if (!config.simkl.accessToken) {
        throw new Error("simkl.accessToken is not set");
      }

      const activities = await getActivities(ctx);
      const lastRun = await prisma.simklActivity.findFirst({
        where: {
          type: "all",
        },
      });

      const isDataStale =
        lastRun && new Date(activities.all) <= new Date(lastRun.updatedAt);
      if (isDataStale) {
        console.log("Exiting from simkl provider, data is up to date");
        return;
      }

      const { shows = [], anime = [] } = await getItems(
        ctx,
        lastRun?.updatedAt.toISOString()
      );

      // we should already have everything until the last run here
      // so we update it with the last activity date
      const activityData = {
        type: "all",
        createdAt: activities.all,
        updatedAt: activities.all,
      };

      const sorted = shows
        .concat(anime)
        .sort((a, b) =>
          b.last_watched_at && a.last_watched_at
            ? b.last_watched_at.localeCompare(a.last_watched_at)
            : -1
        );

      const queries: Array<PrismaPromise<unknown>> = [
        prisma.simklActivity.upsert({
          where: {
            type: "all",
          },
          create: activityData,
          update: activityData,
        }),
      ];
      for (const item of sorted) {
        if (item.last_watched) {
          const data = {
            episode: item.last_watched,
            nextEpisode: item.next_to_watch,
            coverUrl: item.show.poster?.toString(),
            // not everything is TV but it gets corrected anyways
            simklLink: `https://simkl.com/tv/${item.show.ids.simkl}`,
            // we especially wanna make sure this is updated
            lastWatchedAt: item.last_watched_at,
            simklId: item.show.ids.simkl,
            title: item.show.title,
          };
          queries.push(
            prisma.simklShow.upsert({
              where: {
                showEpisode: {
                  simklId: item.show.ids.simkl,
                  episode: item.last_watched,
                },
              },
              create: data,
              update: data,
            })
          );
        }
      }

      await prisma.$transaction(queries);
      parent.end();
    });
  },
  async queryLatest(ctx) {
    return tracer.startActiveSpan("simkl.queryLatest", async (parent) => {
      const rows = await ctx.prisma.simklShow.findMany({
        orderBy: {
          lastWatchedAt: "desc",
        },
      });
      const result = rows.map((row) => {
        return {
          simklId: row.simklId,
          title: row.title,
          episode: row.episode,
          nextEpisode: row.nextEpisode,
          coverUrl: row.coverUrl,
          simklLink: row.simklLink,
          lastWatchedAt: row.lastWatchedAt,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      });
      parent.end();
      return result;
    });
  },
});

export default simklProvider;
