-- CreateTable
CREATE TABLE "ProfilType" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "score" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfilType_pkey" PRIMARY KEY ("id")
);
