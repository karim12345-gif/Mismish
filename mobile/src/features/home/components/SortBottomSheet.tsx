import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export type SortOption = "" | "pickup_time" | "distance";

const CORAL = "#FF7F50";

const OPTIONS: { value: SortOption; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { value: "pickup_time", label: "Pickup Time", icon: "clock" },
  { value: "distance", label: "Distance", icon: "map-pin" },
];

interface Props {
  visible: boolean;
  current: SortOption;
  onClose: () => void;
  onApply: (s: SortOption) => void;
}

export function SortBottomSheet({ visible, current, onClose, onApply }: Props) {
  const [selected, setSelected] = useState<SortOption>(current);

  useEffect(() => { setSelected(current); }, [current, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Sort By</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={16} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.chipRow}>
            {OPTIONS.map(opt => {
              const active = selected === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setSelected(active ? "" : opt.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Feather name={opt.icon} size={16} color={active ? CORAL : "#555"} />
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
    marginBottom: 28,
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
  chipRow: { flexDirection: "row", gap: 12, marginBottom: 32 },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  chipActive: { borderColor: CORAL, backgroundColor: "#FFF4F0" },
  chipLabel: { fontWeight: "700", fontSize: 14, color: "#333" },
  chipLabelActive: { color: CORAL },
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
