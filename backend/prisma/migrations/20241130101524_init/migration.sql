-- AlterTable
ALTER TABLE "chat" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "read_at" TIMESTAMPTZ;
