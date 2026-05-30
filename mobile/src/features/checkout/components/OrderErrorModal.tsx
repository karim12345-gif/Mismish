import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface OrderErrorModalProps {
  visible: boolean;
  onClose: () => void;
  onHomePress: () => void;
  reason?: "expired" | "sold_out";
}

export const OrderErrorModal = ({
  visible,
  onClose,
  onHomePress,
  reason = "expired",
}: OrderErrorModalProps) => {
  const isSoldOut = reason === "sold_out";
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={isSoldOut ? "basket-remove-outline" : "clock-alert-outline"}
              size={48}
              color="#FF7F50"
            />
          </View>

          <Text style={styles.title}>{isSoldOut ? "Just Sold Out!" : "Time's Up!"}</Text>
          <Text style={styles.description}>
            {isSoldOut
              ? "Someone just grabbed the last one before you. Check out other bags nearby!"
              : "This bag's rescue window has closed. Don't worry, there are plenty of other bags waiting for you to save them!"}
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onHomePress}>
            <Text style={styles.primaryButtonText}>Find Another Bag</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFF0EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111111",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#FF7F50",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#FF7F50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#999999",
    fontSize: 14,
    fontWeight: "700",
  },
});
