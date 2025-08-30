// server.ts
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import axios from 'axios';
import router from './routes/apiRoutes';
import dotenv from 'dotenv';

import {
    Answer,
    QuestionToGrade,
    GradeResponse,
    StudentResponse,
    StudentData,
    OpenAIChatResponse
} from './types';

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || '';

app.use('/api', router);

// app.post('/api/grade-questions', async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { questionsToGrade, language }: { questionsToGrade: QuestionToGrade[]; language: string } = req.body;
    
//     const responses: GradeResponse = {};
    
//     for (const question of questionsToGrade) {
//       const response = await axios.post<OpenAIChatResponse>('https://api.openai.com/v1/chat/completions', {
//         model: 'gpt-4o-mini',
//         response_format: { type: 'json_object' },
//         messages: [
//           { 
//             role: 'system', 
//             content: `${process.env.SYSTEM_PROMPT}\n\nJustification should be in ${language}.` 
//           },
//           { 
//             role: 'user', 
//             content: `QUESTION: "${question.text}"\n\nANSWERS:\n${question.answers
//               .map(a => `- ID: "${a.id}", Answer: "${a.answer}"`)
//               .join('\n')}`
//           }
//         ]
//       }, {
//         headers: {
//           'Authorization': `Bearer ${OPENAI_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       responses[question.text] = JSON.parse(response.data.choices[0].message.content);

//       if (response.data.usage) {
//         await logTokenUsage('/api/grade-questions', response.data.usage, 'gpt-4o-mini');
//       }
//     }
    
//     res.json(responses);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.post('/api/generate-feedback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentData, language }: { studentData: StudentData; language: string } = req.body;
    
    const response = await axios.post<OpenAIChatResponse>('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `${process.env.OVERALL_FEEDBACK_PROMPT?.replace('{language}', language) || ''}` 
        },
        { 
          role: 'user', 
          content: `STUDENT ANSWERS AND GRADES:\n${Object.entries(studentData.responses)
            .map(([question, details]) => 
              `- QUESTION: "${question}", ANSWER: "${details.answer}", FEEDBACK: "${details.feedback}"`
            )
            .join('\n')}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // if (response.data.usage) {
    //   await logTokenUsage('/api/generate-feedback', response.data.usage, 'gpt-4o-mini');
    // }
    
    res.json({ feedback: response.data.choices[0].message.content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT: number = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});