# Meta Migration Architecture Report

## Overview
This report concludes the design phase for migrating StarX OS from a local Baileys WebSocket worker to a 100% serverless Official Meta WhatsApp Cloud API architecture. 

## Files to be Created
- `src/integrations/whatsapp/provider.ts` (Provider interface)
- `src/integrations/whatsapp/baileys.ts` (Legacy provider implementation)
- `src/integrations/whatsapp/meta.ts` (Official Meta provider implementation)
- `src/integrations/whatsapp/index.ts` (Provider export factory)
- `api/whatsapp-webhook.ts` (Vercel Serverless Webhook Endpoint)
- `api/ai-processor.ts` (Vercel Serverless AI Endpoint)
- `api/process-queue.ts` (Vercel Serverless Queue Processor Endpoint)
- Supabase SQL Migration to create `inbound_messages` table and queue triggers.

## Files to be Changed
- `src/pages/setup/WhatsAppStep.tsx`: UI will change from QR Code rendering to an OAuth Embedded Signup flow.
- `src/components/IntegrationModal.tsx`: Similarly updated to remove Baileys references.
- `vercel.json`: If necessary, any routing updates for Vercel API.

## Removed Components
- `whatsapp-server/` repository folder will be deprecated. It will be removed from all production deployment scripts and strictly retained as an isolated testing tool.

## Cutover Steps
1. **Database Readiness:** Execute SQL migrations to create the `inbound_messages` table.
2. **Backend Deployment:** Deploy the new Vercel `api/` routes containing the webhook handlers.
3. **Webhook Binding:** In the Meta Business Manager, register `https://<vercel-domain>.vercel.app/api/whatsapp-webhook` as the active endpoint.
4. **Frontend Rollout:** Deploy the updated React application with the Embedded Signup UI.
5. **Connection Reset:** Mark all existing WhatsApp `connected_channels` as disconnected to prompt users to authorize via Meta.
6. **Worker Shutdown:** Terminate the local/Render `whatsapp-server` process.

## Rollback Plan
If the Meta Webhook ingestion fails or users cannot authenticate via Facebook:
1. Re-deploy the Vercel Frontend using the commit immediately preceding the UI overhaul.
2. Spin the `whatsapp-server` process back up on the local machine or Render instance.
3. Instruct users to re-scan the QR code to re-establish the Baileys socket.
4. (No database rollback is required as `connected_channels` gracefully handles both token types).
