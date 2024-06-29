-- CreateTable
CREATE TABLE "book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "author" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "is_purchased" BOOLEAN NOT NULL DEFAULT true,
    "seen_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "book_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "book_id" TEXT NOT NULL,
    "progress" REAL NOT NULL,
    "device" TEXT,
    "seen_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sync_date" DATETIME NOT NULL,
    CONSTRAINT "book_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "song" (
    "id" TEXT NOT NULL PRIMARY KEY,
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

-- CreateTable
CREATE TABLE "simkl_activity" (
    "type" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "request" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "sucessful" BOOLEAN NOT NULL,
    "headers" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "simkl_show" (
    "simkl_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "episode" TEXT NOT NULL,
    "next_episode" TEXT,
    "cover_url" TEXT,
    "simkl_link" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_watched_at" DATETIME,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "book_provider_provider_id_key" ON "book"("provider", "provider_id");

-- CreateIndex
CREATE INDEX "book_progress_book_id_idx" ON "book_progress"("book_id");

-- CreateIndex
CREATE INDEX "song_liked_at_idx" ON "song"("liked_at");

-- CreateIndex
CREATE UNIQUE INDEX "song_provider_provider_id_key" ON "song"("provider", "provider_id");

-- CreateIndex
CREATE INDEX "request_created_at_idx" ON "request"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "simkl_show_simkl_id_episode_key" ON "simkl_show"("simkl_id", "episode");
