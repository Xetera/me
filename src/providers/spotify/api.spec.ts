import { SpotifyUrl, convertUrl } from "./api";
import { it, expect, describe } from "vitest";

describe("spotify url conversions", () => {
  it("should convert 640x640 to 300x300", () => {
    const albumArt =
      "https://i.scdn.co/image/ab67616d0000b27394dd4f3a9744b4c54addb0ab";
    const parsed = SpotifyUrl.parse(albumArt);

    expect(convertUrl(parsed, 300).hex).toBe(
      0xab67616d00001e0294dd4f3a9744b4c54addb0abn
    );
  });

  it("should convert 64x64 to 300x300", () => {
    const albumArt =
      "https://i.scdn.co/image/ab67616d0000485195b1a2628ea3ee4b4ea3bd8e";
    const parsed = SpotifyUrl.parse(albumArt);

    expect(convertUrl(parsed, 300).hex).toBe(
      0xab67616d00001e0295b1a2628ea3ee4b4ea3bd8en
    );
  });

  it("should convert 300x300 to 64x64", () => {
    const albumArt =
      "https://i.scdn.co/image/ab67616d00001e0295b1a2628ea3ee4b4ea3bd8e";
    const parsed = SpotifyUrl.parse(albumArt);

    expect(convertUrl(parsed, 64).hex).toBe(
      0xab67616d0000485195b1a2628ea3ee4b4ea3bd8en
    );
  });
});
