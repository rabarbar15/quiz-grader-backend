import axios from "axios";
import { config } from "../config/env";
import { OpenAIChatResponse, QuestionToGrade, StudentData } from "../types";
import { logTokenUsage } from "../utils/tokenLogger";
import { setActiveRequest, clearActiveRequest } from "./requestManager";
import promptService from "./promptService";

export class OpenAIService {
  static async gradeQuestion(
    question: QuestionToGrade,
    language: string,
  ): Promise<any> {
    const controller = new AbortController();
    setActiveRequest(controller);

    try {
      const response = await axios.post<OpenAIChatResponse>(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              // content: `${config.SYSTEM_PROMPT}\n\nJustification should be in ${language}.`,
              content: `${promptService.getPrompt("grading", language)}\n\nJustification should be in ${language}.`,
            },
            {
              role: "user",
              content: `QUESTION: "${question.text}"\n\nANSWERS:\n${question.answers
                .map((a) => `- ID: "${a.id}", Answer: "${a.answer}"`)
                .join("\n")}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${config.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        },
      );

      if (response.data.usage) {
        await logTokenUsage(
          "/api/grade-questions",
          response.data.usage,
          "gpt-4o-mini",
        );
      }

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error: any) {
      if (axios.isCancel(error)) {
        throw new Error("Request cancelled");
      }
      throw error;
    } finally {
      clearActiveRequest();
    }
  }

  static async generateFeedback(
    studentData: StudentData,
    language: string,
  ): Promise<string> {
    const controller = new AbortController();
    setActiveRequest(controller);

    try {
      const response = await axios.post<OpenAIChatResponse>(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `${promptService.getPrompt("feedback", language)}`,
            },
            {
              role: "user",
              content: `STUDENT ANSWERS AND GRADES:\n${Object.entries(
                studentData.responses,
              )
                .map(
                  ([question, details]) =>
                    `- QUESTION: "${question}", ANSWER: "${details.answer}", FEEDBACK: "${details.feedback}"`,
                )
                .join("\n")}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${config.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        },
      );

      if (response.data.usage) {
        await logTokenUsage(
          "/api/grade-questions",
          response.data.usage,
          "gpt-4o-mini",
        );
      }

      return response.data.choices[0].message.content;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        throw new Error("Request cancelled");
      }
      throw error;
    } finally {
      clearActiveRequest();
    }
  }
}
