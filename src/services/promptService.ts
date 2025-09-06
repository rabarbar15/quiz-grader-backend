/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { Prompt, PromptInfo } from "../types";

const PROMPTS_DIR = path.resolve(__dirname, "../config/prompts");

class PromptService {
  private promptsDir: string;
  private promptsCache: Record<string, Prompt>;

  constructor(promptsDir: string = PROMPTS_DIR) {
    this.promptsDir = promptsDir;
    this.promptsCache = {};
    this.loadAllPrompts();
  }

  private loadAllPrompts(): void {
    try {
      const files = fs.readdirSync(this.promptsDir);

      files.forEach((file) => {
        if (file.endsWith(".json")) {
          const promptName = path.basename(file, ".json");
          const filePath = path.join(this.promptsDir, file);
          const content = fs.readFileSync(filePath, "utf8");
          this.promptsCache[promptName] = JSON.parse(content) as Prompt;
        }
      });

      console.log("Loaded prompts:", Object.keys(this.promptsCache));
    } catch (error) {
      console.error("Error loading prompts:", error);
    }
  }

  public getPrompt(promptName: string, language: string = "english"): string {
    const prompt = this.promptsCache[promptName];
    if (!prompt) {
      throw new Error(`Prompt '${promptName}' not found`);
    }

    let promptText = prompt.system;
    if (promptText.includes("{language}")) {
      promptText = promptText.replace("{language}", language);
    }

    return promptText;
  }

  public reloadPrompts(): string[] {
    this.promptsCache = {};
    this.loadAllPrompts();
    return Object.keys(this.promptsCache);
  }

  public getPromptInfo(): PromptInfo[] {
    return Object.entries(this.promptsCache).map(([name, prompt]) => ({
      name,
      version: prompt.version,
      last_updated: prompt.last_updated,
      length: prompt.system.length,
    }));
  }
}

export default new PromptService();
