import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};