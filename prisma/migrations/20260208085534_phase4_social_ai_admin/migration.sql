/*
  Warnings:

  - You are about to drop the column `apiKey` on the `AIConfig` table. All the data in the column will be lost.
  - Added the required column `encryptedKey` to the `AIConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIConfig" DROP COLUMN "apiKey",
ADD COLUMN     "encryptedKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminRole" TEXT,
ADD COLUMN     "socialPreferences" JSONB;

-- CreateTable
CREATE TABLE "ReferentielUpdate" (
    "id" TEXT NOT NULL,
    "millesime" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB NOT NULL,
    "diffSummary" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "ReferentielUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sharingLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendInvitation" (
    "id" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "FriendInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedAnimation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "animationData" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedAnimation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReferentielUpdate_status_idx" ON "ReferentielUpdate"("status");

-- CreateIndex
CREATE INDEX "ReferentielUpdate_millesime_categorie_cle_idx" ON "ReferentielUpdate"("millesime", "categorie", "cle");

-- CreateIndex
CREATE INDEX "AdminLog_adminUserId_timestamp_idx" ON "AdminLog"("adminUserId", "timestamp");

-- CreateIndex
CREATE INDEX "AdminLog_resourceType_resourceId_idx" ON "AdminLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "Friend_userId_status_idx" ON "Friend"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_friendId_key" ON "Friend"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "FriendInvitation_token_key" ON "FriendInvitation"("token");

-- CreateIndex
CREATE INDEX "FriendInvitation_token_idx" ON "FriendInvitation"("token");

-- CreateIndex
CREATE INDEX "FriendInvitation_inviterId_status_idx" ON "FriendInvitation"("inviterId", "status");

-- CreateIndex
CREATE INDEX "Group_ownerId_idx" ON "Group"("ownerId");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_userId_idx" ON "GroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "GroupMember_userId_idx" ON "GroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "SharedAnimation_expiresAt_idx" ON "SharedAnimation"("expiresAt");

-- CreateIndex
CREATE INDEX "SharedAnimation_userId_createdAt_idx" ON "SharedAnimation"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ReferentielUpdate" ADD CONSTRAINT "ReferentielUpdate_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendInvitation" ADD CONSTRAINT "FriendInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedAnimation" ADD CONSTRAINT "SharedAnimation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
