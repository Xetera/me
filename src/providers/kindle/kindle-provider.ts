import { Kindle } from "kindle-api";
import { makeProvider } from "📁/index.js";
import { cron } from "🌳/cron.js";
import { authorName, iterBooks } from "./api";

const kindleProvider = makeProvider({
	name: "kindle",
	// cron expression for every 12 hours
	schedule: cron("0 */12 * * *"),
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
				create: data,
			});

			await prisma.bookProgress.create({
				data: {
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
      SELECT book_id, progress, device, sync_date FROM 'book_progress' group by book_id having MAX(sync_date)
    `) as {
			book_id: number;
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
