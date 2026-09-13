import React, { useState } from 'react';
import { JobListing } from '../types';
import { getJobProvider } from '../services/jobProvider';
import {
  Search,
  MapPin,
  Briefcase,
  Building,
  ExternalLink,
  SlidersHorizontal,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface FindJobsViewProps {
  onMatchJobListing: (listing: JobListing) => void;
}

export const FindJobsView: React.FC<FindJobsViewProps> = ({ onMatchJobListing }) => {
  const [query, setQuery] = useState('Full Stack Engineer');
  const [location, setLocation] = useState('Remote');
  const [jobType, setJobType] = useState<'All' | 'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<JobListing[]>([]);

  const provider = getJobProvider();
  const isConfigured = provider.isConfigured();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const data = await provider.searchJobs({
        query,
        location,
        jobType,
      });
      setResults(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="find-jobs-view" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Live Job Search Architecture</h2>
        <p className="text-xs text-slate-500 mt-1">
          Pluggable JobProvider interface connecting real career APIs with strict truthfulness.
        </p>
      </div>

      {/* Integration Notice if credentials not configured */}
      {!isConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 flex items-start gap-3">
          <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950 text-sm">Real Job API Integration Notice</h4>
            <p className="leading-relaxed">
              ResumePilot follows a strict <span className="font-semibold">No Fake Data</span> policy. Real job listings require API credentials (e.g. Adzuna, Reed, or RapidAPI Jobs) specified in <code className="px-1 py-0.5 bg-amber-100/80 rounded font-mono text-[11px]">JOB_PROVIDER_API_KEY</code>.
            </p>
            <p className="text-amber-800">
              In the meantime, you can paste or upload any live job posting directly in the{' '}
              <span className="font-bold">Job Matcher</span> tab to calculate exact match metrics and generate tailored applications!
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Job Title, Skills, or Keywords"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="City, State, or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            {isLoading ? 'Searching...' : 'Search Jobs'}
          </button>
        </div>
      </form>

      {/* Results Container */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
            {isConfigured ? (
              'No jobs matched your specific search criteria.'
            ) : (
              <div className="max-w-md mx-auto space-y-2">
                <p className="font-semibold text-slate-700 text-sm">Provider API Configuration Required</p>
                <p className="text-slate-400">
                  Configure <code className="text-indigo-600">JOB_PROVIDER_API_KEY</code> to enable live automated querying across millions of corporate hiring boards.
                </p>
              </div>
            )}
          </div>
        ) : (
          results.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-indigo-200 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="font-medium text-slate-700">{job.company}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.jobType}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onMatchJobListing(job)}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  Match Resume
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
