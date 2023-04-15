import { makeSchema, list, objectType, asNexusMethod } from "nexus";
import * as url from "url";
import path from "path";
import { providers } from "@providers/index.js";
import { GraphQLDateTime } from "graphql-scalars";
import { LikedSong, Song } from "@providers/spotify/model.js";
import { Book } from "@providers/kindle/model.js";
import { TV } from "@providers/simkl/model.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const DateTime = asNexusMethod(GraphQLDateTime, "datetime");

export const Query = objectType({
  name: "Query",
  definition(t) {
    t.field("spotifyLikedSongs", {
      type: list(LikedSong),
      async resolve(_, __, ctx) {
        const likedSongs =
          (await providers.spotifyLikedSongs.queryLatest?.(ctx)) ?? [];
        return likedSongs;
      },
    });
    t.field("tv", {
      type: list(TV),
      async resolve(_, __, ctx) {
        const tv = (await providers.simkl.queryLatest?.(ctx)) ?? [];
        return tv;
      },
    });
    t.field("kindleBooks", {
      type: list(Book),
      async resolve(_, __, ctx) {
        const kindle = (await providers.kindle.queryLatest?.(ctx)) ?? [];
        return kindle;
      },
    });
  },
});

export function schema(shouldExit?: boolean) {
  // to allow the script to be used with both node and tsx
  const isNode = __dirname.endsWith("dist/");
  return makeSchema({
    types: { Query, Book, DateTime, Song, LikedSong },
    shouldExitAfterGenerateArtifacts: shouldExit,
    contextType: {
      export: "Context",
      module: path.join(__dirname, `./graphql-context.${isNode ? "js" : "ts"}`),
    },
    outputs: {
      schema: path.join(__dirname, "./generated/schema.graphql"),
      typegen: path.join(__dirname, "./generated/types.d.ts"),
    },
  });
}
