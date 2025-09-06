export interface TokenUsage {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export interface UsageData {
  totalTokensUsed: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  requestsCount: number;
  averageTokensPerRequest: number;
  lastUpdated: string;
  usageByEndpoint: {
    [endpoint: string]: {
      totalTokens: number;
      promptTokens: number;
      completionTokens: number;
      requests: number;
    };
  };
}

export interface Answer {
  id: string;
  answer: string;
}

export interface QuestionToGrade {
  text: string;
  answers: Answer[];
}

export interface GradeResponse {
  [question: string]: {
    correctAnswerId: string;
    justification: string;
  };
}

export interface StudentResponse {
  answer: string;
  feedback: string;
}

export interface StudentData {
  responses: {
    [question: string]: StudentResponse;
  };
}

export interface OpenAIChatRequest {
  model: string;
  response_format?: {
    type: string;
  };
  messages: {
    role: "user" | "system";
    content: string;
  }[];
}

export interface Prompt {
  system: string;
  version?: string;
  last_updated?: string;
}

export interface PromptInfo {
  name: string;
  version?: string;
  last_updated?: string;
  length: number;
}
