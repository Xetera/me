import { Kindle } from "kindle-api";
import { makeProvider } from "@providers/index.js";
import { cronJob } from "@/cron-job.js";
import { authorName, iterBooks } from "./api.js";
import { ulid } from "ulid";

const kindleProvider = makeProvider({
  name: "kindle",
  // cronJob expression for every 12 hours
  schedule: cronJob("0 */12 * * *"),
  async run({ prisma, config, httpClient }) {
    const kindle = await Kindle.fromConfig({
      cookies: config.kindle.cookies,
      deviceToken: config.kindle.deviceToken,
      httpClient,
    });

    // Very rudimentary
    for await (const book of iterBooks(kindle)) {
      const progress = parseFloat(book.percentageRead.toFixed(1));
      const author = authorName(book.authors);

      const data = {
        provider: "AMAZON",
        providerId: book.asin,
        title: book.title,
        coverUrl: book.productUrl,
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
    const results = (await ctx.prisma.$queryRaw`
      SELECT book_id, MAX(progress) as progress, device, MAX(sync_date) as sync_date FROM book_progress group by book_id, device having MAX(sync_date)
    `) as {
      book_id: string;
      progress: number;
      device: string;
      sync_date: number;
    }[];

    const books = await ctx.prisma.book.findMany({
      where: {
        id: {
          in: results.map((r) => r.book_id),
        },
      },
    });
    return books
      .map((book) => {
        const result = results.find((r) => r.book_id === book.id);
        console.log(result);
        if (!result) return;

        const device = sanitizeDeviceName(result.device);
        return {
          author: book.author,
          title: book.title,
          asin: book.providerId,
          coverUrl: book.coverUrl,
          progress: result.progress,
          device,
          readAt: new Date(result.sync_date),
          firstSeen: new Date(book.seenAt),
        };
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
