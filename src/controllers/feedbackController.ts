import { Request, Response } from "express";
import { OpenAIService } from "../services/openaiService";
import requestManager from "../services/requestManager";

export class FeedbackController {
  static async generateFeedback(req: Request, res: Response) {
    try {
      const { quizId, studentData, language } = req.body;

      if (!quizId || !studentData || !language) {
        return res.status(400).json({
          error: "Missing required fields: studentData or language",
        });
      }

      const controller = new AbortController();
      requestManager.setActiveTask(quizId, controller);

      if (controller.signal.aborted) {
        throw new Error("Feedback generation was canceled before it started.");
      }

      const feedback = await OpenAIService.generateFeedback(
        studentData,
        language,
        controller.signal,
      );

      res.json(feedback);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Unknown error occurred" });
      }
    } finally {
      const { quizId } = req.body;
      if (quizId) {
        requestManager.clearActiveTask(quizId);
      }
    }
  }
}
