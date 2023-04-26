import { z } from "zod";
import { convertUrl, SpotifyUrl } from "./api.js";
import { Song as DbSong } from "@prisma/client";
import { builder } from "@/graphql/builder.js";

export const SpotifyConfig = z.object({
  enabled: z.boolean().default(false),
  refreshToken: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
});

export type SpotifyConfig = z.infer<typeof SpotifyConfig>;

export const ImageSize = builder.enumType("ImageSize", {
  values: {
    SMALL: {
      description: "64px square image",
      value: 64,
    },
    MEDIUM: {
      description: "300px square image",
      value: 300,
    },
    LARGE: {
      description: "640px square image",
      value: 640,
    },
  } as const,
});

export const Song = builder.prismaObject("Song", {
  name: "Song",
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title", {
      description: "Title of the song",
    }),
    artist: t.exposeString("artist", {
      description: "Artist of the song",
    }),
    album: t.exposeString("album", {
      description: "Album of the song",
    }),
    coverUrl: t.string({
      args: {
        size: t.arg({
          type: ImageSize,
          defaultValue: 640,
        }),
      },
      description: "Album art of the song",
      async resolve(song, args) {
        const url = SpotifyUrl.parse(song.coverUrl);
        return convertUrl(url, args.size ?? 640).url;
      },
    }),
    spotifyUrl: t.string({
      nullable: true,
      description: "Spotify URL of the song",
      resolve: (p) => p.providerLink,
    }),
    durationMs: t.exposeInt("durationMs", {
      description: "Duration of the song in milliseconds",
    }),
    previewUrl: t.string({
      nullable: true,
      description: "A 30 second preview of the song",
      resolve: (p) => p.previewUrl,
    }),
  }),
});

export class LikedSongBacking {
  constructor(public song: DbSong, public likedAt: Date | null) {}
}

export const LikedSong = builder.objectType(LikedSongBacking, {
  name: "LikedSong",
  fields: (t) => ({
    song: t.field({
      type: Song,
      resolve: (root) => root.song,
    }),
    likedAt: t.field({
      type: "Date",
      nullable: true,
      description: "The date the song was liked",
      resolve: (root) => root.likedAt,
    }),
  }),
});
