/*
  Warnings:

  - You are about to drop the column `read` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `read_at` on the `chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat" DROP COLUMN "read",
DROP COLUMN "read_at";
