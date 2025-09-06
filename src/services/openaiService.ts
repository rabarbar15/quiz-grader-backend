import { config } from "../config/env";
import { OpenAIChatRequest, QuestionToGrade, StudentData } from "../types";
import { logTokenUsage } from "../utils/tokenLogger";
import promptService from "./promptService";

export interface GradingResponse {
  scores: {
    id: string;
    score: number;
    justification: string;
  }[];
}

export class OpenAIService {
  static async fetchOpenAICompletion(
    requestBody: OpenAIChatRequest,
    signal: AbortSignal,
  ) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal: signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();
    if (data.usage) {
      await logTokenUsage("/api/grade-questions", data.usage, "gpt-4o-mini");
    }
    return data.choices[0].message.content;
  }

  static async gradeQuestion(
    question: QuestionToGrade,
    language: string,
    signal: AbortSignal,
  ) {
    const answers = question.answers
      .map((a) => `- ID: "${a.id}", Answer: "${a.answer}"`)
      .join("\n");

    const systemContent = `${promptService.getPrompt("grading", language)}\n\nJustification should be in ${language}.`;
    const userContent = `QUESTION: "${question.text}"\n\nANSWERS:\n${answers}`;

    const requestBody: OpenAIChatRequest = {
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
    };

    if (signal.aborted) {
      throw new Error("Grading was canceled.");
    }

    const content = await this.fetchOpenAICompletion(requestBody, signal);
    return JSON.parse(content);
  }

  static async generateFeedback(
    studentData: StudentData,
    language: string,
    signal: AbortSignal,
  ) {
    const answersAndFeedback = Object.entries(studentData.responses)
      .map(
        ([question, details]) =>
          `- QUESTION: "${question}", ANSWER: "${details.answer}", FEEDBACK: "${details.feedback}"`,
      )
      .join("\n");

    const systemContent = `${promptService.getPrompt("feedback", language)}`;
    const userContent = `STUDENT ANSWERS AND GRADES:\n${answersAndFeedback}`;
    const requestBody: OpenAIChatRequest = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
    };

    if (signal.aborted) {
      throw new Error("Feedback generation was canceled.");
    }

    const content = await this.fetchOpenAICompletion(requestBody, signal);
    return content;
  }
}
