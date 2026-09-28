import { Request, Response, NextFunction } from "express";
import { handleControllerError as handle } from "../../shared/http/handleControllerError";
import * as rewardsService from "./rewards.service";

export const getMyRewards = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await rewardsService.getMyRewards(req.user!.id);
    res.status(200).json({ status: "success", data });
  } catch (e) {
    handle(e, res, next);
  }
};

export const redeemReward = async (
  req: Request<{}, {}, { rewardId: number }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await rewardsService.redeemReward(req.user!.id, req.body.rewardId);
    res.status(201).json({ status: "success", data });
  } catch (e) {
    handle(e, res, next);
  }
};
