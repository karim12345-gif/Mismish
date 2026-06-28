import type { Response } from "express";

// Registry: vendorId → connected SSE response objects
const streams = new Map<number, Set<Response>>();

export const addStream = (vendorId: number, res: Response): void => {
  if (!streams.has(vendorId)) streams.set(vendorId, new Set());
  streams.get(vendorId)!.add(res);
};

export const removeStream = (vendorId: number, res: Response): void => {
  streams.get(vendorId)?.delete(res);
  if (streams.get(vendorId)?.size === 0) streams.delete(vendorId);
};

export const emitOrderEvent = (
  vendorId: number,
  event: "new_order" | "order_cancelled",
  data: object,
): void => {
  const clients = streams.get(vendorId);
  if (!clients?.size) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      // Dead connection — clean it up
      clients.delete(res);
    }
  }
};
