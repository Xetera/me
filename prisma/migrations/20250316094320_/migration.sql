-- CreateTable
CREATE TABLE "book" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "is_purchased" BOOLEAN NOT NULL DEFAULT true,
    "seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_progress" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,
    "device" TEXT,
    "seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sync_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song" (
    "id" TEXT NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "provider_link" TEXT,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "preview_url" TEXT,
    "liked_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simkl_activity" (
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simkl_activity_pkey" PRIMARY KEY ("type")
);

-- CreateTable
CREATE TABLE "request" (
    "uuid" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "sucessful" BOOLEAN NOT NULL,
    "headers" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "simkl_show" (
    "simkl_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "episode" TEXT NOT NULL,
    "next_episode" TEXT,
    "cover_url" TEXT,
    "simkl_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_watched_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
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

-- AddForeignKey
ALTER TABLE "book_progress" ADD CONSTRAINT "book_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE VIEW book_progress_view AS
SELECT bp.book_id, bp.progress, bp.device, bp.sync_date
FROM (
  SELECT *,
        ROW_NUMBER() OVER (PARTITION BY book_id ORDER BY sync_date DESC, progress DESC) AS rn
  FROM book_progress
) bp
WHERE bp.rn = 1;
