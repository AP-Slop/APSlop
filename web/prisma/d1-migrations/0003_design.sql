-- Screens drawn before the code (src/lib/wireframe-store.ts)
CREATE TABLE "Design" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAWING',
    "plan" TEXT NOT NULL DEFAULT '',
    "project" TEXT NOT NULL DEFAULT '{}',
    "screens" TEXT NOT NULL DEFAULT '{}',
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Design_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
ALTER TABLE "Generation" ADD COLUMN "designId" TEXT REFERENCES "Design" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
