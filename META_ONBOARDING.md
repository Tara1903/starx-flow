# Meta Onboarding Architecture

## Objective
Replace the archaic QR Code scanning mechanism (Baileys) with the seamless, official Meta Embedded Signup flow.

## Embedded Signup Flow

### 1. Connect WhatsApp
- **UI Element:** `WhatsAppStep.tsx` displays a "Connect with Facebook" button.
- **Action:** Clicking the button launches the Facebook Login SDK popup configured with `config_id` for WhatsApp Embedded Signup.

### 2. Authorize
- The user logs into Facebook.
- They are prompted to select their existing WhatsApp Business Account or create a new one.
- They grant the StarX application permission to manage their messages.

### 3. Verify
- The SDK returns an OAuth callback containing an `access_token` and `phone_number_id`.
- The frontend securely sends these tokens to the StarX backend (`POST /api/whatsapp-config`).
- The backend verifies the token with Meta Graph API and confirms the number is active.

### 4. Ready
- The backend writes the verified `access_token`, `phone_number_id`, and `WABA_ID` into the user's `connected_channels` table.
- The UI reflects the "Connected" state, displaying the phone number to the user.
