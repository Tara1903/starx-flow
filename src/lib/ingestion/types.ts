/**
 * StarX-Flow Shared Ingestion Gateway Types
 * Channel-independent canonical message interfaces and normalization models.
 */

export type IngestionChannel = 'whatsapp' | 'web' | 'email' | 'instagram' | 'messenger' | 'phone' | 'sms';

export interface CanonicalSender {
  name: string;
  identifier: string; // E.164 phone number, email address, or web session ID
  phone?: string | null;
  email?: string | null;
  externalUserId?: string | null; // Platform-scoped ID (e.g. WhatsApp WAID, Instagram Scoped ID)
  metadata?: Record<string, any>;
}

export interface CanonicalAttachment {
  type: 'image' | 'audio' | 'document' | 'video' | 'location';
  url: string;
  mimeType?: string;
  fileName?: string;
  fileSizeBytes?: number;
}

export interface CanonicalMessagePayload {
  messageId: string;
  text: string;
  timestamp: string; // ISO 8601
  attachments?: CanonicalAttachment[];
  rawPayload?: any;
}

export interface CanonicalInboundEvent {
  eventId: string;
  channel: IngestionChannel;
  organizationId?: string | null;
  userId?: string | null;
  sender: CanonicalSender;
  message: CanonicalMessagePayload;
  metadata?: Record<string, any>;
  receivedAt: string;
}

export interface IngestionResult {
  success: boolean;
  status: 'processed' | 'duplicate' | 'ignored' | 'error';
  eventId: string;
  channel: IngestionChannel;
  organizationId?: string | null;
  conversationId?: string;
  leadId?: string;
  replyText?: string;
  requiresHumanHandoff?: boolean;
  error?: string;
  processingTimeMs: number;
}

export interface ChannelAdapter<TRaw = any> {
  readonly channel: IngestionChannel;
  authenticate(request: Request, rawBody: string): Promise<{ authorized: boolean; reason?: string }>;
  normalize(rawPayload: TRaw, options?: { organizationId?: string; userId?: string }): Promise<CanonicalInboundEvent | null>;
}

export interface GatewayHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptimeSeconds: number;
  eventsProcessedTotal: number;
  duplicateEventsDropped: number;
  averageLatencyMs: number;
  lastEventProcessedAt: string | null;
  channels: Record<IngestionChannel, { active: boolean; lastReceivedAt: string | null; errorCount: number }>;
}
