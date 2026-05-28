import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const CORAL = "#FF7F50";
const TILE_WIDTH = (Dimensions.get("window").width - 48 - 24) / 3;

const CATEGORY_EMOJI: Record<string, string> = {
  Restaurant: "🍽️",
  "Café": "☕",
  Bakery: "🥐",
  Grocery: "🛒",
  Sweets: "🍬",
  "Fast Food": "🍔",
  Pizza: "🍕",
  Sandwiches: "🥪",
  "Juice & Smoothies": "🥤",
  "Sushi / Japanese": "🍱",
  Other: "🛍️",
};

interface Props {
  visible: boolean;
  current: string;
  categories: string[];
  onClose: () => void;
  onApply: (cuisine: string) => void;
}

export function CuisineBottomSheet({ visible, current, categories, onClose, onApply }: Props) {
  const [selected, setSelected] = useState(current);

  useEffect(() => { setSelected(current); }, [current, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Cuisine</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={16} color="#555" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
            <View style={styles.grid}>
              {categories.map(cat => {
                const active = selected === cat;
                const emoji = CATEGORY_EMOJI[cat] ?? "🛍️";
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelected(active ? "" : cat)}
                    style={[styles.tile, active && styles.tileActive]}
                  >
                    <View style={[styles.emojiBox, active && styles.emojiBoxActive]}>
                      <Text style={styles.emoji}>{emoji}</Text>
                    </View>
                    <Text
                      style={[styles.tileLabel, active && styles.tileLabelActive]}
                      numberOfLines={1}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => { onApply(""); onClose(); }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetLabel}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { onApply(selected); onClose(); }}
              style={styles.applyBtn}
            >
              <Text style={styles.applyLabel}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 44,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "900", color: "#111" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  tile: {
    width: TILE_WIDTH,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  tileActive: { borderColor: CORAL, backgroundColor: "#FFF4F0" },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emojiBoxActive: { backgroundColor: "#FFE8E0" },
  emoji: { fontSize: 26 },
  tileLabel: { fontSize: 11, fontWeight: "700", color: "#333", textAlign: "center" },
  tileLabelActive: { color: CORAL },
  actions: { flexDirection: "row", gap: 12 },
  resetBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  resetLabel: { color: CORAL, fontWeight: "700", fontSize: 15 },
  applyBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  applyLabel: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
