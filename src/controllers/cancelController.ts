import { Request, Response } from "express";
import requestManager from "../services/requestManager";

type CancelRequest = Request<{
  quizId: string;
}>;

export class CancelController {
  static cancelGrading = (req: CancelRequest, res: Response) => {
    const success = requestManager.cancelActiveTask(req.body.quizId);
    res.json({ success });
  };
}
