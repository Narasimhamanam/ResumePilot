import React, { useState } from 'react';
import { ResumeVersion, ParsedJobDescription, JobMatchResult } from '../types';
import { getAIService } from '../services/aiService';
import { useToast } from '../context/ToastContext';
import { JobMatchDisplay } from './JobMatchDisplay';
import {
  Sparkles,
  FileText,
  Briefcase,
  Building,
  Target,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

interface JobMatcherViewProps {
  resumes: ResumeVersion[];
  selectedResumeId: string;
  onSelectResume: (id: string) => void;
  onLaunchTailoredApplication: (job: ParsedJobDescription, resume: ResumeVersion) => void;
  isGeneratingApplication: boolean;
}

export const JobMatcherView: React.FC<JobMatcherViewProps> = ({
  resumes,
  selectedResumeId,
  onSelectResume,
  onLaunchTailoredApplication,
  isGeneratingApplication,
}) => {
  const [jobInputMode, setJobInputMode] = useState<'paste' | 'sample'>('paste');
  const [jobText, setJobText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedJob, setParsedJob] = useState<ParsedJobDescription | null>(null);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const { toast } = useToast();

  const currentResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  const sampleJob = `Software Engineer - Full Stack
Stripe • San Francisco, CA (Remote Friendly)
Job Type: Full-time

About The Role:
We are looking for a Software Engineer to join our Payment Platform team. You will build and scale high-throughput web applications and APIs that move billions of dollars securely.

Requirements:
- 3+ years of software engineering experience building production systems.
- Strong proficiency in TypeScript, React, Node.js, or Python.
- Deep understanding of relational databases (PostgreSQL) and distributed architecture.
- Experience with cloud platforms (AWS/GCP), CI/CD pipelines, and Docker containers.
- Strong written and verbal communication skills.

Preferred Qualifications:
- Experience in fintech or high-volume payment rails.
- Familiarity with observability, microservices, and high-concurrency event loops.`;

  const handleAnalyzeJob = async () => {
    const textToProcess = jobInputMode === 'sample' ? sampleJob : jobText;
    if (!textToProcess.trim()) {
      toast({
        type: 'error',
        title: 'Empty Job Description',
        description: 'Please paste a job description text or select the sample.',
      });
      return;
    }

    if (!currentResume) {
      toast({
        type: 'warning',
        title: 'Resume Required',
        description: 'Please upload or select a resume to match against this job.',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const ai = getAIService();
      // Step 1: Parse Job Description
      const jobParsed = await ai.parseJobDescription(textToProcess);
      setParsedJob(jobParsed);

      // Step 2: Calculate Match
      const match = await ai.calculateJobMatch(currentResume.structuredData, jobParsed);
      setMatchResult(match);

      toast({
        type: 'success',
        title: 'Match Analyzed',
        description: `Calculated match score of ${match.matchPercentage}% against ${jobParsed.company}.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Job Matching Error',
        description: err.message || 'Failed to analyze job description.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="job-matcher-view" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Job Match & ATS Fit Analyzer</h2>
        <p className="text-xs text-slate-500 mt-1">
          Paste any job description to calculate your exact ATS match percentage, identify missing competencies, and generate tailored applications.
        </p>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Resume Selection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Target Resume Version</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Choose which of your resume versions to benchmark against the job specifications.
          </p>

          <div className="space-y-2">
            {resumes.map((res) => (
              <label
                key={res.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                  res.id === currentResume?.id
                    ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="selectedResume"
                    checked={res.id === currentResume?.id}
                    onChange={() => onSelectResume(res.id)}
                    className="text-indigo-600"
                  />
                  <span>{res.title}</span>
                </div>
                {res.score && (
                  <span className="text-[11px] font-bold text-slate-500">{res.score.overall}%</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Right Column: Job Description Input */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Enter Job Description</h3>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setJobInputMode('paste')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  jobInputMode === 'paste'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setJobInputMode('sample')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  jobInputMode === 'sample'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Load Sample Job
              </button>
            </div>
          </div>

          {jobInputMode === 'paste' ? (
            <textarea
              id="job-description-textarea"
              rows={8}
              placeholder="Paste raw job description here (title, requirements, responsibilities, tech stack)..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          ) : (
            <div className="p-3.5 border border-indigo-100 bg-indigo-50/30 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {sampleJob}
            </div>
          )}

          <div className="flex justify-end">
            <button
              id="analyze-job-match-btn"
              onClick={handleAnalyzeJob}
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing Job & Calculating Match...' : 'Calculate Job Match Score'}
            </button>
          </div>
        </div>
      </div>

      {/* Match Result Display */}
      {parsedJob && matchResult && (
        <JobMatchDisplay
          job={parsedJob}
          matchResult={matchResult}
          onGenerateTailoredApplication={() => {
            if (currentResume) {
              onLaunchTailoredApplication(parsedJob, currentResume);
            }
          }}
          isGenerating={isGeneratingApplication}
        />
      )}
    </div>
  );
};
