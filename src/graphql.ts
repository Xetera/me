import * as url from "url";
import path from "path";
import { providers } from "@providers/index.js";
import { GraphQLDateTime } from "graphql-scalars";
import { ImageSize, LikedSong, Song } from "@providers/spotify/model.js";
import { Book } from "@providers/kindle/model.js";
import { TV } from "@providers/simkl/model.js";
import { builder } from "./graphql/builder.js";
import { printSchema } from "graphql";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

builder.addScalarType("Date", GraphQLDateTime, {});

export const Query = builder.queryType({
  fields: (t) => ({
    spotifyLikedSongs: t.field({
      type: t.listRef(LikedSong),
      async resolve(_, __, ctx) {
        const likedSongs =
          (await providers.spotifyLikedSongs.queryLatest?.(ctx)) ?? [];
        return likedSongs;
      },
    }),
    tv: t.field({
      type: t.listRef(TV),
      async resolve(_, __, ctx) {
        const tv = (await providers.simkl.queryLatest?.(ctx)) ?? [];
        return tv;
      },
    }),
    kindleBooks: t.field({
      type: t.listRef(Book),
      async resolve(_, __, ctx) {
        const kindle = (await providers.kindle.queryLatest?.(ctx)) ?? [];
        return kindle;
      },
    }),
  }),
});

export function schema(shouldExit?: boolean) {
  return builder.toSchema();
}
