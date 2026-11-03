/**
 * StarX-Flow Instagram Integration Types (WS-08)
 * Meta Graph API messaging schemas and webhook structures.
 */

export interface InstagramMessagePayload {
  organizationId: string;
  recipientIgsid: string; // Instagram Scoped ID
  text: string;
  messageTag?: 'CONFIRMED_EVENT_UPDATE' | 'POST_PURCHASE_UPDATE' | 'ACCOUNT_UPDATE' | 'HUMAN_AGENT';
  conversationId?: string;
  leadId?: string;
  isInternal?: boolean; // Must be false; internal notes rejected
}

export interface InstagramSendResult {
  success: boolean;
  messageId: string;
  recipientId: string;
  recipientIgsid?: string;
  error?: string;
  timestamp: string;
}

export interface MetaWebhookPayload {
  object: 'instagram' | 'page';
  entry: Array<{
    id: string;
    time: number;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        attachments?: Array<{
          type: 'image' | 'video' | 'audio' | 'file';
          payload: { url: string };
        }>;
        quick_reply?: { payload: string };
        is_echo?: boolean;
      };
      read?: { watermark: number };
      delivery?: { mids: string[]; watermark: number };
    }>;
  }>;
}
