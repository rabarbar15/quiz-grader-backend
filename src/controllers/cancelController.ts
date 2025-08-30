import { Request, Response } from "express";
import { cancelActiveRequest } from "../services/requestManager";

export const cancelGrading = (req: Request, res: Response) => {
  const success = cancelActiveRequest();
  res.json({ success });
};
