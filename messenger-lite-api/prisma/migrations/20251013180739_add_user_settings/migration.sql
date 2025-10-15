-- CreateEnum
CREATE TYPE "public"."ThemeType" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "failed2FAAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isTwoFAEnable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "twoFASecret" TEXT;

-- CreateTable
CREATE TABLE "public"."UserSettings" (
    "id" TEXT NOT NULL,
    "activeStatus" BOOLEAN NOT NULL DEFAULT false,
    "soundNotifications" BOOLEAN NOT NULL DEFAULT false,
    "theme" "public"."ThemeType" NOT NULL DEFAULT 'LIGHT',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "public"."UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
