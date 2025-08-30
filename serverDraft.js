// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs").promises;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LOG_FILE = "token_usage.log";

const logTokenUsage = async (endpoint, usage, model) => {
  let usageData = {
    totalTokensUsed: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    requestsCount: 0,
    averageTokensPerRequest: 0,
    lastUpdated: new Date().toISOString(),
    usageByEndpoint: {},
  };

  try {
    const data = await fs.readFile(LOG_FILE, "utf8");
    usageData = JSON.parse(data);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Błąd odczytu pliku logów:", err);
      return;
    }
  }

  usageData.totalTokensUsed += usage.total_tokens;
  usageData.totalPromptTokens += usage.prompt_tokens;
  usageData.totalCompletionTokens += usage.completion_tokens;
  usageData.requestsCount += 1;
  usageData.averageTokensPerRequest = Math.round(
    usageData.totalTokensUsed / usageData.requestsCount,
  );
  usageData.lastUpdated = new Date().toISOString();

  if (!usageData.usageByEndpoint[endpoint]) {
    usageData.usageByEndpoint[endpoint] = {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      requests: 0,
    };
  }

  usageData.usageByEndpoint[endpoint].totalTokens += usage.total_tokens;
  usageData.usageByEndpoint[endpoint].promptTokens += usage.prompt_tokens;
  usageData.usageByEndpoint[endpoint].completionTokens +=
    usage.completion_tokens;
  usageData.usageByEndpoint[endpoint].requests += 1;

  try {
    await fs.writeFile(LOG_FILE, JSON.stringify(usageData, null, 2));
  } catch (err) {
    console.error("Błąd zapisu do pliku logów:", err);
  }
};

app.post("/api/grade-questions", async (req, res) => {
  try {
    const { questionsToGrade, language } = req.body;

    const responses = {};
    for (const question of questionsToGrade) {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `${process.env.SYSTEM_PROMPT}\n\nJustification should be in ${language}.`,
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
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      responses[question.text] = JSON.parse(
        response.data.choices[0].message.content,
      );

      if (response.data.usage) {
        logTokenUsage(
          "/api/grade-questions",
          response.data.usage,
          "gpt-4o-mini",
        );
      }
    }

    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-feedback", async (req, res) => {
  try {
    const { studentData, language } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `${process.env.OVERALL_FEEDBACK_PROMPT.replace("{language}", language)}`,
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
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({ feedback: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
