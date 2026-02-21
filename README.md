
v2.1 ( smart consent manager ) last developed 21/02/26
features :
##Core Features
Website Scanner — Enter a URL, and the backend crawls it to detect cookies and third-party trackers (Google Analytics, Facebook, Criteo, etc.)
Tracker Classification — Each tracker is categorized (Analytics, Marketing, Suspicious, Essential) with a risk level (Low → Critical) based on cookie attributes (expiry, Secure flag, SameSite, first/third-party)
AI Privacy Policy Analysis — The scanner fetches the site's /privacy page and uses Lovable AI (Gemini model) to assess GDPR/CCPA compliance, returning highlights and missing keywords
Risk Assessment — Combines tracker data + policy analysis into an overall risk score with a suggested action (Allow / Review / Deny)
Scan History — Results are saved to the Lovable Cloud database so you can browse past scans
Privacy Report Page — Dedicated /report/:id route showing full details: risk overview, tracker table, category chart, and policy analysis
CSV Export — Download tracker data as a spreadsheet
##Tech Stack
Layer	Tool
Frontend	React + TypeScript + Tailwind CSS + shadcn/ui
Charts	Recharts
Routing	React Router
Data fetching	TanStack React Query
Backend logic	Lovable Cloud Edge Functions (the scan-website function)
AI integration	Lovable AI Gateway (no API key needed)
Database	Lovable Cloud Database (stores scan history)
Security	Row-Level Security policies on the scans table

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
