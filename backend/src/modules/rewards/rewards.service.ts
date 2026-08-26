import crypto from "crypto";
import { Prisma, RewardTier } from "@prisma/client";
import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";

const COMPLETED_ORDER_BONUS = 10;

const defaultRewards = [
  {
    title: "SAR 5 off",
    description: "Use your points for a quick discount on your next rescue.",
    pointsCost: 100,
    type: "DISCOUNT" as const,
    value: 5,
  },
  {
    title: "SAR 15 off",
    description: "A bigger thank-you for frequent rescuers.",
    pointsCost: 250,
    type: "DISCOUNT" as const,
    value: 15,
  },
  {
    title: "Free delivery",
    description: "Redeem points to remove delivery fees on an eligible order.",
    pointsCost: 400,
    type: "FREE_DELIVERY" as const,
    value: 0,
  },
];

const calculateTier = (lifetimePoints: number): RewardTier => {
  if (lifetimePoints >= 3000) return "PLATINUM";
  if (lifetimePoints >= 1500) return "GOLD";
  if (lifetimePoints >= 500) return "SILVER";
  return "BRONZE";
};

const orderPoints = (order: {
  quantity: number;
  surpriseBox: { price: number };
}): number =>
  Math.max(
    1,
    Math.round(order.quantity * order.surpriseBox.price) +
      order.quantity * COMPLETED_ORDER_BONUS,
  );

const generateCode = (): string =>
  `MISH-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

export const ensureRewardCatalog = async (): Promise<void> => {
  const count = await prisma.reward.count();
  if (count > 0) return;
  await prisma.reward.createMany({ data: defaultRewards });
};

export const ensureRewardAccount = async (
  userId: number,
  tx: Prisma.TransactionClient = prisma,
) =>
  tx.rewardAccount.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

export const awardOrderPoints = async (orderId: number): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { surpriseBox: { select: { name: true, price: true } } },
    });
    if (!order || order.status !== "COMPLETED") return;

    const existing = await tx.rewardTransaction.findUnique({
      where: { orderId_type: { orderId, type: "EARN_ORDER" } },
    });
    if (existing) return;

    const account = await ensureRewardAccount(order.userId, tx);
    const points = orderPoints(order);
    const lifetimePoints = account.lifetimePoints + points;

    await tx.rewardAccount.update({
      where: { userId: order.userId },
      data: {
        pointsBalance: { increment: points },
        lifetimePoints: { increment: points },
        tier: calculateTier(lifetimePoints),
      },
    });

    await tx.rewardTransaction.create({
      data: {
        userId: order.userId,
        orderId,
        type: "EARN_ORDER",
        points,
        description: `Rescued ${order.quantity} bag${order.quantity > 1 ? "s" : ""}: ${order.surpriseBox.name}`,
      },
    });
  });
};

export const syncCompletedOrderPoints = async (userId: number): Promise<void> => {
  const orders = await prisma.order.findMany({
    where: { userId, status: "COMPLETED" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  for (const order of orders) {
    await awardOrderPoints(order.id);
  }
};

export const getMyRewards = async (userId: number) => {
  await ensureRewardCatalog();
  await syncCompletedOrderPoints(userId);

  const [account, rewards, transactions, redemptions] = await Promise.all([
    ensureRewardAccount(userId),
    prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: "asc" },
    }),
    prisma.rewardTransaction.findMany({
      where: { userId },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.rewardRedemption.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { reward: true },
    }),
  ]);

  return { account, rewards, transactions, redemptions };
};

export const redeemReward = async (userId: number, rewardId: number) => {
  await ensureRewardCatalog();

  return prisma.$transaction(async (tx) => {
    const [reward, account] = await Promise.all([
      tx.reward.findUnique({ where: { id: rewardId } }),
      ensureRewardAccount(userId, tx),
    ]);

    if (!reward || !reward.isActive) throw new AppError(404, "Reward not found");
    if (account.pointsBalance < reward.pointsCost) {
      throw new AppError(400, "Not enough points");
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const redemption = await tx.rewardRedemption.create({
      data: {
        userId,
        rewardId,
        pointsSpent: reward.pointsCost,
        code: generateCode(),
        expiresAt,
      },
      include: { reward: true },
    });

    await tx.rewardAccount.update({
      where: { userId },
      data: { pointsBalance: { decrement: reward.pointsCost } },
    });

    await tx.rewardTransaction.create({
      data: {
        userId,
        type: "REDEEM_REWARD",
        points: -reward.pointsCost,
        description: `Redeemed ${reward.title}`,
      },
    });

    return redemption;
  });
};
