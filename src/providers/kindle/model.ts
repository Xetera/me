import { z } from "zod";
import { objectType } from "nexus";

export const KindleConfig = z.object({
	enabled: z.boolean().default(false),
	deviceToken: z.string(),
	cookies: z.string(),
});

export type KindleConfig = z.infer<typeof KindleConfig>;

export const Book = objectType({
	name: "Book",
	definition(t) {
		t.nonNull.string("title", {
			description: "Title of the book",
		});
		t.nonNull.string("author", {
			description: "Author of the book. Only the first author is shown.",
		});
		t.nonNull.string("asin", {
			description: "Amazon Standard Identification Number",
		});
		t.nonNull.string("coverUrl", {
			description: "URL to the cover image",
		});
		t.nonNull.float("progress", {
			description:
				"Percentage of the book read. Books with 0 percentage reads are not shown.",
		});
		t.string("device", {
			description: "Device the book was read on.",
		});
		t.nonNull.field("readAt", {
			type: "DateTime",
			description: "The last date this book was read",
		});
		t.nonNull.field("firstSeen", {
			type: "DateTime",
			description: "The first time this book was seen on the Kindle API",
		});
	},
});
