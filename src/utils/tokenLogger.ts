import { promises as fs } from 'fs';
import { TokenUsage, UsageData } from '../types';
import * as path from 'path';

const LOG_FILE: string = path.join(__dirname, '../data/token-stats.json')

export async function ensureFileExists(filePath: string, defaultContent: string = '{}') {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, defaultContent);
  }
}

export const logTokenUsage = async (
  endpoint: string,
  usage: TokenUsage,
  model: string
): Promise<void> => {
  let usageData: UsageData = {
    totalTokensUsed: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    requestsCount: 0,
    averageTokensPerRequest: 0,
    lastUpdated: new Date().toISOString(),
    usageByEndpoint: {}
  };

  try {
    const data = await fs.readFile(LOG_FILE, 'utf8');
    usageData = JSON.parse(data);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error('Error reading log file:', err);
      return;
    }
  }

  usageData.totalTokensUsed += usage.total_tokens;
  usageData.totalPromptTokens += usage.prompt_tokens;
  usageData.totalCompletionTokens += usage.completion_tokens;
  usageData.requestsCount += 1;
  usageData.averageTokensPerRequest = Math.round(
    usageData.totalTokensUsed / usageData.requestsCount
  );
  usageData.lastUpdated = new Date().toISOString();

  if (!usageData.usageByEndpoint[endpoint]) {
    usageData.usageByEndpoint[endpoint] = {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      requests: 0
    };
  }

  usageData.usageByEndpoint[endpoint].totalTokens += usage.total_tokens;
  usageData.usageByEndpoint[endpoint].promptTokens += usage.prompt_tokens;
  usageData.usageByEndpoint[endpoint].completionTokens += usage.completion_tokens;
  usageData.usageByEndpoint[endpoint].requests += 1;

  try {
    await ensureFileExists(LOG_FILE, '{}');
    await fs.writeFile(LOG_FILE, JSON.stringify(usageData, null, 2));
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
};
