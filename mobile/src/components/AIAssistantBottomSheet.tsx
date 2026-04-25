import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface AIAssistantProps {
  visible: boolean;
  onClose: () => void;
}

export const AIAssistantBottomSheet = ({
  visible,
  onClose,
}: AIAssistantProps) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Please choose the language\nنرجو اختيار اللغة",
    },
    { id: 2, type: "user", text: "English" },
    {
      id: 3,
      type: "bot",
      text: "Hello and welcome! Thanks for reaching out to us! Our working hours are from 9 AM to 1 AM—almost 24 hours a day, but not quite! 😄\n\nIf you message us outside these hours, don't worry—we'll get back to you as soon as possible during working hours. We appreciate your patience and understanding. Thank you.",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const QUICK_REPLIES = [
    "Inquiry",
    "Issue regarding your order",
    "I have a suggestion",
    "Vendor registration",
    "Other issue",
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newMessage = { id: Date.now(), type: "user", text: text.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Mock AI response delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text:
            "I am an AI assistant. I've received your request regarding '" +
            text.trim() +
            "'. Let me fetch those details for you instantly.",
        },
      ]);
    }, 1000);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="px-5 py-3 border-b border-gray-100 flex-row items-center justify-between">
            <View className="flex-1 items-center relative">
              <Text className="text-[#111] font-black text-[18px]">
                Mismish
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-5 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transform scale-110"
            >
              <Feather name="x" size={16} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Sub Header Container */}
          <View className="items-center py-6 px-5 border-b border-gray-50 bg-[#F4F9F6]/30">
            <View className="w-16 h-16 bg-[#FFF0EB] rounded-full flex items-center justify-center mb-3 border border-[#FFE0D6] shadow-sm shadow-black/5">
              <Feather name="cpu" size={28} color="#FF7F50" />
            </View>
            <Text className="text-[#111] font-black text-[16px] mb-1">
              AI Agent answers instantly
            </Text>
            <Text className="text-gray-500 font-medium text-[13px]">
              Ask for the team if needed
            </Text>
          </View>

          {/* Message Canvas */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-5 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View className="items-center mb-6 mt-2">
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-gray-500 font-bold text-[11px]">
                  Today
                </Text>
              </View>
            </View>

            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`mb-5 flex-row max-w-[85%] ${
                  msg.type === "user"
                    ? "self-end justify-end"
                    : "self-start justify-start"
                }`}
              >
                {msg.type === "bot" && (
                  <View className="w-8 h-8 rounded-full bg-[#FFF0EB] flex items-center justify-center mr-2 mt-1 border border-[#FFE0D6]">
                    <Feather name="cpu" size={14} color="#FF7F50" />
                  </View>
                )}
                <View
                  className={`rounded-2xl p-4 shadow-sm shadow-black/5 ${
                    msg.type === "user"
                      ? "bg-[#FF7F50] rounded-tr-sm"
                      : "bg-[#F8F6F2] rounded-tl-sm"
                  }`}
                >
                  <Text
                    className={`font-bold text-[14px] leading-5 ${
                      msg.type === "user" ? "text-white" : "text-[#111]"
                    }`}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}

            {/* Quick Replies Map */}
            <View className="flex-row flex-wrap justify-end gap-x-2 gap-y-3 mt-4">
              {QUICK_REPLIES.map((reply, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSend(reply)}
                  className={`px-4 py-3 rounded-2xl ${
                    i === 0 || i === 1 ? "bg-[#FFE4DB]" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-bold text-[13px] ${
                      i === 0 || i === 1 ? "text-[#FF7F50]" : "text-gray-600"
                    }`}
                  >
                    {reply}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Chat Input Field */}
          <View className="px-5 py-3 border-t border-gray-100 bg-white flex-row items-center">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask the AI agent..."
              placeholderTextColor="#999"
              className="flex-1 h-12 bg-gray-50 rounded-full px-5 text-[#111] font-medium mr-3"
              onSubmitEditing={() => handleSend(inputText)}
            />
            <TouchableOpacity
              onPress={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() ? "bg-[#FF7F50]" : "bg-gray-200"
              }`}
            >
              <Feather name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};
