import { Request, Response } from "express";
import { OpenAIService } from "../services/openaiService";

export class FeedbackController {
    static async generateFeedback (req: Request, res: Response) {
        try {
            const { studentData, language } = req.body

            if (!studentData || !studentData.responses || !language) {
            return res.status(400).json({ 
                error: 'Missing required fields: studentData or language' 
            })
            }

            const feedback = await OpenAIService.generateFeedback(studentData, language);
            res.json(feedback);
        } catch (error: any) {
            console.error("Error in generateFeedback controller:", error);
            res.status(500).json({ error: error.message });
        }
    }
}