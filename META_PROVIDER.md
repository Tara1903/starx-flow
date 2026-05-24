# Meta Cloud Provider Implementation

## Overview
The `meta.ts` provider implementation will communicate directly with the Official Meta WhatsApp Cloud API, enabling 100% serverless operation.

## Capabilities

### Embedded Signup
- Rather than scanning a QR code, the user clicks "Connect with Facebook".
- We load the Meta Business SDK (Facebook Login for Business).
- The user authenticates, selects their WhatsApp Business Account, and grants us permissions.

### Phone Registration
- Upon successful OAuth, Meta provides a `phone_number_id` and `WABA_ID`.
- We securely store these identifiers alongside the `access_token` in the Supabase `connected_channels` table.

### Webhook Verification
- Implements the `GET /api/whatsapp-webhook` standard required by Meta.
- Validates `hub.verify_token` against our stored environment variable to register the webhook URL in the Meta App Dashboard.

### Send Messages
- Uses `POST https://graph.facebook.com/v18.0/{phone_number_id}/messages`.
- Injects the Bearer `access_token` retrieved from the user's `connected_channels` record.

### Receive Messages
- Standardizes incoming Meta webhook payloads.
- Normalizes the `text.body` and `from` fields into a unified format that the `ai-processor` can consume.

### Status Updates
- Checks the `connected_channels` table for the presence of valid Meta credentials.
- Can optionally ping the Graph API to verify token freshness.
