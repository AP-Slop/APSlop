-- AlterTable: the CI build of what an AI generation committed (see src/lib/build-fix.ts)
ALTER TABLE "Generation" ADD COLUMN "buildStatus" TEXT;
ALTER TABLE "Generation" ADD COLUMN "buildBranch" TEXT;
ALTER TABLE "Generation" ADD COLUMN "buildRounds" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Generation" ADD COLUMN "buildRunUrl" TEXT;
