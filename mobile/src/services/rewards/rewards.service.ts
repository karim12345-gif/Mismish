import api from "../api";

export type RewardTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
export type RewardType = "DISCOUNT" | "FREE_DELIVERY";
export type RewardTransactionType = "EARN_ORDER" | "REDEEM_REWARD" | "ADJUSTMENT" | "EXPIRE";
export type RewardRedemptionStatus = "ACTIVE" | "USED" | "EXPIRED";

export interface RewardAccount {
  id: number;
  userId: number;
  pointsBalance: number;
  lifetimePoints: number;
  tier: RewardTier;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: number;
  title: string;
  description: string | null;
  pointsCost: number;
  type: RewardType;
  value: number;
  isActive: boolean;
}

export interface RewardTransaction {
  id: number;
  userId: number;
  orderId: number | null;
  type: RewardTransactionType;
  points: number;
  description: string;
  createdAt: string;
}

export interface RewardRedemption {
  id: number;
  rewardId: number;
  pointsSpent: number;
  code: string;
  status: RewardRedemptionStatus;
  expiresAt: string | null;
  createdAt: string;
  reward: Reward;
}

export interface RewardsSummary {
  account: RewardAccount;
  rewards: Reward[];
  transactions: RewardTransaction[];
  redemptions: RewardRedemption[];
}

export interface RewardsSummaryResponse {
  status: string;
  data: RewardsSummary;
}

export interface RedeemRewardResponse {
  status: string;
  data: RewardRedemption;
}

const getMyRewards = async (): Promise<RewardsSummaryResponse> => {
  const response = await api.get<RewardsSummaryResponse>("/rewards/v1/me");
  return response.data;
};

const redeemReward = async (rewardId: number): Promise<RedeemRewardResponse> => {
  const response = await api.post<RedeemRewardResponse>("/rewards/v1/redeem", {
    rewardId,
  });
  return response.data;
};

export const RewardsServices = {
  getMyRewards,
  redeemReward,
};
