# Fallback Plan

## Objective
Ensure that the transition to Meta Cloud API does not corner developers or users into an unrecoverable state if Meta API verification is delayed or fails.

## Strategy

### Development Fallback
- The legacy Baileys `whatsapp-server` is kept within the repository inside a designated `/legacy-workers` or isolated `whatsapp-server` folder.
- It is excluded from all `vercel.json` build steps and production start scripts.
- **Use Case:** Local developers who want to test the AI pipeline without going through Meta's Business Verification process can run `npm run dev:worker` to spin up the local QR code socket.

### Production Constraints
- **Production Mode:** Meta ONLY.
- The Vercel production environment will strictly use the `meta.ts` provider implementation.
- If a production user attempts to use WhatsApp, they are forced into the Embedded Signup flow. QR code endpoints are disabled in production.
