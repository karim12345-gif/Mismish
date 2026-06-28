import { AppError } from "../../shared/lib/AppError";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OrderSummary {
  id: number;
  orderCode: string;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  surpriseBox?: { vendor?: { name: string } | null } | null;
}

export interface ChatResult {
  reply: string;
  action?: {
    type: "show_order_status" | "initiate_refund" | "escalate_to_human";
    orderId?: number;
  };
}

// ─── Config ──────────────────────────────────────────────────────────────────

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";
const MAX_REPLY_TOKENS = 500;
const MAX_HISTORY_TURNS = 6;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildSystemPrompt = (orders: OrderSummary[]): string => {
  const orderLines = orders.length
    ? orders
        .slice(0, 3)
        .map((o) => {
          const store = o.surpriseBox?.vendor?.name ?? "Unknown store";
          const date = new Date(o.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          return `- Order #${o.id} (code: ${o.orderCode}) | Store: ${store} | Status: ${o.status} | Delivery: ${o.deliveryMethod} | Date: ${date}`;
        })
        .join("\n")
    : "No recent orders found for this user.";

  return `You are Mismish Support, the AI customer support agent for Mismish — a food rescue app in Saudi Arabia that helps customers buy surplus food bags from restaurants and cafes at a big discount (up to 70% off).

## About Mismish
- Customers browse "Surprise Boxes" from nearby restaurants — each box contains surplus food at a discounted price
- Delivery methods: pickup (customer goes to store) or delivery (courier brings it)
- Order statuses: PENDING → CONFIRMED → PREPARING → READY → COMPLETED (or CANCELLED / REFUND_REQUESTED / REFUNDED)
- Refunds are only possible before the order is picked up / delivered. Once completed, no refund.
- For pickup orders: customer shows their order code (QR or number) at the store
- Mismish is available across Saudi Arabia (Riyadh, Jeddah, Dammam, and more)
- Support email: support@mismish.com

## User's Recent Orders
${orderLines}

## Your Role
Answer support questions helpfully and accurately. You can help with:
- **Order tracking**: explain what the current status means and what happens next
- **Refund requests**: check if eligible (not yet completed/picked up), explain the process
- **Missing or wrong items**: empathize and escalate to human if needed
- **App questions**: how to use Mismish, how surprise boxes work, pickup vs delivery
- **Account issues**: login problems, phone verification, etc.
- **General questions**: Mismish pricing, how discounts work, partner restaurants

## Rules
1. Reply in the same language the user writes in — Arabic or English. If they write in Arabic, respond in Arabic. If English, respond in English.
2. Be warm, friendly, and concise. Use 1–4 sentences. Don't pad or repeat yourself.
3. Never invent order details — only reference orders listed above.
4. If the user asks about a specific order by code/number and it's not in the list above, say you can only see their 3 most recent orders and ask them to email support with the order code.
5. End your reply with exactly "[ESCALATE]" (nothing after it) ONLY when: the issue genuinely cannot be resolved by AI (e.g., missing items, billing dispute, account suspension, complaint about a store, anything requiring manual review). Do NOT escalate for general questions, order status checks, or how-to questions.`;
};

/**
 * Keep only the last MAX_HISTORY_TURNS pairs of user/assistant messages.
 * The system message is always preserved at position 0.
 */
const trimHistory = (messages: ChatMessage[]): ChatMessage[] => {
  const system = messages.filter((m) => m.role === "system");
  const conversation = messages.filter((m) => m.role !== "system");
  return [...system, ...conversation.slice(-(MAX_HISTORY_TURNS * 2))];
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const chat = async (
  incomingMessages: ChatMessage[],
  orderContext: OrderSummary[] = [],
): Promise<ChatResult> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AppError(500, "OpenAI API key is not configured on the server.");
  }

  // Replace or prepend the system message with the fully-built prompt
  const messagesWithoutSystem = incomingMessages.filter(
    (m) => m.role !== "system",
  );
  const systemMessage: ChatMessage = {
    role: "system",
    content: buildSystemPrompt(orderContext),
  };

  const trimmed = trimHistory([systemMessage, ...messagesWithoutSystem]);

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: trimmed,
      max_tokens: MAX_REPLY_TOKENS,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as any;
    throw new AppError(
      502,
      `OpenAI error: ${err?.error?.message ?? response.statusText}`,
    );
  }

  const data = (await response.json()) as any;
  const rawReply: string = data.choices?.[0]?.message?.content ?? "";

  const shouldEscalate = rawReply.includes("[ESCALATE]");
  const reply = rawReply.replace("[ESCALATE]", "").trim();

  return {
    reply,
    action: shouldEscalate ? { type: "escalate_to_human" } : undefined,
  };
};
