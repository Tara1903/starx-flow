<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9da4525b-72b0-46b2-b2d6-28ceda678e7e

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Check system status

Run both frontend checks together:

```bash
npm run check-system
```

## Deploy on GitHub / Vercel

This repository now includes a GitHub Actions workflow at `.github/workflows/vercel-deploy.yml`.

### Required GitHub secrets

Add these secrets to your GitHub repository settings:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_ROOT`
- `VERCEL_PROJECT_ID_OUTREACH`

If you only want to deploy the root app, add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID_ROOT`.

> Note: this workflow deploys the two frontend apps only. The backend service in `ai-outreach/outreachai-backend` is not currently configured for Vercel deployment and requires a separate host or server setup.

### How it works

On push to `main`, the workflow will:

1. install dependencies for both frontend apps
2. run the `npm run lint:all` check
3. deploy the root app to Vercel
4. deploy the nested outreach frontend to Vercel

### Local deploy test

You can also run the production build locally:

```bash
npm run build
cd ai-outreach/ai-outreach-automation-system
npm run build
```
