/**
 * AI Support Chat Service
 *
 * Sends chat messages to the Mismish backend, which handles the OpenAI call
 * server-side. The OpenAI API key lives only on the backend — never in the app.
 *
 * Backend must implement:
 *   POST /support/v1/chat
 *   Headers: Authorization: Bearer <accessToken>  (handled by api.ts interceptor)
 *   Body:    { messages: ChatMessage[], orderContext?: OrderSummary[] }
 *   Response: { status: "success", data: { reply: string, action?: SupportAction } }
 */

import api from "../api";
import { Order } from "../order/order.service";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SupportAction {
  type: "show_order_status" | "initiate_refund" | "escalate_to_human";
  orderId?: number;
  reason?: string;
}

export interface SendMessageParams {
  messages: ChatMessage[];
  orderContext?: Order[];
}

export interface SendMessageResult {
  reply: string;
  action?: SupportAction;
}

// ─── Config ──────────────────────────────────────────────────────────────────

/**
 * How many user+assistant turns to keep in the request.
 * The backend should also enforce this, but we trim client-side first
 * to keep payloads small.
 */
const MAX_HISTORY_TURNS = 6;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const applySlideWindow = (messages: ChatMessage[]): ChatMessage[] => {
  const system = messages.filter((m) => m.role === "system");
  const conversation = messages.filter((m) => m.role !== "system");
  return [...system, ...conversation.slice(-(MAX_HISTORY_TURNS * 2))];
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const sendSupportMessage = async (
  params: SendMessageParams,
): Promise<SendMessageResult> => {
  const trimmedMessages = applySlideWindow(params.messages);

  const { data } = await api.post<{
    status: string;
    data: { reply: string; action?: SupportAction };
  }>("/support/v1/chat", {
    messages: trimmedMessages,
    // Send only the 3 most recent orders — keeps the payload lean
    orderContext: params.orderContext?.slice(0, 3) ?? [],
  });

  const rawReply = data.data.reply ?? "";
  const shouldEscalate = rawReply.includes("[ESCALATE]");
  const reply = rawReply.replace("[ESCALATE]", "").trim();

  return {
    reply,
    action:
      data.data.action ??
      (shouldEscalate ? { type: "escalate_to_human" } : undefined),
  };
};
