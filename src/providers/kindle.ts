import { Kindle } from "kindle-api";
import { setTimeout as sleep } from "timers/promises";
import type { Provider } from "./index.js";
import { cron } from "../cron.js";
import { z } from "zod";

export const KindleConfig = z.object({
	enabled: z.boolean().default(false),
	deviceToken: z.string(),
	cookies: z.string(),
});

export type KindleConfig = z.infer<typeof KindleConfig>;

const kindleProvider: Provider = {
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
		for (const book of kindle.defaultBooks) {
			const [authorObj] = book.authors;
			const author = authorObj
				? `${authorObj.firstName} ${authorObj.lastName}`
				: "[unknown]";

			const data = {
				provider: "AMAZON",
				providerId: book.asin,
				title: book.title,
				coverUrl: book.imageUrl,
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
			// idk if it helps but I don't like waiting
			await sleep(200);

			const lightDetails = await book.details();
			const isUnread = lightDetails.progress.position === -1;

			if (isUnread) {
				continue;
			}

			const details = await book.fullDetails(lightDetails);
			const progress = parseFloat(details.percentageRead.toFixed(1));

			await prisma.bookProgress.create({
				data: {
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
};

const possessiveRegex = /\b.+?'.+?\b/;

const positionalRegex = /\d+(st|nd|rd|th)/;

export function sanitizeDeviceName(name: string) {
	return name.replace(possessiveRegex, "").replace(positionalRegex, "").trim();
}

export default kindleProvider;
