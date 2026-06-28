import React, { useState, useRef, useEffect, useCallback } from "react";
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
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  OrderServices,
  Order,
} from "../services/order/order.service";
import {
  sendSupportMessage,
  ChatMessage,
  SupportAction,
} from "../services/support/support.service";

// ─── Types ───────────────────────────────────────────────────────────────────

type MessageRole = "user" | "bot";

interface UIMessage {
  id: string;
  role: MessageRole;
  text: string;
  action?: SupportAction;
  isLoading?: boolean;
}

interface AIAssistantProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SUPPORT_EMAIL = "support@mismish.com";

const QUICK_REPLIES = [
  "Track my order",
  "Request a refund",
  "Order was wrong",
  "Talk to a human",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Compact system prompt — ORDERS_PLACEHOLDER is replaced inside support.service
 * with only the 3 most recent orders and minimal fields.
 * Keeping this short saves ~200 tokens per request.
 */
const SYSTEM_PROMPT =
  "You are Mismish's AI support agent (food rescue app, Saudi Arabia). " +
  "User's recent orders:\nORDERS_PLACEHOLDER\n\n" +
  "Help with: order tracking, refund requests, general questions. " +
  "Rules: reply in user's language; ≤3 sentences; don't invent order data; " +
  'end with "[ESCALATE]" if escalating to human.';

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ─── Component ───────────────────────────────────────────────────────────────

export const AIAssistantBottomSheet = ({
  visible,
  onClose,
}: AIAssistantProps) => {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // Reset and fetch orders whenever chat opens
  useEffect(() => {
    if (!visible) return;

    setMessages([
      {
        id: makeId(),
        role: "bot",
        text: "Hi! 👋 I'm Mismish's AI support. I can help you track orders, request refunds, or answer any questions. How can I help you today?",
      },
    ]);
    setHistory([]);
    setInputText("");
    setIsEscalated(false);

    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await OrderServices.getMyOrders();
        setOrders(res.data ?? []);
      } catch {
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [visible]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const userMsg: UIMessage = { id: makeId(), role: "user", text: trimmed };
      const loadingId = makeId();
      const loadingMsg: UIMessage = { id: loadingId, role: "bot", text: "", isLoading: true };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setInputText("");
      setIsSending(true);

      const updatedHistory: ChatMessage[] = [
        ...history,
        { role: "user", content: trimmed },
      ];

      try {
        const result = await sendSupportMessage({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...updatedHistory,
          ],
          orderContext: orders,
        });

        const botMsg: UIMessage = {
          id: makeId(),
          role: "bot",
          text: result.reply,
          action: result.action,
        };

        setMessages((prev) =>
          prev.filter((m) => m.id !== loadingId).concat(botMsg),
        );
        setHistory([...updatedHistory, { role: "assistant", content: result.reply }]);

        if (result.action?.type === "escalate_to_human") {
          setIsEscalated(true);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message ?? err?.message ?? "Unknown error";
        console.error("[Support] chat failed:", status, msg);
        const devHint = __DEV__ ? ` [${status ?? "no response"}: ${msg}]` : "";
        setMessages((prev) =>
          prev.filter((m) => m.id !== loadingId).concat({
            id: makeId(),
            role: "bot",
            text: `Sorry, I couldn't connect right now. Please email us at ${SUPPORT_EMAIL} and we'll sort it out quickly.${devHint}`,
          }),
        );
      } finally {
        setIsSending(false);
      }
    },
    [history, orders, isSending],
  );

  const handleEscalate = useCallback(() => {
    const transcript = history
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "Customer" : "AI"}: ${m.content}`)
      .join("\n\n");

    const subject = encodeURIComponent("Mismish Support Request");
    const body = encodeURIComponent(
      `Hi Mismish support team,\n\nA customer needs help. Chat transcript below:\n\n${transcript || "(no conversation yet)"}\n\nPlease follow up. Thank you.`,
    );

    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`).catch(() =>
      Alert.alert("Contact Support", `Email us at ${SUPPORT_EMAIL}`, [
        { text: "OK" },
      ]),
    );
  }, [history]);

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
          <View className="px-5 py-3 border-b border-gray-100 flex-row items-center">
            <View className="flex-1" />
            <Text className="text-[#111] font-black text-[18px] flex-1 text-center">
              Support
            </Text>
            <View className="flex-1 items-end">
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Feather name="x" size={16} color="#111" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Agent badge */}
          <View className="items-center py-5 px-5 border-b border-gray-50 bg-[#FFF8F5]">
            <View className="w-14 h-14 bg-[#FFF0EB] rounded-full items-center justify-center mb-2 border border-[#FFE0D6]">
              <Feather name="cpu" size={24} color="#FF7F50" />
            </View>
            <Text className="text-[#111] font-black text-[15px] mb-0.5">
              Mismish AI Support
            </Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-400 mr-1.5" />
              <Text className="text-gray-500 text-[12px] font-medium">
                {isLoadingOrders
                  ? "Loading your orders…"
                  : "Online · Instant replies"}
              </Text>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Quick replies — show before user sends first message */}
            {messages.filter((m) => m.role === "user").length === 0 && (
              <View className="flex-row flex-wrap gap-x-2 gap-y-2 mt-3 mb-2">
                {QUICK_REPLIES.map((reply) => (
                  <TouchableOpacity
                    key={reply}
                    onPress={() => sendMessage(reply)}
                    className="px-4 py-2.5 rounded-2xl bg-[#FFF0EB] border border-[#FFE0D6]"
                  >
                    <Text className="text-[#FF7F50] font-bold text-[13px]">
                      {reply}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Human escalation CTA */}
            {isEscalated && (
              <View className="mt-2 mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <Text className="text-[#111] font-black text-[14px] mb-1">
                  Talk to a human agent 🤝
                </Text>
                <Text className="text-gray-500 text-[13px] mb-3 leading-5">
                  I'll send your full chat history to our support team. They'll
                  reply within a few hours.
                </Text>
                <TouchableOpacity
                  onPress={handleEscalate}
                  className="h-11 bg-[#FF7F50] rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-black text-[14px]">
                    Email Support Team
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Input bar */}
          <View className="px-4 py-3 border-t border-gray-100 bg-white flex-row items-center">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything…"
              placeholderTextColor="#999"
              className="flex-1 min-h-[44px] bg-gray-50 rounded-2xl px-4 text-[#111] font-medium mr-3"
              multiline
              maxLength={500}
              blurOnSubmit
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
            />
            <TouchableOpacity
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isSending}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                inputText.trim() && !isSending ? "bg-[#FF7F50]" : "bg-gray-200"
              }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="send" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MessageBubble = ({ msg }: { msg: UIMessage }) => {
  const isUser = msg.role === "user";

  return (
    <View
      className={`mb-4 flex-row max-w-[85%] ${
        isUser ? "self-end justify-end" : "self-start justify-start"
      }`}
    >
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-[#FFF0EB] items-center justify-center mr-2 mt-1 border border-[#FFE0D6] shrink-0">
          <Feather name="cpu" size={14} color="#FF7F50" />
        </View>
      )}
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[#FF7F50] rounded-tr-sm"
            : "bg-[#F5F5F5] rounded-tl-sm"
        }`}
      >
        {msg.isLoading ? (
          <TypingIndicator />
        ) : (
          <Text
            className={`font-medium text-[14px] leading-[20px] ${
              isUser ? "text-white" : "text-[#111]"
            }`}
          >
            {msg.text}
          </Text>
        )}
      </View>
    </View>
  );
};

const TypingIndicator = () => (
  <View className="flex-row items-center gap-x-1.5 py-1 px-0.5">
    {[0.4, 0.65, 0.9].map((opacity, i) => (
      <View
        key={i}
        className="w-2 h-2 rounded-full bg-gray-400"
        style={{ opacity }}
      />
    ))}
  </View>
);
