/*
  Warnings:

  - Added the required column `sync_date` to the `BookProgress` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "book_id" INTEGER NOT NULL,
    "progress" REAL NOT NULL,
    "device" TEXT,
    "seen_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sync_date" DATETIME NOT NULL,
    CONSTRAINT "BookProgress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BookProgress" ("book_id", "device", "id", "progress", "seen_at") SELECT "book_id", "device", "id", "progress", "seen_at" FROM "BookProgress";
DROP TABLE "BookProgress";
ALTER TABLE "new_BookProgress" RENAME TO "BookProgress";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
