# Environment Variables Setup

## Objective
Outline the necessary environment variables for the Meta Cloud API integration without exposing or committing actual secrets to the repository.

## Required Variables

### 1. Meta Application Identifiers
- `META_APP_ID`: The unique ID of the Facebook App from the Developer Console.
- `META_APP_SECRET`: The secret key for the Facebook App (used to exchange short-lived tokens).

### 2. Webhook Security
- `META_VERIFY_TOKEN`: A custom, randomly generated string. You set this in your Vercel Environment Variables, and input the exact same string into the Meta Webhook configuration dashboard. This ensures that only Meta can register webhooks against your endpoints.

### 3. Account Specific Data (Stored in DB, NOT Env)
- `WHATSAPP_PHONE_ID`: Stored dynamically per-user in Supabase `connected_channels`.
- `WHATSAPP_TOKEN`: Stored dynamically per-user in Supabase `connected_channels`.

## Deployment Rules
- These variables must be added to Vercel Project Settings → Environment Variables.
- Ensure that the `.env` file containing these is added to `.gitignore`.
- Provide an `.env.example` with empty fields for local developer setup.
