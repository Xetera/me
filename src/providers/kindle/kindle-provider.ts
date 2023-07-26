import { Kindle } from "kindle-api";
import { makeProvider } from "@providers/index.js";
import { cronJob } from "@/cron-job.js";
import { authorName, iterBooks } from "./api.js";
import { ulid } from "ulid";
import { ReadBook } from "./model.js";

const kindleProvider = makeProvider({
  name: "kindle",
  // cronJob expression for every 12 hours
  schedule: cronJob("0 */12 * * *"),
  async run({ prisma, config }) {
    const kindle = await Kindle.fromConfig({
      cookies: config.kindle.cookies,
      deviceToken: config.kindle.deviceToken,
      tlsServer: config.kindle.tlsServer,
    });

    // Very rudimentary
    for await (const book of iterBooks(kindle)) {
      const progress = parseFloat(book.percentageRead.toFixed(1));
      const author = authorName(book.authors);

      const data = {
        provider: "AMAZON",
        providerId: book.asin,
        title: book.title,
        coverUrl: book.largeCoverUrl,
        author: author,
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
          device: book.progress.reportedOnDevice,
          syncDate: book.progress.syncDate,
          seenAt: new Date(),
        },
      });
    }
  },
  async queryLatest(ctx) {
    const results = await ctx.prisma.bookProgressView.findMany({});

    const books = await ctx.prisma.book.findMany({
      where: {
        id: {
          in: results.map((r) => r.bookId),
        },
      },
    });
    return books
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
      .filter(Boolean);
  },
});

const possessiveRegex = /\b.+?'.+?\b/;

const positionalRegex = /\d+(st|nd|rd|th)/;

export function sanitizeDeviceName(name: string) {
  return name.replace(possessiveRegex, "").replace(positionalRegex, "").trim();
}

export default kindleProvider;
