/*
  Warnings:

  - Added the required column `content` to the `chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."chat" ADD COLUMN     "content" TEXT NOT NULL;
