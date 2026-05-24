# WhatsApp Provider Layer Architecture

## Objective
Abstract the WhatsApp integration so the core application logic and UI are unaware of the underlying connection method (Baileys vs. Meta Cloud API). This allows for incremental migration and seamless fallback mechanisms.

## Directory Structure
`src/integrations/whatsapp/`
- `provider.ts`: Defines the abstract interface that all WhatsApp providers must implement.
- `baileys.ts`: Implementation of the provider using the legacy local Baileys worker.
- `meta.ts`: Implementation of the provider using the Official Meta WhatsApp Cloud API.
- `index.ts`: Factory to export the active provider based on environment configuration.

## Abstract Interface (`provider.ts`)
```typescript
export interface WhatsAppProvider {
  /** Initialize connection to the WhatsApp service */
  connect(userId: string, credentials?: Record<string, any>): Promise<{ success: boolean; data?: any }>;
  
  /** Disconnect the active WhatsApp session */
  disconnect(userId: string): Promise<boolean>;
  
  /** Send a text message to a target phone number */
  send(userId: string, toPhone: string, message: string): Promise<boolean>;
  
  /** Webhook/Event handler for incoming messages */
  receive(payload: any): Promise<void>;
  
  /** Check the active connection status */
  status(userId: string): Promise<'connected' | 'disconnected' | 'connecting' | 'error'>;
}
```

## Implementation Strategy
1. **`baileys.ts`**: Will wrap the existing `fetch('http://localhost:10000/api/whatsapp/connect')` logic.
2. **`meta.ts`**: Will use the Meta Graph API for `send()` and trigger OAuth/Embedded Signup for `connect()`.
3. The UI components (like `WhatsAppStep.tsx`) will be refactored to call `WhatsApp.connect()` without knowing if it renders a QR code or an Embedded Signup modal.
