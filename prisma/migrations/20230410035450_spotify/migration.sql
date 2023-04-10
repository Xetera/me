/*
  Warnings:

  - You are about to drop the `Book` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Book";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BookProgress";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "author" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "seen_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "book_progress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "book_id" INTEGER NOT NULL,
    "progress" REAL NOT NULL,
    "device" TEXT,
    "seen_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sync_date" DATETIME NOT NULL,
    CONSTRAINT "book_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "song" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "duration_ms" INTEGER NOT NULL,
    "spotify_link" TEXT,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "preview_url" TEXT,
    "liked_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "book_provider_provider_id_key" ON "book"("provider", "provider_id");
