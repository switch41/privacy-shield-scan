
# Privacy Shield Scan (SmartConsent)

A modern web privacy scanner and consent analytics dashboard.

**Privacy Shield Scan (SmartConsent)** lets you scan any public website for cookies, trackers, and consent practices, then visualizes the risk profile and privacy grade in a clean, dashboard-style UI. It’s built for researchers, compliance teams, and developers who want quick insight into how websites handle tracking and consent.

---

## Features

- **Website Privacy Scanner**
  - Scan any URL using a Supabase Edge Function (`scan-website`)
  - Detect cookies and third‑party trackers
  - Compute an overall **risk level** (Low → Critical)

- **Privacy Grade**
  - Assigns a letter grade (A+ → F) with an underlying score out of 100
  - Shows an explanation and suggested actions to improve privacy

- **Tracker Analytics**
  - Categorizes trackers (e.g. Essential, Analytics, Marketing, Third‑Party)
  - Visualizes tracker categories and counts per scan
  - Detailed tracker table with drill‑down panel

- **Scan History & Dashboard**
  - Stores scans in a Supabase `scans` table
  - Overview dashboard with:
    - Total scans
    - Total trackers
    - Average trackers per scan
    - Distribution of risk levels
    - Average privacy grade across all scans

- **Consent Awareness**
  - Tracks user consent preferences in local storage
  - Surfaces consent labels (Essential, Analytics, Marketing, Third‑Party)

- **Modern UI**
  - Built with React, TypeScript, Tailwind CSS, and shadcn‑ui
  - Responsive layout and polished dashboard components

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn‑ui, Radix UI
- **Charts**: Recharts
- **Routing**: React Router
- **Forms & Validation**: React Hook Form, Zod
- **Backend**: Supabase (Postgres + Edge Functions)
- **Testing & Tooling**: ESLint, Vitest, Testing Library

---

## System Architecture

At a high level, SmartConsent is a privacy scanning pipeline that connects a **React/Vite frontend**, a **Node.js edge backend**, and several external intelligence services (Firecrawl, DuckDuckGo Tracker Radar, Gemini LLM, Supabase).

```mermaid
flowchart LR
    user[End User / Privacy Officer]
    frontend[React/Vite Frontend<br/>SmartConsent UI]
    backend[Node.js Edge Backend<br/>Scan & Orchestration]
    firecrawl[Firecrawl API<br/>DOM, Scripts, Cookies]
    radar[DuckDuckGo Tracker Radar<br/>Tracker Intelligence]
    gemini[Gemini LLM<br/>Policy Analysis]
    supabase[(Supabase Database<br/>Scan History)]

    user -->|enters URL / views reports| frontend
    frontend -->|/api/scan (URL)| backend

    backend -->|fetch DOM, scripts, cookies| firecrawl
    firecrawl --> backend

    backend -->|cross‑reference domains| radar
    radar --> backend

    backend -->|analyze privacy policy text| gemini
    gemini --> backend

    backend -->|persist scan results| supabase
    supabase -->|load dashboard & history| backend

    backend -->|risk score, trackers, grade| frontend
```

**End‑to‑end flow (based on the diagrams above):**

1. The **user** inputs a website URL or uses the safe sandbox to browse.
2. The **React/Vite frontend** sends the URL to the **Node.js edge backend** (`/api/scan` or Supabase function).
3. The backend uses **Firecrawl** to fetch DOM, scripts, and cookies, then extracts domains.
4. Extracted domains are checked against **DuckDuckGo Tracker Radar** to classify trackers and assign heuristic risk scores.
5. The backend scrapes the site’s privacy policy (if present) and sends the text to **Gemini LLM** to evaluate legal compliance and missing clauses.
6. The backend combines tracker heuristics + policy analysis into a **final risk score and privacy grade**, saves everything to **Supabase**, and returns a structured response to the frontend.
7. The frontend renders **real‑time scan results**, **historical dashboard analytics**, and **detailed tracker/policy views** for the user.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm (comes with Node)
- A Supabase project (for database and the `scan-website` function)

### 1. Clone the repository

```bash
git clone https://github.com/switch41/privacy-shield-scan.git
cd privacy-shield-scan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` (or `.env.local`) file in the project root and add:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Adjust/add any other environment variables you use for Supabase functions or external services.

---

## Supabase Setup (High Level)

1. **Create a Supabase project**.
2. **Create a `scans` table** (example):

   ```sql
   create table if not exists public.scans (
     id uuid primary key default gen_random_uuid(),
     url text not null,
     overall_risk text not null,
     risk_explanation text,
     suggested_action text,
     trackers jsonb,
     policy_analysis jsonb,
     tracker_count int,
     privacy_grade jsonb,
     created_at timestamptz default now()
   );
   ```

3. **Deploy an Edge Function named `scan-website`** that:
   - Accepts `{ url }` in the request body
   - Scans the website for cookies/trackers
   - Analyzes the privacy policy
   - Returns a JSON payload with:
     - `url`, `timestamp`
     - `overallRisk`, `riskExplanation`, `suggestedAction`
     - `trackers`
     - `policyAnalysis`
     - `privacyGrade`

4. Make sure CORS and function settings allow your frontend origin.

---

## Running the App

### Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

- `npm run build` creates an optimized production bundle.
- `npm run preview` serves the built app locally.

---

## Project Structure (Simplified)

- `src/pages/Index.tsx` – main scanner page (URL input, scan results)
- `src/pages/Overview.tsx` – dashboard with aggregated stats and privacy grades
- `src/pages/Sandbox.tsx` – sandbox / experimentation area
- `src/components/*` – UI components (forms, tables, charts, cards, dialogs)
- `src/integrations/supabase/*` – Supabase client and helpers
- `src/lib/types.ts` – shared TypeScript types (e.g. `ScanResult`, `TrackerInfo`)
- `public/` – static assets

---

## Scripts

From `package.json`:

- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run build:dev` – development-mode build
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint
- `npm run test` – run tests once
- `npm run test:watch` – run tests in watch mode

---

## License

This project is intended for academic and research purposes.  
Add your chosen license text here (e.g. MIT, Apache‑2.0, or custom).
