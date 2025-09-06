import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_API_URL:
    process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions",
};
