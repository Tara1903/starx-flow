# Environment Setup Guide

This document outlines the secrets and environment variables used across the different layers of the StarX codebase.

> [!WARNING]
> **Never commit your `.env` files to version control.** Always use the `.example` files as templates and inject secrets securely through your hosting providers (Vercel, Supabase, Render).

## 1. Frontend Environment (`.env.frontend.example`)
These variables are bundled with the React/Vite application. They are public-facing or safely exposed to the client.

- `VITE_SUPABASE_URL`: The public URL of your Supabase project.
- `VITE_SUPABASE_ANON_KEY`: The public anonymous key for Supabase.
- `VITE_GEMINI_API_KEY`: Used conditionally for direct AI integration from the client if bypassing the backend.

*Deployment:* Add these to your Vercel Project Settings under Environment Variables.

## 2. Backend Environment (`.env.backend.example`)
These variables are used by the Node.js backend processes, specifically the `whatsapp-server` and any local administration scripts.

- `SUPABASE_URL`: The URL of your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`: The master key for bypassing Row Level Security. **Never expose this.**
- `TARGET_USER_ID`: Used by the `whatsapp-server` to bind the WhatsApp instance to a specific user.
- `PORT`: The port the worker runs on (default: 10000).
- `RENDER_EXTERNAL_URL`: Set automatically by Render (or manually) to expose the worker's public URL for webhooks.

*Deployment:* Add these to your Render/Railway instance or Vercel (if migrating backend).

## 3. Supabase Environment (`.env.supabase.example`)
These variables are injected into Supabase Edge Functions.

- `SUPABASE_URL`: Self-referential URL for the edge functions to call DB operations.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for elevated permissions in edge functions.
- `GEMINI_API_KEY`: Used by `ai-processor` for LLM tasks.
- `NVIDIA_API_KEY`: Used by `ai-processor` for Nvidia-hosted LLMs.
- `RESEND_API_KEY`: Used by `send-email` to dispatch transaction emails.
- `STRIPE_WEBHOOK_SECRET`: Used by `stripe-webhook` to verify Stripe payload signatures.
- `META_VERIFY_TOKEN`: Used by `whatsapp-webhook` to verify the initial Meta/Facebook webhook subscription challenge.

*Deployment:* Set these using the Supabase CLI:
```bash
supabase secrets set --env-file .env.supabase
```
