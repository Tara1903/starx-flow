# Deployment & Validation Plan

## Objective
Ensure a smooth, zero-downtime cutover from the local worker architecture to the Vercel Serverless environment.

## Validation Steps

### 1. Laptop OFF Check
- **Test:** Terminate all local node processes (`whatsapp-server`). Close the laptop.
- **Pass Condition:** The system remains 100% operational in the cloud.

### 2. Frontend Works Check
- **Test:** Navigate to the `/setup/whatsapp` route.
- **Pass Condition:** The Embedded Signup button appears instead of the QR Code loader. The OAuth flow completes successfully and updates the Supabase database.

### 3. Messages Receive Check
- **Test:** Send a text message from a personal phone to the connected WhatsApp Business number.
- **Pass Condition:** Meta hits the `https://<vercel-domain>.vercel.app/api/whatsapp-webhook` endpoint. The message successfully lands in the `inbound_messages` Supabase table.

### 4. Messages Send Check
- **Test:** Trigger the AI processor via cron or database webhook.
- **Pass Condition:** The AI resolves the response and successfully invokes the `send()` method of the Meta Provider, and the message arrives on the personal phone within seconds.
