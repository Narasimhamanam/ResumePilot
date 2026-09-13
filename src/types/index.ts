export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  skills: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSectionExperience {
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface ResumeSectionEducation {
  institution: string;
  degree: string;
  field?: string;
  year?: string;
  gpa?: string;
  details?: string[];
}

export interface ResumeSectionProject {
  title: string;
  description: string;
  technologies: string[];
  bullets: string[];
  link?: string;
}

export interface StructuredResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  gitHub?: string;
  portfolio?: string;
  professionalSummary: string;
  skills: string[];
  education: ResumeSectionEducation[];
  experience: ResumeSectionExperience[];
  projects: ResumeSectionProject[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  missingFields?: string[];
}

export interface ResumeAnalysisScore {
  overall: number;
  atsCompatibility: number;
  contentQuality: number;
  skillsScore: number;
  experienceScore: number;
  projectsScore: number;
  educationScore: number;
  keywordOptimization: number;
  formatting: number;
  recommendations: {
    category: string;
    issue: string;
    suggestion: string;
    severity: 'critical' | 'warning' | 'tip';
  }[];
  missingKeywordsDetected?: string[];
}

export interface ResumeDiffChange {
  id: string;
  section: 'summary' | 'experience' | 'projects' | 'skills' | 'general';
  fieldPath: string;
  originalText: string;
  enhancedText: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  hasUnsupportedClaimWarning?: boolean;
  unsupportedClaimDetails?: string;
}

export interface ResumeVersion {
  id: string;
  userId: string;
  title: string;
  isPrimary: boolean;
  structuredData: StructuredResume;
  rawText?: string;
  score?: ResumeAnalysisScore;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedJobDescription {
  id?: string;
  jobTitle: string;
  company: string;
  location: string;
  jobType: 'Remote' | 'Hybrid' | 'On-site' | 'Full-time' | 'Contract';
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  education: string;
  responsibilities: string[];
  technologies: string[];
  keywords: string[];
  rawText: string;
}

export interface JobMatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  keywordGaps: string[];
  strengths: string[];
  fitSummary: string;
  tailoringSuggestions: string[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  postedDate: string;
  requiredSkills: string[];
  description: string;
  applicationUrl?: string;
  matchScore?: number;
  isExternalConfigRequired?: boolean;
}

export interface GeneratedApplicationPackage {
  jobTitle: string;
  company: string;
  recipientEmail: string;
  emailSubject: string;
  emailBody: string;
  coverLetter?: string;
  tailoredResumeData: StructuredResume;
  tailoredChanges: {
    section: string;
    changeDescription: string;
  }[];
  unsupportedClaimsCheck: {
    passed: boolean;
    flags: string[];
  };
}

export type ApplicationStatus =
  | 'Draft'
  | 'Ready'
  | 'Sent'
  | 'Interview'
  | 'Rejected'
  | 'Offer'
  | 'Withdrawn';

export interface JobApplicationRecord {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  jobUrl?: string;
  recipientEmail: string;
  resumeVersionId: string;
  resumeTitle: string;
  emailSubject: string;
  emailBody: string;
  coverLetter?: string;
  status: ApplicationStatus;
  dateApplied?: string;
  notes?: string;
  followupDate?: string;
  followupSent?: boolean;
  followupEmailContent?: string;
  emailAccountId?: string;
  deliveryLog?: {
    service: 'gmail' | 'outlook' | 'manual';
    sentAt: string;
    messageId?: string;
    error?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConnectedEmailAccount {
  id: string;
  userId: string;
  provider: 'gmail' | 'outlook';
  email: string;
  displayName?: string;
  status: 'connected' | 'disconnected' | 'needs_reauth';
  connectedAt: string;
  scopes: string[];
}

export interface AutomationRule {
  id: string;
  userId: string;
  enabled: boolean;
  dailyApplicationLimit: number;
  autoScheduleFollowupDays: number;
  requireUserApprovalForFollowup: boolean;
  requireUserApprovalForSend: boolean;
  duplicateApplicationDetection: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'resume_uploaded' | 'resume_analyzed' | 'resume_enhanced' | 'job_matched' | 'application_prepared' | 'application_sent' | 'followup_scheduled';
  title: string;
  description: string;
  timestamp: string;
}
