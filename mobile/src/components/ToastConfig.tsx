import React from "react";
import { View, Text } from "react-native";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: "#18C96D",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name="check" size={15} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>{text1}</Text>
        {!!text2 && (
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 1 }}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#EF4444" }}
      text1Style={{ fontSize: 14, fontWeight: "700" }}
      text2Style={{ fontSize: 12 }}
    />
  ),
};
