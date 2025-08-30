import { Request, Response } from "express";
import { OpenAIService } from "../services/openaiService";
import { QuestionToGrade, GradeResponse } from "../types";

export class GradingController {
  static async gradeQuestions(req: Request, res: Response): Promise<void> {
    try {
      const {
        questionsToGrade,
        language,
      }: { questionsToGrade: QuestionToGrade[]; language: string } = req.body;
      const responses: GradeResponse = {};

      for (const question of questionsToGrade) {
        const response = await OpenAIService.gradeQuestion(question, language);
        responses[question.text] = response;
      }

      res.json(responses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
