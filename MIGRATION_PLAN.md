# Data Migration Plan

## Objective
Ensure zero data loss and strict preservation of existing conversations, customer profiles, messages, and bookings during the switch from Baileys to Meta Cloud API.

## Preservation Strategy

### 1. Conversations & Messages
- **Current State:** The system tracks conversations based on the phone number.
- **Migration:** Meta also uses E.164 formatted phone numbers (e.g., `15551234567`). Existing conversation threads in the database will automatically map to the incoming Webhook payloads because the `from` phone number string matches identically. No database mutation is required for historic messages.

### 2. Customers
- Customer records are uniquely identified by phone numbers in the `customers` table.
- Meta Webhooks provide the customer's phone number exactly as Baileys did.
- Existing customers will simply seamlessly continue their workflows without noticing a backend transition.

### 3. Bookings
- Bookings are attached to `customer_id`. Since the customer identity remains stable via phone number matching, all calendar and booking references remain 100% intact.

### 4. Credential Migration (`connected_channels`)
- Users who previously connected via Baileys (QR Code) will have their `connected_channels` state reset for WhatsApp to prompt them to use the new Embedded Signup flow.
- A one-time script will set `is_connected = false` and clear `credentials` for the `channel_key = 'WhatsApp'` across all users, notifying them in the UI to Re-Authenticate using Meta.
