/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `showHints` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `GenerationLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GenerationLog" DROP CONSTRAINT "GenerationLog_activityId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "difficulty",
DROP COLUMN "showHints";

-- DropTable
DROP TABLE "GenerationLog";

-- DropEnum
DROP TYPE "Difficulty";
