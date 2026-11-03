/**
 * StarX-Flow Resend Email Integration Types (WS-07)
 */

export interface OutboundEmailOptions {
  organizationId: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string; // Optional custom sender, defaults to org verified sender
  replyTo?: string;
  inReplyTo?: string;
  references?: string[];
  conversationId?: string;
  leadId?: string;
  tags?: Array<{ name: string; value: string }>;
  isInternal?: boolean; // Must be false; internal notes rejected
  idempotencyKey?: string; // Stable idempotency key sent to Resend (Idempotency-Key header)
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId: string;
  providerId?: string;
  error?: string;
  status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'failed';
  timestamp: string;
}

export interface InboundEmailPayload {
  from: string;
  to: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
    size?: number;
  }>;
}

export interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.complained' | 'email.bounced' | 'email.inbound';
  created_at: string;
  data: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    html?: string;
    text?: string;
    headers?: Record<string, string>;
    message_id?: string;
    in_reply_to?: string;
    references?: string[];
    bounce?: {
      message?: string;
      type?: string;
    };
  };
}
