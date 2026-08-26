CREATE TYPE "RewardTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

CREATE TYPE "RewardTransactionType" AS ENUM ('EARN_ORDER', 'REDEEM_REWARD', 'ADJUSTMENT', 'EXPIRE');

CREATE TYPE "RewardType" AS ENUM ('DISCOUNT', 'FREE_DELIVERY');

CREATE TYPE "RewardRedemptionStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED');

CREATE TABLE "RewardAccount" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "pointsBalance" INTEGER NOT NULL DEFAULT 0,
  "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
  "tier" "RewardTier" NOT NULL DEFAULT 'BRONZE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RewardAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reward" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "pointsCost" INTEGER NOT NULL,
  "type" "RewardType" NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RewardTransaction" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "orderId" INTEGER,
  "type" "RewardTransactionType" NOT NULL,
  "points" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RewardTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RewardRedemption" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "rewardId" INTEGER NOT NULL,
  "orderId" INTEGER,
  "pointsSpent" INTEGER NOT NULL,
  "code" TEXT NOT NULL,
  "status" "RewardRedemptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RewardRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RewardAccount_userId_key" ON "RewardAccount"("userId");
CREATE UNIQUE INDEX "RewardTransaction_orderId_type_key" ON "RewardTransaction"("orderId", "type");
CREATE INDEX "RewardTransaction_userId_idx" ON "RewardTransaction"("userId");
CREATE UNIQUE INDEX "RewardRedemption_code_key" ON "RewardRedemption"("code");
CREATE INDEX "RewardRedemption_userId_idx" ON "RewardRedemption"("userId");
CREATE INDEX "RewardRedemption_rewardId_idx" ON "RewardRedemption"("rewardId");

ALTER TABLE "RewardAccount"
ADD CONSTRAINT "RewardAccount_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RewardTransaction"
ADD CONSTRAINT "RewardTransaction_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RewardTransaction"
ADD CONSTRAINT "RewardTransaction_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RewardRedemption"
ADD CONSTRAINT "RewardRedemption_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RewardRedemption"
ADD CONSTRAINT "RewardRedemption_rewardId_fkey"
FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RewardRedemption"
ADD CONSTRAINT "RewardRedemption_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
