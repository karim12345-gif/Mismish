import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRedeemReward, useRewards } from "../../hooks/useRewards";
import { Reward } from "../../services/rewards/rewards.service";

const TIER_TARGETS = {
  BRONZE: 500,
  SILVER: 1500,
  GOLD: 3000,
  PLATINUM: 3000,
};

const nextTierLabel = {
  BRONZE: "Silver",
  SILVER: "Gold",
  GOLD: "Platinum",
  PLATINUM: "Top tier",
};

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
        new Date(value),
      )
    : "No expiry";

export default function WalletScreen() {
  const navigation = useNavigation();
  const rewardsQuery = useRewards();
  const redeemReward = useRedeemReward();

  const account = rewardsQuery.data?.account;
  const rewards = rewardsQuery.data?.rewards ?? [];
  const transactions = rewardsQuery.data?.transactions ?? [];
  const redemptions = rewardsQuery.data?.redemptions ?? [];

  const tierProgress = useMemo(() => {
    if (!account) return 0;
    const target = TIER_TARGETS[account.tier];
    if (account.tier === "PLATINUM") return 1;
    return Math.min(account.lifetimePoints / target, 1);
  }, [account]);

  const handleRedeem = (reward: Reward) => {
    if (!account || account.pointsBalance < reward.pointsCost) {
      Alert.alert("Not enough points", "Keep rescuing bags to unlock this reward.");
      return;
    }

    Alert.alert("Redeem reward?", `${reward.pointsCost} points for ${reward.title}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Redeem",
        onPress: () =>
          redeemReward.mutate(reward.id, {
            onSuccess: (redemption) => {
              Alert.alert("Reward unlocked", `Your code is ${redemption.code}`);
            },
            onError: (error) => Alert.alert("Could not redeem", error.message),
          }),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFFDF8]">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF8" />

      <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-[#E6DED4]"
        >
          <Feather name="chevron-left" size={22} color="#112D2B" />
        </TouchableOpacity>
        <Text className="text-[18px] font-black text-[#112D2B]">
          MishMish Rewards
        </Text>
        <TouchableOpacity
          onPress={() => rewardsQuery.refetch()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-[#E6DED4]"
        >
          <Feather name="refresh-cw" size={18} color="#112D2B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={rewardsQuery.isRefetching}
            onRefresh={rewardsQuery.refetch}
            tintColor="#F26C4F"
          />
        }
      >
        {rewardsQuery.isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color="#F26C4F" />
            <Text className="mt-3 text-[#63716D] font-semibold">
              Loading rewards...
            </Text>
          </View>
        ) : rewardsQuery.isError ? (
          <View className="bg-white rounded-[22px] border border-[#F3D3CB] p-5 mt-4">
            <Text className="text-[#C2410C] font-black text-[16px] mb-2">
              Rewards are not available
            </Text>
            <Text className="text-[#63716D] font-medium text-[13px] leading-5">
              {rewardsQuery.error.message}
            </Text>
          </View>
        ) : (
          <>
            <View className="bg-[#F26C4F] rounded-[28px] p-6 shadow-sm shadow-[#F26C4F]/30 relative overflow-hidden mt-2">
              <View className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
              <View className="absolute -left-10 bottom-4 w-24 h-24 rounded-full bg-white/10" />

              <View className="flex-row items-center justify-between mb-8">
                <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={18} color="#FFF" />
                  <Text className="text-white font-black text-[15px] ml-2">
                    Rewards balance
                  </Text>
                </View>
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white font-black text-[12px]">
                    {account?.tier ?? "BRONZE"}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-end">
                <Text className="text-white font-black text-[46px] tracking-tight leading-none">
                  {account?.pointsBalance ?? 0}
                </Text>
                <Text className="text-white/85 font-extrabold text-[15px] ml-2 mb-2">
                  pts
                </Text>
              </View>
              <Text className="text-white/85 font-semibold text-[13px] mt-2">
                {account?.lifetimePoints ?? 0} lifetime points earned
              </Text>

              <View className="mt-6">
                <View className="h-2.5 bg-white/25 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{ width: `${tierProgress * 100}%` }}
                  />
                </View>
                <Text className="text-white/85 font-semibold text-[12px] mt-2">
                  {account?.tier === "PLATINUM"
                    ? "You are at the top tier"
                    : `Progress to ${account ? nextTierLabel[account.tier] : "Silver"}`}
                </Text>
              </View>
            </View>

            {redemptions.length > 0 && (
              <View className="mt-7">
                <Text className="font-black text-[19px] text-[#112D2B] mb-3">
                  Active rewards
                </Text>
                {redemptions.map((redemption) => (
                  <View
                    key={redemption.id}
                    className="bg-[#E6F3EE] rounded-[20px] p-4 mb-3 border border-[#366150]/10"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 pr-4">
                        <Text className="text-[#112D2B] font-black text-[15px]">
                          {redemption.reward.title}
                        </Text>
                        <Text className="text-[#63716D] font-semibold text-[12px] mt-1">
                          Expires {formatDate(redemption.expiresAt)}
                        </Text>
                      </View>
                      <View className="bg-white rounded-full px-3 py-1.5">
                        <Text className="text-[#366150] font-black text-[12px]">
                          {redemption.code}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View className="mt-7">
              <Text className="font-black text-[19px] text-[#112D2B] mb-3">
                Redeem points
              </Text>
              {rewards.map((reward) => {
                const canRedeem = (account?.pointsBalance ?? 0) >= reward.pointsCost;
                return (
                  <TouchableOpacity
                    key={reward.id}
                    onPress={() => handleRedeem(reward)}
                    disabled={redeemReward.isPending}
                    className="bg-white rounded-[22px] p-4 mb-3 border border-[#E6DED4] flex-row items-center"
                  >
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                        canRedeem ? "bg-[#F26C4F]" : "bg-gray-100"
                      }`}
                    >
                      <MaterialCommunityIcons
                        name={reward.type === "FREE_DELIVERY" ? "bike-fast" : "ticket-percent"}
                        size={24}
                        color={canRedeem ? "#FFF" : "#9CA3AF"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#112D2B] font-black text-[15px]">
                        {reward.title}
                      </Text>
                      <Text className="text-[#63716D] font-medium text-[12px] mt-1 leading-4">
                        {reward.description}
                      </Text>
                    </View>
                    <View className="items-end ml-3">
                      <Text className="text-[#112D2B] font-black text-[14px]">
                        {reward.pointsCost}
                      </Text>
                      <Text className="text-[#63716D] font-semibold text-[11px]">
                        points
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="mt-7">
              <Text className="font-black text-[19px] text-[#112D2B] mb-3">
                Points history
              </Text>
              {transactions.length === 0 ? (
                <View className="items-center justify-center bg-white rounded-[22px] p-8 border border-[#E6DED4]">
                  <MaterialCommunityIcons name="history" size={28} color="#A7B3AF" />
                  <Text className="text-[#112D2B] font-black text-[16px] mt-3">
                    No points yet
                  </Text>
                  <Text className="text-[#63716D] font-medium text-[12px] text-center mt-1">
                    Complete an order to start earning MishMish Rewards.
                  </Text>
                </View>
              ) : (
                transactions.map((transaction) => (
                  <View
                    key={transaction.id}
                    className="bg-white rounded-[18px] p-4 mb-3 border border-[#E6DED4] flex-row items-center"
                  >
                    <View className="w-10 h-10 rounded-full bg-[#FFF3EF] items-center justify-center mr-3">
                      <Feather
                        name={transaction.points > 0 ? "plus" : "minus"}
                        size={18}
                        color="#F26C4F"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#112D2B] font-bold text-[13px]">
                        {transaction.description}
                      </Text>
                      <Text className="text-[#63716D] font-medium text-[11px] mt-1">
                        {formatDate(transaction.createdAt)}
                      </Text>
                    </View>
                    <Text
                      className={`font-black text-[14px] ${
                        transaction.points > 0 ? "text-[#16A34A]" : "text-[#F26C4F]"
                      }`}
                    >
                      {transaction.points > 0 ? "+" : ""}
                      {transaction.points}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
