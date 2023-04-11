import {
	makeSchema,
	list,
	nonNull,
	intArg,
	objectType,
	asNexusMethod,
} from "nexus";
import * as url from "url";
import path from "path";
import { providers } from "./providers/index.js";
import { GraphQLDateTime } from "graphql-scalars";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const DateTime = asNexusMethod(GraphQLDateTime, "datetime");

const Song = objectType({
	name: "Song",
	definition(t) {
		t.nonNull.string("title", {
			description: "Title of the song",
		});
		t.nonNull.string("artist", {
			description: "Artist of the song",
		});
		t.nonNull.string("album", {
			description: "Album of the song",
		});
		t.nonNull.string("coverUrl", {
			description: "Album art of the song",
		});
		t.nonNull.string("spotifyUrl", {
			description: "Spotify URL of the song",
		});
		t.nonNull.int("durationMs", {
			description: "Duration of the song in milliseconds",
		});
		t.string("previewUrl", {
			description: "A 30 second preview of the song",
		});
	},
});

const LikedSong = objectType({
	name: "LikedSong",
	definition(t) {
		t.nonNull.field("song", { type: Song });
		t.nonNull.field("likedAt", {
			type: "DateTime",
			description: "The date the song was liked",
		});
	},
});

const Book = objectType({
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

export const Query = objectType({
	name: "Query",
	definition(t) {
		t.field("spotifyLikedSongs", {
			type: list(LikedSong),
			async resolve(_, __, ctx) {
				const likedSongs = await providers.spotifyLikedSongs.queryLatest(ctx);
				return likedSongs;
			},
		});
		t.field("kindleBooks", {
			type: list(Book),
			async resolve(_, __, ctx) {
				const kindle = await providers.kindle.queryLatest(ctx);
				return kindle;
			},
		});
	},
});

export function schema() {
	return makeSchema({
		types: { Query, Book, DateTime, Song, LikedSong },
		contextType: {
			export: "Context",
			module: path.join(__dirname, "./graphql-context.ts"),
		},
		outputs: {
			schema: path.join(__dirname, "./generated/schema.graphql"),
			typegen: path.join(__dirname, "./generated/types.d.ts"),
		},
	});
}
