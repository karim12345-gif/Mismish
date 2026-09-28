import { Request, Response, NextFunction } from "express";
import { handleControllerError as handle } from "../../shared/http/handleControllerError";
import * as supportService from "./support.service";
import type { ChatRequestBody } from "./support.schemas";

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
