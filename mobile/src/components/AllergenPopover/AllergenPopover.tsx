import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { ALL_ALLERGENS } from "../../constants/allergens";
import { isUserAllergicTo } from "../../utils/allergenUtils";
import { useUserAllergies } from "../../context/AllergyContext";

const SCREEN = Dimensions.get("window");
const POPOVER_WIDTH = 240;
const MAX_VISIBLE = 7;
const ROW_V_PAD = 7;

export interface AllergenAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AllergenPopoverProps {
  visible: boolean;
  onClose: () => void;
  anchor: AllergenAnchor | null;
  allergens: string[];
  ingredients?: string[];
}

export const AllergenPopover = ({
  visible,
  onClose,
  anchor,
  allergens,
}: AllergenPopoverProps) => {
  const { userAllergies } = useUserAllergies();

  if (!anchor || allergens.length === 0) return null;

  const visibleRows = Math.min(allergens.length, MAX_VISIBLE);
  const estimatedHeight = visibleRows * (16 + ROW_V_PAD * 2) + 16;

  let left = anchor.x + anchor.width - POPOVER_WIDTH;
  if (left < 12) left = 12;
  if (left + POPOVER_WIDTH > SCREEN.width - 12) left = SCREEN.width - 12 - POPOVER_WIDTH;

  let top = anchor.y + anchor.height + 8;
  if (top + estimatedHeight > SCREEN.height - 80) {
    top = anchor.y - estimatedHeight - 8;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={{
                position: "absolute",
                left,
                top,
                width: POPOVER_WIDTH,
                backgroundColor: "#EFEFEF",
                borderRadius: 14,
                paddingVertical: 6,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <ScrollView
                scrollEnabled={allergens.length > MAX_VISIBLE}
                style={
                  allergens.length > MAX_VISIBLE
                    ? { maxHeight: MAX_VISIBLE * (16 + ROW_V_PAD * 2) }
                    : undefined
                }
                showsVerticalScrollIndicator={false}
              >
                {allergens.map((id) => {
                  const found = ALL_ALLERGENS.find((a) => a.id === id);
                  const isMatch = isUserAllergicTo(id, userAllergies);
                  return (
                    <View
                      key={id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: ROW_V_PAD,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text style={{ fontSize: 15, marginRight: 10, lineHeight: 18 }}>
                        {found?.emoji ?? "⚠️"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: isMatch ? "700" : "400",
                          color: isMatch ? "#D0312D" : "#222",
                          flex: 1,
                        }}
                      >
                        {found?.label ?? id}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
