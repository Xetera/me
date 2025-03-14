import { Kindle } from "kindle-api";
import { makeProvider } from "@providers/index.js";
import { cronJob } from "@/cron-job.js";
import { authorName, iterBooks } from "./api.js";
import { ulid } from "ulid";
import { ReadBook } from "./model.js";
import { z } from "zod";
import otlp, { SpanStatusCode } from "@opentelemetry/api";

export const BookFilter = z
  .union([z.literal("purchased"), z.literal("all")])
  .optional()
  .default("all");

export type BookFilter = z.infer<typeof BookFilter>;

const tracer = otlp.trace.getTracer("me.kindle");

const kindleProvider = makeProvider({
  name: "kindle",
  // cronJob expression for every 12 hours
  schedule: cronJob("0 */12 * * *"),
  async run({ prisma, config }) {
    return tracer.startActiveSpan("kindle.run", async (span) => {
      let kindle: Kindle;
      try {
        kindle = await tracer.startActiveSpan("kindle.init", async (span) => {
          const kindle = await Kindle.fromConfig({
            cookies: config.kindle.cookies,
            deviceToken: config.kindle.deviceToken,
            tlsServer: config.kindle.tlsServer,
          });
          span.end();
          return kindle;
        });
      } catch (err) {
        if (err instanceof Error) {
          span.recordException(err);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: err.message,
          });
          return;
        } else {
          throw err;
        }
      }

      // Very rudimentary
      for await (const { details, book } of iterBooks(kindle)) {
        const progress = parseFloat(details.percentageRead.toFixed(1));
        const author = authorName(details.authors);
        const isPurchased = !book.resourceType.toLowerCase().includes("sample");

        const data = {
          provider: "AMAZON",
          providerId: details.asin,
          title: details.title,
          coverUrl: details.largeCoverUrl,
          author: author,
          isPurchased,
        };

        // this shouldn't be a big problem to do in a loop
        const providerKey = {
          provider: data.provider,
          providerId: data.providerId,
        };
        await prisma.book.upsert({
          where: {
            providerKey,
          },
          update: data,
          create: {
            id: ulid(),
            ...data,
          },
        });

        await prisma.bookProgress.create({
          data: {
            id: ulid(),
            progress,
            book: {
              connect: {
                providerKey,
              },
            },
            device: details.progress.reportedOnDevice,
            syncDate: details.progress.syncDate,
            seenAt: new Date(),
          },
        });
      }
    });
  },
  async queryLatest(ctx, opts: { filter: BookFilter }) {
    return tracer.startActiveSpan("kindle.queryLatest", async (span) => {
      const results = await ctx.prisma.bookProgressView.findMany({});

      const books = await ctx.prisma.book.findMany({
        where: {
          ...(opts.filter === "purchased" ? { isPurchased: true } : {}),
          id: {
            in: results.map((r) => r.bookId),
          },
        },
      });
      const readBooks = books
        .map((book) => {
          const result = results.find((r) => r.bookId === book.id);
          if (!result) return;

          return new ReadBook(book, {
            bookId: result.bookId,
            device: result.device ?? undefined,
            progress: result.progress,
            syncDate: new Date(result.syncDate),
          });
        })
        .filter(Boolean)
        .sort((a, b) => (b.progress.syncDate > a.progress.syncDate ? 1 : -1));
      span.end();
      return readBooks;
    });
  },
});

const possessiveRegex = /\b.+?'.+?\b/;

const positionalRegex = /\d+(st|nd|rd|th)/;

export function sanitizeDeviceName(name: string) {
  return name.replace(possessiveRegex, "").replace(positionalRegex, "").trim();
}

export default kindleProvider;
