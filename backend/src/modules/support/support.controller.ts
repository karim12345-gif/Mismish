import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/lib/AppError";
import * as supportService from "./support.service";
import type { ChatRequestBody } from "./support.schemas";

const handle = (error: unknown, res: Response, next: NextFunction): void => {
  error instanceof AppError
    ? res.status(error.statusCode).json({ status: "error", message: error.message })
    : next(error);
};

export const chatWithSupport = async (
  req: Request<{}, {}, ChatRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { messages, orderContext = [] } = req.body;
    const result = await supportService.chat(messages, orderContext);
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    handle(e, res, next);
  }
};
