# ResumePilot API & Architecture Documentation

## Core Workflow Endpoints & Interfaces

### 1. Authentication & Identity
- **POST** `/api/auth/register`
  - Registers candidate with email, password hash, and creates initial candidate career profile.
- **POST** `/api/auth/login`
  - Authenticates credentials and returns user session credentials.
- **POST** `/api/auth/reset-password`
  - Dispatches recovery instructions.

### 2. Resume Management & Parsing
- **POST** `/api/resumes/upload`
  - Validates document (.pdf, .docx, .txt; max 8MB), extracts clean text streams, parses structured JSON data via Gemini 2.5 Flash, and stores to database.
- **GET** `/api/resumes`
  - Lists all candidate resume versions (General, Frontend, Backend, AI/ML).
- **GET** `/api/resumes/:id`
  - Retrieves a specific structured resume version.
- **POST** `/api/resumes/:id/analyze`
  - Calculates 8-pillar ATS audit: Overall Score /100, ATS Compatibility, Content Quality, Skills Depth, Experience Impact, Projects, Keyword Optimization, Formatting.
- **POST** `/api/resumes/:id/enhance`
  - Runs AI Enhancer using strict anti-fabrication constraints (XYZ active voice, impact framing, requiring user confirmation for unstated claims).

### 3. Job Matching & Tailoring
- **POST** `/api/jobs/analyze`
  - Extracts title, company, location, requirements, and keywords from pasted or uploaded job descriptions.
- **POST** `/api/jobs/match`
  - Computes Match Percentage, Matching Skills, Missing Skills, Keyword Gaps, and fit analysis.
- **POST** `/api/applications/generate`
  - Generates tailored resume version, personalized email subject, application body, and optional cover letter.

### 4. Email Accounts & OAuth 2.0
- **GET** `/api/email/accounts`
  - Retrieves connected OAuth accounts (Gmail, Microsoft Outlook).
- **GET** `/api/email/gmail/connect` / `/api/email/outlook/connect`
  - Initiates OAuth 2.0 authorization code grant flow without ever storing user passwords.
- **POST** `/api/email/send`
  - Transmits application email directly through official Gmail REST API (`/messages/send`) or Microsoft Graph API (`/sendMail`).

### 5. Application Tracking & Follow-Ups
- **GET** `/api/applications`
  - Retrieves status pipeline (Draft, Ready, Sent, Interview, Rejected, Offer, Withdrawn).
- **PATCH** `/api/applications/:id`
  - Updates progression stage or notes.
- **POST** `/api/followups`
  - Schedules AI-generated polite follow-up reminders.
