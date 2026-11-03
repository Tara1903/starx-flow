# StarX-Flow — Phase 4B.1 Blueprint
# Document 11: External Credentials & Integration Checklist

**Document ID:** `SXF-CREDS-11`  
**Classification:** DevOps & External Infrastructure Manifest  
**Status:** Approved for Planning Baseline  
**Date:** November 1, 2026  
**Author:** DevOps Engineer & Lead Systems Architect  

---

## 1. Executive Summary

This checklist specifies all required third-party developer accounts, API credentials, OAuth client applications, webhook endpoints, and environment variables necessary to transition StarX-Flow into a fully operational, commercially deployed platform.

---

## 2. Master Credentials Matrix

| Provider / Platform | Purpose | Required Variables & Secrets | Security Scope | Verification Prerequisites |
| :--- | :--- | :--- | :---: | :--- |
| **Supabase** | Multi-tenant PostgreSQL database & Auth | `NEXT_PUBLIC_SUPABASE_URL`<br/>`NEXT_PUBLIC_SUPABASE_ANON_KEY`<br/>`SUPABASE_SERVICE_ROLE_KEY` | Public / Server Role | Supabase EU Project created (`iotuxpcqewdzvqzncpad`). |
| **Google AI Studio** | Gemini 2.0 Flash LLM inference | `GEMINI_API_KEY`<br/>`NEXT_PUBLIC_GEMINI_API_KEY` | Server-side / Client Sandbox | Google Cloud Console project with Generative Language API enabled. |
| **NVIDIA AI NIM** | Secondary fallback LLM inference | `NVIDIA_API_KEY` | Server-side Only | NVIDIA Developer Account with NIM API credits. |
| **Meta Developer Platform** | WhatsApp Cloud API & Instagram Graph API | `META_APP_ID`<br/>`META_APP_SECRET`<br/>`META_ACCESS_TOKEN`<br/>`META_VERIFY_TOKEN` | Server-side Only | Meta Business Verification, verified WhatsApp Business Account (WABA), registered Business Page. |
| **Stripe** | European SEPA & Card Subscriptions | `STRIPE_SECRET_KEY`<br/>`STRIPE_WEBHOOK_SECRET` | Server-side Only | Stripe European Merchant Account (SEPA Direct Debit + Cards enabled). |
| **Google Cloud (Calendar)** | Google Calendar bi-directional sync | `GOOGLE_CLIENT_ID`<br/>`GOOGLE_CLIENT_SECRET` | Server-side Only | OAuth Consent Screen configured with `calendar.events` scope. |
| **Microsoft Azure (Outlook)** | Microsoft Outlook calendar sync | `AZURE_CLIENT_ID`<br/>`AZURE_CLIENT_SECRET` | Server-side Only | Azure App Registration with `Calendars.ReadWrite` permissions. |
| **Twilio / Telnyx** | Voice Telephony & SMS delivery | `TWILIO_ACCOUNT_SID`<br/>`TWILIO_AUTH_TOKEN`<br/>`TWILIO_PHONE_NUMBER` | Server-side Only | Twilio Account with European leased phone numbers (+49 / +44). |
| **Deepgram** | Real-time Speech-to-Text (STT) | `DEEPGRAM_API_KEY` | Server-side Only | Deepgram API account with Nova-2 streaming credits. |
| **ElevenLabs** | Real-time Text-to-Speech (TTS) | `ELEVENLABS_API_KEY` | Server-side Only | ElevenLabs account with Flash/Turbo multilingual streaming. |
| **Resend / Postmark** | Transactional & Inbound Email | `RESEND_API_KEY`<br/>`RESEND_WEBHOOK_SECRET` | Server-side Only | Custom business domain with verified DNS (SPF, DKIM, DMARC, MX records). |
| **Vercel** | Edge hosting & serverless runtime | `APP_URL`<br/>`CRON_SECRET` | Server-side Only | Vercel Project linked to GitHub repository. |

