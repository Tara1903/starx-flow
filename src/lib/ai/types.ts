import type { BusinessReceptionistProfile } from './businessProfileService';

export type AgentRole =
  | 'receptionist'
  | 'sales'
  | 'support'
  | 'appointment'
  | 'order'
  | 'followup'
  | 'marketing'
  | 'analyst';

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  systemPrompt: string;
  isActive: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  permissions: string[];
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
}

export interface AIIntelligenceTrace {
  intent: string;
  providerAttempted: string[];
  latencyMs: number;
  ragChunksCount: number;
  memoriesCount: number;
  activeWorkflowsCount: number;
  crmLinked: boolean;
  contextSourcesUsed: string[];
  toolNamesUsed: string[];
  escalateReason?: string;
}

export interface AgentExecutionInput {
  userId: string;
  organizationId?: string | null;
  role: AgentRole;
  channel: 'WhatsApp' | 'Instagram' | 'SMS' | 'Web' | 'Email' | 'Messenger' | 'Sandbox';
  customerMessage: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  leadId?: string;
  conversationId?: string;
  conversationHistory?: Array<{ role: 'user' | 'ai' | 'human' | 'system'; text: string }>;
  customSystemPrompt?: string;
  customInstructions?: string;
  tone?: 'Friendly' | 'Professional' | 'Casual' | 'Urgent';
  imageUrl?: string;
  simulateProfile?: Partial<BusinessReceptionistProfile>;
  referenceTimestamp?: string;
  enableTools?: boolean;
  includeTrace?: boolean;
  actorType?: 'ai_agent' | 'staff';
}

export interface ToolExecutionRecord {
  tool: string;
  input: any;
  result: any;
}

export interface AgentExecutionResult {
  replyText: string;
  confidence: number;
  requiresHumanHandoff: boolean;
  handoffReason?: string;
  suggestedAction?: {
    type: 'create_appointment' | 'create_lead' | 'create_order' | 'human_handoff' | 'none';
    data?: Record<string, any>;
  };
  sources?: string[];
  tokensUsed?: number;
  model: string;
  provider: 'gemini' | 'nvidia' | 'fallback';
  toolExecutions?: ToolExecutionRecord[];
  trace?: AIIntelligenceTrace;
}
