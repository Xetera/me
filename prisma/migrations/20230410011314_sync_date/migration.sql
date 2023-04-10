/*
  Warnings:

  - A unique constraint covering the columns `[sync_date,book_id]` on the table `BookProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookProgress_sync_date_book_id_key" ON "BookProgress"("sync_date", "book_id");
