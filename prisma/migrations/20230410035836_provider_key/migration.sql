/*
  Warnings:

  - A unique constraint covering the columns `[provider,provider_id]` on the table `song` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "song_provider_provider_id_key" ON "song"("provider", "provider_id");
