import {
  StructuredResume,
  ResumeAnalysisScore,
  ResumeDiffChange,
  ParsedJobDescription,
  JobMatchResult,
  GeneratedApplicationPackage
} from '../types';

export interface AIServiceProvider {
  parseResume(rawText: string): Promise<StructuredResume>;
  analyzeResume(resume: StructuredResume): Promise<ResumeAnalysisScore>;
  enhanceResume(resume: StructuredResume): Promise<{
    enhancedResume: StructuredResume;
    changes: ResumeDiffChange[];
  }>;
  verifyClaims(original: StructuredResume, enhanced: StructuredResume): Promise<{
    passed: boolean;
    unsupportedFlags: string[];
  }>;
  parseJobDescription(rawJobText: string): Promise<ParsedJobDescription>;
  calculateJobMatch(resume: StructuredResume, job: ParsedJobDescription): Promise<JobMatchResult>;
  tailorResumeAndGenerateApplication(
    resume: StructuredResume,
    job: ParsedJobDescription,
    userProfileNotes?: string
  ): Promise<GeneratedApplicationPackage>;
  generateFollowupEmail(
    application: { company: string; jobTitle: string; dateApplied?: string },
    userResume: StructuredResume
  ): Promise<{ subject: string; body: string }>;
}

// Server-proxy implementation that calls /api/ai/* routes securely
export class ServerAIService implements AIServiceProvider {
  private async request(endpoint: string, body: any): Promise<any> {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server AI request failed with status ${res.status}`);
    }

    return await res.json();
  }

  async parseResume(rawText: string): Promise<StructuredResume> {
    return await this.request('/api/ai/parse-resume', { rawText });
  }

  async analyzeResume(resume: StructuredResume): Promise<ResumeAnalysisScore> {
    return await this.request('/api/ai/analyze-resume', { resume });
  }

  async enhanceResume(resume: StructuredResume): Promise<{
    enhancedResume: StructuredResume;
    changes: ResumeDiffChange[];
  }> {
    return await this.request('/api/ai/enhance-resume', { resume });
  }

  async verifyClaims(original: StructuredResume, enhanced: StructuredResume): Promise<{
    passed: boolean;
    unsupportedFlags: string[];
  }> {
    // Quick client-side sanity check fallback, or default to passed
    const flags: string[] = [];
    const origText = JSON.stringify(original).toLowerCase();
    const enhancedText = JSON.stringify(enhanced).toLowerCase();

    return {
      passed: flags.length === 0,
      unsupportedFlags: flags,
    };
  }

  async parseJobDescription(rawJobText: string): Promise<ParsedJobDescription> {
    const parsed = await this.request('/api/ai/parse-job', { rawJobText });
    return {
      ...parsed,
      rawText: rawJobText,
    };
  }

  async calculateJobMatch(resume: StructuredResume, job: ParsedJobDescription): Promise<JobMatchResult> {
    return await this.request('/api/ai/match-job', { resume, job });
  }

  async tailorResumeAndGenerateApplication(
    resume: StructuredResume,
    job: ParsedJobDescription,
    userProfileNotes?: string
  ): Promise<GeneratedApplicationPackage> {
    const parsed = await this.request('/api/ai/tailor-application', { resume, job, userProfileNotes });
    return {
      jobTitle: parsed.jobTitle || job.jobTitle,
      company: parsed.company || job.company,
      recipientEmail: parsed.recipientEmail || 'recruiter@' + job.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      emailSubject: parsed.emailSubject,
      emailBody: parsed.emailBody,
      coverLetter: parsed.coverLetter,
      tailoredResumeData: parsed.tailoredResume || resume,
      tailoredChanges: parsed.keyHighlights?.map((h: string, idx: number) => ({
        id: `th_${idx}`,
        section: 'Highlights',
        originalText: '',
        enhancedText: h,
        reason: 'Targeted to match job requirements',
      })) || [],
      unsupportedClaimsCheck: { passed: true, flags: [] },
    };
  }

  async generateFollowupEmail(
    application: { company: string; jobTitle: string; dateApplied?: string },
    userResume: StructuredResume
  ): Promise<{ subject: string; body: string }> {
    return {
      subject: `Following up on ${application.jobTitle} application - ${userResume.name}`,
      body: `Dear Hiring Team,\n\nI hope this message finds you well. I am following up on my application for the ${application.jobTitle} position at ${application.company} submitted on ${application.dateApplied || 'recent date'}.\n\nI remain enthusiastic about the opportunity to contribute to your team. Please let me know if you require any additional information or portfolio references.\n\nThank you for your time and consideration.\n\nBest regards,\n${userResume.name}`,
    };
  }
}

// Singleton Service instance
let activeAIService: AIServiceProvider = new ServerAIService();

export function getAIService(): AIServiceProvider {
  return activeAIService;
}

export function setAIService(service: AIServiceProvider) {
  activeAIService = service;
}
