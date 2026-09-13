import { JobListing } from '../types';

export interface JobSearchParams {
  query?: string;
  location?: string;
  jobType?: 'Remote' | 'Hybrid' | 'On-site' | 'All';
  experienceLevel?: string;
  skills?: string[];
  country?: string; // e.g. 'us', 'gb', 'in'
}

export interface JobProvider {
  name: string;
  isConfigured(): boolean;
  searchJobs(params: JobSearchParams): Promise<JobListing[]>;
}

// Concrete Provider for Adzuna Live Jobs REST API
export class RealJobApiProvider implements JobProvider {
  name = 'Adzuna Jobs Network API';

  private getCredentials(): { apiKey: string; appId: string } {
    const apiKey =
      (typeof process !== 'undefined' && (process.env?.JOB_PROVIDER_API_KEY || process.env?.ADZUNA_API_KEY)) ||
      (import.meta as any).env?.VITE_JOB_PROVIDER_API_KEY ||
      (import.meta as any).env?.JOB_PROVIDER_API_KEY ||
      '';

    const appId =
      (typeof process !== 'undefined' && (process.env?.JOB_PROVIDER_APP_ID || process.env?.ADZUNA_APP_ID)) ||
      (import.meta as any).env?.VITE_JOB_PROVIDER_APP_ID ||
      (import.meta as any).env?.JOB_PROVIDER_APP_ID ||
      '';

    return { apiKey, appId };
  }

  isConfigured(): boolean {
    const { apiKey, appId } = this.getCredentials();
    return Boolean(apiKey && appId);
  }

  async searchJobs(params: JobSearchParams): Promise<JobListing[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const { apiKey, appId } = this.getCredentials();
    const country = (params.country || 'us').toLowerCase();
    const query = params.query?.trim() || 'software engineer';
    const location = params.location?.trim() || '';

    // Adzuna Search API: https://developer.adzuna.com/docs/search
    let url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(apiKey)}&what=${encodeURIComponent(query)}&results_per_page=20&content-type=application/json`;

    if (location) {
      url += `&where=${encodeURIComponent(location)}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Adzuna API Authentication failed. Please check your JOB_PROVIDER_APP_ID and JOB_PROVIDER_API_KEY.');
        }
        throw new Error(`Job search API returned status ${res.status}`);
      }

      const data = await res.json();
      const rawResults = data.results || [];

      return rawResults.map((item: any) => ({
        id: item.id?.toString() || Math.random().toString(36).substring(2),
        title: item.title?.replace(/<\/?[^>]+(>|$)/g, '') || 'Position Listing',
        company: item.company?.display_name || 'Hiring Organization',
        location: item.location?.display_name || 'Remote / Flexible',
        jobType: item.contract_time === 'full_time' ? 'Full-time' : 'Contract',
        postedDate: item.created ? item.created.slice(0, 10) : new Date().toISOString().slice(0, 10),
        requiredSkills: item.category?.tag ? [item.category.tag] : [],
        description: item.description?.replace(/<\/?[^>]+(>|$)/g, '') || '',
        applicationUrl: item.redirect_url,
      }));
    } catch (error: any) {
      console.error('Adzuna Job Search Request Failed:', error);
      throw error;
    }
  }
}

let activeJobProvider: JobProvider = new RealJobApiProvider();

export function getJobProvider(): JobProvider {
  return activeJobProvider;
}

export function setJobProvider(provider: JobProvider) {
  activeJobProvider = provider;
}