---

## 3. Webhook Endpoints Configuration Manifest

The following webhooks must be registered in the respective external developer portals:

| Webhook Identifier | External Provider Dashboard | Target Webhook URL in StarX-Flow | Verification Method | Subscribed Events |
| :--- | :--- | :--- | :--- | :--- |
| **WhatsApp Webhook** | Meta App Dashboard → WhatsApp → Configuration | `https://starx-flow.vercel.app/api/whatsapp/webhook` | `hub.verify_token` challenge + HMAC SHA-256 | `messages`, `message_deliveries`, `message_reads` |
| **Instagram Webhook** | Meta App Dashboard → Instagram Graph API → Webhooks | `https://starx-flow.vercel.app/api/instagram/webhook` | `hub.verify_token` challenge + HMAC SHA-256 | `messages`, `messaging_postbacks`, `messaging_seen` |
| **Stripe Webhook** | Stripe Dashboard → Developers → Webhooks | `https://starx-flow.vercel.app/api/billing/webhook` | `stripe-signature` header (`<YOUR_WEBHOOK_SECRET>`) | `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted` |
| **Inbound Email** | Resend / Postmark Dashboard → Inbound Routing | `https://starx-flow.vercel.app/api/email/webhook/inbound` | `X-Webhook-Secret` header | `email.received`, `email.bounced` |
| **Twilio Voice Webhook**| Twilio Console → Phone Numbers → Active Numbers | `https://starx-flow.vercel.app/api/voice/incoming` | `X-Twilio-Signature` HMAC | `Incoming Call (Voice)`, `Call Status Changes` |
| **Google Calendar Push**| Google Cloud Console → Calendar API Webhooks | `https://starx-flow.vercel.app/api/calendar/webhook` | Channel token verification | `calendar.events.change` |

---

## 4. Production Environment Variables Template (`.env.production`)

```bash
# -----------------------------------------------------------------------------
# STARX-FLOW PRODUCTION ENVIRONMENT CONFIGURATION
# -----------------------------------------------------------------------------

# Application URLs
APP_URL="https://starx-flow.vercel.app"
NEXT_PUBLIC_APP_URL="https://starx-flow.vercel.app"

# Supabase Infrastructure (EU Frankfurt)
NEXT_PUBLIC_SUPABASE_URL="https://iotuxpcqewdzvqzncpad.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_URL="https://iotuxpcqewdzvqzncpad.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# AI Provider Gateway
GEMINI_API_KEY="AIzaSy..."
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSy..."
NVIDIA_API_KEY="nvapi-..."

# Meta Developer Platform (WhatsApp & Instagram)
META_APP_ID="123456789012345"
META_APP_SECRET="abcdef0123456789abcdef0123456789"
META_ACCESS_TOKEN="EAA..."
META_VERIFY_TOKEN="starx_meta_verify_secret_token_2026"
NEXT_PUBLIC_META_APP_ID="123456789012345"

# Stripe European Billing (€49 / €97 / €297)
STRIPE_SECRET_KEY="<YOUR_STRIPE_SECRET_KEY>"
STRIPE_WEBHOOK_SECRET="<YOUR_WEBHOOK_SECRET>"
STRIPE_PRICE_STARTER="price_starter_49_eur"
STRIPE_PRICE_PRO="price_pro_97_eur"
STRIPE_PRICE_ENTERPRISE="price_enterprise_297_eur"

# Google Calendar Integration
GOOGLE_CLIENT_ID="123456789-abcdef.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# Telephony & Real-Time Voice Gateway
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="auth_token_..."
DEEPGRAM_API_KEY="dg_..."
ELEVENLABS_API_KEY="el_..."

# Email Integration (Resend)
RESEND_API_KEY="re_..."
RESEND_INBOUND_DOMAIN="mail.starx-flow.com"

# Cron & Background Worker Secret
CRON_SECRET="starx_cron_runner_secret_key_2026"
```

