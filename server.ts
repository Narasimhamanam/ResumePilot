import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Lazy initialization of Gemini client using server-side GEMINI_API_KEY
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing on server.');
  }
  return new GoogleGenAI({ apiKey });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // 1. Resume Parsing Endpoint
  app.post('/api/ai/parse-resume', async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText) {
        return res.status(400).json({ error: 'Missing rawText in request body' });
      }

      const ai = getGeminiClient();
      const prompt = `
Extract structured data from the following resume text.
CRITICAL MANDATE:
- Do NOT fabricate missing details. If phone, linkedin, or github is not present, omit or mark as missing.
- Divide experience into clear companies, roles, and real bullet points.
- Extract skills strictly listed in the document.

RESUME TEXT:
${rawText.slice(0, 15000)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              linkedIn: { type: Type.STRING },
              gitHub: { type: Type.STRING },
              portfolio: { type: Type.STRING },
              professionalSummary: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    field: { type: Type.STRING },
                    year: { type: Type.STRING },
                    gpa: { type: Type.STRING },
                    details: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['institution', 'degree'],
                },
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['company', 'role', 'bullets'],
                },
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                    link: { type: Type.STRING },
                  },
                  required: ['title'],
                },
              },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['name', 'skills', 'experience', 'education'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Server AI parse error:', err);
      return res.status(500).json({ error: err.message || 'Error processing resume with Gemini AI' });
    }
  });

  // 2. Resume Audit Endpoint
  app.post('/api/ai/analyze-resume', async (req, res) => {
    try {
      const { resume } = req.body;
      const ai = getGeminiClient();
      const prompt = `
Perform an in-depth 8-pillar audit of this structured resume.
Evaluate against modern Applicant Tracking System (ATS) parsers and senior tech recruiters.

RESUME DATA:
${JSON.stringify(resume, null, 2)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall: { type: Type.NUMBER },
              atsCompatibility: { type: Type.NUMBER },
              contentQuality: { type: Type.NUMBER },
              skillsDepth: { type: Type.NUMBER },
              experienceImpact: { type: Type.NUMBER },
              projectsQuality: { type: Type.NUMBER },
              keywordOptimization: { type: Type.NUMBER },
              formattingStandard: { type: Type.NUMBER },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              criticalGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionableRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'overall',
              'atsCompatibility',
              'contentQuality',
              'skillsDepth',
              'experienceImpact',
              'strengths',
              'criticalGaps',
              'actionableRecommendations',
            ],
          },
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Server AI analyze error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 3. Resume Enhance Endpoint
  app.post('/api/ai/enhance-resume', async (req, res) => {
    try {
      const { resume } = req.body;
      const ai = getGeminiClient();
      const prompt = `
You are an elite executive career coach. Enhance this candidate's resume bullet points and summary.

CRITICAL ANTI-FABRICATION MANDATE:
- Do NOT invent companies, job titles, university degrees, or dates.
- Reword bullets using strong active verbs and the Google "Accomplished [X] as measured by [Y], by doing [Z]" formula.
- If specific numbers are missing, keep the action truthful and improve phrasing clarity without inventing false metrics.

ORIGINAL RESUME:
${JSON.stringify(resume, null, 2)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              enhancedResume: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                  linkedIn: { type: Type.STRING },
                  gitHub: { type: Type.STRING },
                  portfolio: { type: Type.STRING },
                  professionalSummary: { type: Type.STRING },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  experience: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        company: { type: Type.STRING },
                        role: { type: Type.STRING },
                        location: { type: Type.STRING },
                        startDate: { type: Type.STRING },
                        endDate: { type: Type.STRING },
                        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['company', 'role', 'bullets'],
                    },
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                        link: { type: Type.STRING },
                      },
                      required: ['title'],
                    },
                  },
                  education: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        institution: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        field: { type: Type.STRING },
                        year: { type: Type.STRING },
                        gpa: { type: Type.STRING },
                        details: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['institution', 'degree'],
                    },
                  },
                  certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['name', 'skills', 'experience', 'education'],
              },
              changes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    section: { type: Type.STRING },
                    itemIdentifier: { type: Type.STRING },
                    originalText: { type: Type.STRING },
                    enhancedText: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    status: { type: Type.STRING },
                  },
                  required: ['id', 'section', 'originalText', 'enhancedText', 'reason'],
                },
              },
            },
            required: ['enhancedResume', 'changes'],
          },
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error('Server AI enhance error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 4. Job Matching & Parsing Endpoints
  app.post('/api/ai/parse-job', async (req, res) => {
    try {
      const { rawJobText } = req.body;
      const ai = getGeminiClient();
      const prompt = `
Parse this job description into structured metadata:
${rawJobText.slice(0, 15000)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              jobType: { type: Type.STRING },
              requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              recipientEmail: { type: Type.STRING },
            },
            required: ['title', 'company', 'requiredSkills', 'keywords'],
          },
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/match-job', async (req, res) => {
    try {
      const { resume, job } = req.body;
      const ai = getGeminiClient();
      const prompt = `
Compare this candidate's resume against the target job description.

RESUME:
${JSON.stringify(resume, null, 2)}

JOB:
${JSON.stringify(job, null, 2)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchPercentage: { type: Type.NUMBER },
              matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              keywordGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              experienceFitAnalysis: { type: Type.STRING },
              strengthsForRole: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendationsToImproveMatch: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'matchPercentage',
              'matchingSkills',
              'missingSkills',
              'keywordGaps',
              'experienceFitAnalysis',
              'strengthsForRole',
              'recommendationsToImproveMatch',
            ],
          },
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 5. Tailor & Generate Application Package
  app.post('/api/ai/tailor-application', async (req, res) => {
    try {
      const { resume, job, userProfileNotes } = req.body;
      const ai = getGeminiClient();
      const prompt = `
Create a tailored application package for this candidate and target job.
1. Re-order and emphasize relevant experience bullets without inventing false history.
2. Draft a compelling personalized cold outreach email for the hiring manager.
3. Draft a tailored cover letter.

RESUME:
${JSON.stringify(resume, null, 2)}

JOB:
${JSON.stringify(job, null, 2)}

ADDITIONAL CANDIDATE NOTES:
${userProfileNotes || 'None'}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              jobTitle: { type: Type.STRING },
              recipientEmail: { type: Type.STRING },
              emailSubject: { type: Type.STRING },
              emailBody: { type: Type.STRING },
              coverLetter: { type: Type.STRING },
              tailoredResume: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                  linkedIn: { type: Type.STRING },
                  gitHub: { type: Type.STRING },
                  portfolio: { type: Type.STRING },
                  professionalSummary: { type: Type.STRING },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  experience: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        company: { type: Type.STRING },
                        role: { type: Type.STRING },
                        location: { type: Type.STRING },
                        startDate: { type: Type.STRING },
                        endDate: { type: Type.STRING },
                        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['company', 'role', 'bullets'],
                    },
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                        link: { type: Type.STRING },
                      },
                      required: ['title'],
                    },
                  },
                  education: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        institution: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        field: { type: Type.STRING },
                        year: { type: Type.STRING },
                        gpa: { type: Type.STRING },
                        details: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['institution', 'degree'],
                    },
                  },
                  certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['name', 'skills', 'experience', 'education'],
              },
              keyHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'company',
              'jobTitle',
              'recipientEmail',
              'emailSubject',
              'emailBody',
              'coverLetter',
              'tailoredResume',
              'keyHighlights',
            ],
          },
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResumePilot full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
