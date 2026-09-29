-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'normal', 'hard');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'normal';

-- set the difficulty for activities that were saved before this column existed
UPDATE "Activity" SET "difficulty" = 'easy' WHERE ("type" = 'wordle' AND "maxGuesses" = 8) OR ("type" = 'wordsearch' AND "gridSize" = 8);
UPDATE "Activity" SET "difficulty" = 'hard' WHERE ("type" = 'wordle' AND "maxGuesses" = 4) OR ("type" = 'wordsearch' AND "gridSize" = 12);
