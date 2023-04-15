import { z } from "zod";
import { objectType } from "nexus";

export const SpotifyConfig = z.object({
	enabled: z.boolean().default(false),
	refreshToken: z.string(),
	clientId: z.string(),
	clientSecret: z.string(),
	redirectUri: z.string(),
});

export type SpotifyConfig = z.infer<typeof SpotifyConfig>;

export const Song = objectType({
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
		t.string("spotifyUrl", {
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


export const LikedSong = objectType({
	name: "LikedSong",
	definition(t) {
		t.nonNull.field("song", { type: Song });
		t.nonNull.field("likedAt", {
			type: "DateTime",
			description: "The date the song was liked",
		});
	},
});
