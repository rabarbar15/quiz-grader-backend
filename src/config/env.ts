import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
};
