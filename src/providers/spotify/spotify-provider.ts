import { makeProvider } from "@providers/index.js";
import { cronJob } from "@/cron-job.js";
import qs from "node:querystring";
import type { AccessToken, PlaylistTrack, Track } from "spotify-types";
import { ulid } from "ulid";

const spotifyLikedProvider = makeProvider({
  name: "spotify.liked",
  schedule: cronJob("0 */12 * * *"),
  async run({ config, prisma }) {
    const { spotify } = config;
    const authorization = Buffer.from(
      `${spotify.clientId}:${spotify.clientSecret}`
    ).toString("base64");

    console.log("[spotify] refresh token flow");
    // forced to always get a new token because the spotify API is really nice and intuitive :)
    const params = qs.stringify({
      grant_type: "refresh_token",
      // this is hardcoded because I did the flow manually and spotify sucks and needs oauth
      // for something that should be doable through client credentials...
      redirect_uri: spotify.redirectUri,
      scope:
        "user-read-email user-read-private user-top-read user-library-read",
      refresh_token: spotify.refreshToken,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: `Basic ${authorization}`,
      },
      body: params.toString(),
    });

    const body = (await response.json()) as AccessToken;
    if (!response.ok) {
      console.log("Spotify fetcher response was not ok", response.status);
      console.log(body);
      throw new Error(
        `Response not ok: ${response.status} = ${response.statusText}`
      );
    }

    if (!body) {
      throw new Error("Invalid body");
    }

    const token = body.access_token;

    console.log("[spotify] fetching liked tracks");
    const likedTracks = (await fetch("https://api.spotify.com/v1/me/tracks", {
      headers: { authorization: `Bearer ${token}` },
    }).then((res) => res.json())) as { items: PlaylistTrack[] };

    for (const song of likedTracks.items) {
      const track = song.track as Track;
      const data = {
        provider: "SPOTIFY",
        providerId: track.id,
        title: track.name,
        artist: track.artists[0]?.name ?? "[unknown]",
        coverUrl: track.album.images[0]?.url,
        album: track.album.name,
        durationMs: track.duration_ms,
        likedAt: song.added_at,
        providerLink: track.external_urls.spotify,
        previewUrl: track.preview_url,
      };
      await prisma.song.upsert({
        where: {
          providerKey: {
            provider: "SPOTIFY",
            providerId: track.id,
          },
        },
        create: {
          id: ulid(),
          ...data,
        },
        update: data,
      });
    }
  },
  async queryLatest({ prisma }) {
    const songs = await prisma.song.findMany({
      where: {
        likedAt: {
          not: null,
        },
      },
      take: 20,
      orderBy: {
        likedAt: "desc",
      },
    });
    return songs.map((song) => {
      return {
        likedAt: song.likedAt,
        song: {
          title: song.title,
          artist: song.artist,
          album: song.album,
          coverUrl: song.coverUrl,
          durationMs: song.durationMs,
          spotifyUrl: song.providerLink,
          previewUrl: song.previewUrl,
        },
      };
    });
  },
});

export default spotifyLikedProvider;
