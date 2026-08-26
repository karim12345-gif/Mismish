import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  RewardsServices,
  RewardsSummary,
  RewardRedemption,
} from "../services/rewards/rewards.service";

export const REWARDS_QUERY_KEY = ["rewards"] as const;

export const useRewards = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<RewardsSummary, Error>({
    queryKey: REWARDS_QUERY_KEY,
    queryFn: async () => {
      const response = await RewardsServices.getMyRewards();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();

  return useMutation<RewardRedemption, Error, number>({
    mutationFn: async (rewardId: number) => {
      const response = await RewardsServices.redeemReward(rewardId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY });
    },
  });
};
