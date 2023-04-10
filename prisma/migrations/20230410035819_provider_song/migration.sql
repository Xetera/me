/*
  Warnings:

  - You are about to drop the column `spotify_link` on the `song` table. All the data in the column will be lost.
  - Added the required column `provider` to the `song` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_id` to the `song` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_song" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "duration_ms" INTEGER NOT NULL,
    "provider_link" TEXT,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "preview_url" TEXT,
    "liked_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_song" ("album", "artist", "cover_url", "duration_ms", "id", "liked_at", "preview_url", "title") SELECT "album", "artist", "cover_url", "duration_ms", "id", "liked_at", "preview_url", "title" FROM "song";
DROP TABLE "song";
ALTER TABLE "new_song" RENAME TO "song";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
