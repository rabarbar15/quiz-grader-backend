import { Request, Response } from "express";
import { GradeResponse } from "../types";
import { OpenAIService } from "../services/openaiService";
import requestManager from "../services/requestManager";

export class GradingController {
  static async gradeQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { quizId, questionsToGrade, language } = req.body;

      if (!quizId || !questionsToGrade || !language) {
        res.status(400).json({ error: "Missing required fields" });
        throw new Error("Missing required fields");
      }

      const controller = new AbortController();
      const responses: GradeResponse = {};

      requestManager.setActiveTask(quizId, controller);

      if (controller.signal.aborted) {
        throw new Error("Grading was canceled before it started.");
      }

      for (const question of questionsToGrade) {
        const response = await OpenAIService.gradeQuestion(
          question,
          language,
          controller.signal,
        );
        responses[question.text] = response;
      }

      res.json(responses);
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
