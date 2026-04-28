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

export type PriceRange = "" | "1-15" | "16-25" | "25+";

const CORAL = "#FF7F50";

const RANGES: { value: PriceRange; label: string }[] = [
  { value: "1-15", label: "﷼ 1 – ﷼ 15" },
  { value: "16-25", label: "﷼ 16 – ﷼ 25" },
  { value: "25+", label: "25+" },
];

interface Props {
  visible: boolean;
  current: PriceRange;
  onClose: () => void;
  onApply: (p: PriceRange) => void;
}

export function PriceBottomSheet({ visible, current, onClose, onApply }: Props) {
  const [selected, setSelected] = useState<PriceRange>(current);

  useEffect(() => { setSelected(current); }, [current, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Price Range</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={16} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.chipRow}>
            {RANGES.map(r => {
              const active = selected === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  onPress={() => setSelected(active ? "" : r.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {r.label}
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
  chipRow: { flexDirection: "row", gap: 10, marginBottom: 32 },
  chip: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { borderColor: CORAL, backgroundColor: "#FFF4F0" },
  chipLabel: { fontWeight: "700", fontSize: 13, color: "#333" },
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
