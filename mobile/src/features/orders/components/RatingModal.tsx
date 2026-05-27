import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Order } from "../../../services/order/order.service";

interface Props {
  visible: boolean;
  order: Order | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
}

const STAR_LABELS = ["Terrible", "Bad", "Okay", "Good", "Amazing! 🎉"];

export const RatingModal = ({
  visible,
  order,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const bag    = order?.surpriseBox;
  const vendor = bag?.vendor;

  const reset = () => {
    setRating(0);
    setComment("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0 || isSubmitting) return;
    onSubmit(rating, comment.trim() || undefined);
    reset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Dimmed backdrop */}
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Sheet */}
        <View className="bg-white rounded-t-3xl px-6 pt-4 pb-8">
          {/* Handle */}
          <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-[#111] font-black text-[18px]">
              Rate your bag
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Store info */}
          <View className="flex-row items-center mb-6">
            {bag?.imageUrl ? (
              <Image
                source={{ uri: bag.imageUrl }}
                className="w-14 h-14 rounded-xl mr-3"
                resizeMode="cover"
              />
            ) : (
              <View className="w-14 h-14 rounded-xl bg-[#FFF5F2] items-center justify-center mr-3">
                <Text className="text-3xl">🎁</Text>
              </View>
            )}
            <View>
              <Text className="text-[#111] font-black text-[15px]">
                {vendor?.name ?? "Store"}
              </Text>
              <Text className="text-gray-400 font-medium text-[13px]">
                {bag?.name ?? "Surprise Bag"}
              </Text>
            </View>
          </View>

          {/* Stars */}
          <View className="items-center mb-1">
            <View className="flex-row gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={star <= rating ? "star" : "star-outline"}
                    size={44}
                    color={star <= rating ? "#F5B224" : "#DDD"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text
              className="font-bold text-[14px] h-5"
              style={{ color: rating > 0 ? "#FF7F50" : "transparent" }}
            >
              {rating > 0 ? STAR_LABELS[rating - 1] : "."}
            </Text>
          </View>

          {/* Comment */}
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience (optional)"
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={3}
            className="border border-gray-200 rounded-2xl px-4 py-3 text-[#111] text-[14px] mt-4 mb-5"
            style={{ textAlignVertical: "top", minHeight: 80 }}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="rounded-2xl items-center justify-center mb-3"
            style={{
              height: 52,
              backgroundColor: rating === 0 ? "#E5E5E5" : "#FF7F50",
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className="font-black text-[15px]"
                style={{ color: rating === 0 ? "#aaa" : "#fff" }}
              >
                Submit Review
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} className="items-center py-1">
            <Text className="text-gray-400 font-medium text-[14px]">
              Maybe later
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
