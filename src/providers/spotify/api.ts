import { z } from "zod";

const MagicImageBytes = {
  640: 0b1011001001110011n,
  300: 0b0001111000000010n,
  64: 0b0100100001010001n,
} as const;

const SPOTIFY_URL_BASE = "https://i.scdn.co/image";

export const SpotifyUrl = z
  .string()
  .startsWith(SPOTIFY_URL_BASE)
  .url()
  .transform((url) => {
    const hexStr = url.split("/").pop();
    return {
      hex: BigInt(`0x${hexStr}`),
      url,
    };
  })
  .brand("SpotifyUrl");

export type SpotifyUrl = z.infer<typeof SpotifyUrl>;

/**
 * Converts a spotify link to a new size.
 *
 * @see
 * Spotify stores links to album art in hexadecimal that when broken into
 * bytes leaves bytes 7-8 responsible for size. Instead of storing all
 * alternate sizes, we convert them when needed with this cursed function.
 *
 * @example
 * url: "https://i.scdn.co/image/ab67616d00004851727c53bb34e146b1218730e7"
 *
 * hex: ab67616d0000b2739d750d969d227e6506a2c176
 * bin: 10101011 01100111 01100001 01101101 00000000 00000000 10110010 01110011 10011101 ...
 *                                                            ^   640 x 640   ^
 *
 * hex: ab67616d00001e029d750d969d227e6506a2c176
 * bin: 10101011 01100111 01100001 01101101 00000000 00000000 00011110 00000010 10011101 ...
 *                                                            ^   300 x 300   ^
 * @param linkBase the hexadecimal path parameter of the url
 * @param size The size to convert to
 */
export function convertUrl(
  url: SpotifyUrl,
  size: keyof typeof MagicImageBytes
): SpotifyUrl {
  const magic = MagicImageBytes[size];
  const newValue = magic << (12n * 8n);
  const hex = ((url.hex & ~MASK) | (newValue & MASK)).toString(16);
  return SpotifyUrl.parse(`${SPOTIFY_URL_BASE}/${hex}`);
}

const MASK = 0x000000000000ffff000000000000000000000000n;
