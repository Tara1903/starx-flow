-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'enriched', 'email_generated', 'queued', 'sent', 'delivered', 'opened', 'replied', 'interested', 'not_interested', 'meeting_booked', 'closed', 'bounced', 'unsubscribed');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('csv_import', 'manual', 'google_maps', 'website_scrape', 'instagram', 'linkedin', 'referral', 'api');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('pending', 'sending', 'sent', 'failed', 'bounced', 'replied');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "ReplyIntent" AS ENUM ('interested', 'not_interested', 'pricing_inquiry', 'meeting_request', 'unclear', 'out_of_office', 'unsubscribe');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('email', 'whatsapp', 'instagram');

-- CreateEnum
CREATE TYPE "ChannelConnectionStatus" AS ENUM ('disconnected', 'connecting', 'connected', 'error');

-- CreateEnum
CREATE TYPE "ChannelAccountStatus" AS ENUM ('active', 'inactive', 'error', 'connecting');

-- CreateEnum
CREATE TYPE "DiscoveryRunStatus" AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('lead', 'prospect', 'customer', 'churned', 'inactive');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('active', 'archived', 'spam', 'blocked');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('contact', 'user', 'ai', 'system');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'video', 'audio', 'document', 'template', 'reaction');

-- CreateEnum
CREATE TYPE "AutomationTriggerType" AS ENUM ('workflow', 'schedule', 'webhook', 'manual', 'message_received', 'keyword_match', 'new_contact', 'no_response', 'intent_detected');

-- CreateEnum
CREATE TYPE "AutomationActionType" AS ENUM ('send_message', 'add_tag', 'remove_tag', 'assign_user', 'update_status', 'notify_team', 'ai_reply', 'delay', 'run_workflow');

-- CreateTable
CREATE TABLE "outreach_channel_accounts" (
    "id" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "label" TEXT NOT NULL,
    "status" "ChannelAccountStatus" NOT NULL DEFAULT 'inactive',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "credentials_encrypted" TEXT,
    "metadata" JSONB,
    "last_synced_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_channel_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_discovery_runs" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "source_type" TEXT NOT NULL DEFAULT 'google_maps',
    "status" "DiscoveryRunStatus" NOT NULL DEFAULT 'pending',
    "imported_count" INTEGER NOT NULL DEFAULT 0,
    "deduplicated_count" INTEGER NOT NULL DEFAULT 0,
    "rejected_count" INTEGER NOT NULL DEFAULT 0,
    "workflow_execution_id" TEXT,
    "error_message" TEXT,
    "metadata" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_discovery_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_leads" (
    "id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "niche" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "source" "LeadSource" NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "social_media" JSONB,
    "enrichment_data" JSONB,
    "campaign_id" TEXT,
    "discovery_run_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "template_subject" TEXT,
    "template_body" TEXT,
    "prompt_instructions" TEXT,
    "schedule_cron" TEXT,
    "daily_limit" INTEGER NOT NULL DEFAULT 50,
    "delay_min_ms" INTEGER NOT NULL DEFAULT 60000,
    "delay_max_ms" INTEGER NOT NULL DEFAULT 300000,
    "channel_account_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_sent_emails" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "replied_at" TIMESTAMP(3),
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "message_id" TEXT,
    "lead_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "channel_account_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_sent_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_replies" (
    "id" TEXT NOT NULL,
    "from_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "intent" "ReplyIntent" NOT NULL DEFAULT 'unclear',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ai_suggested_follow_up" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_email_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "analyzed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_ai_generations" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "generated_subject" TEXT NOT NULL,
    "generated_body" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "latency_ms" INTEGER,
    "error_message" TEXT,
    "quality_score" DOUBLE PRECISION,
    "lead_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_ai_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "level" TEXT NOT NULL DEFAULT 'info',
    "source" TEXT,
    "message" TEXT,
    "user_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_contacts" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp_number" TEXT,
    "instagram_username" TEXT,
    "avatar_url" TEXT,
    "company" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "lead_score" INTEGER NOT NULL DEFAULT 0,
    "status" "ContactStatus" NOT NULL DEFAULT 'lead',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "last_interaction_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_channel_connections" (
    "id" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "status" "ChannelConnectionStatus" NOT NULL DEFAULT 'disconnected',
    "account_label" TEXT,
    "external_account_id" TEXT,
    "webhook_url" TEXT,
    "qr_code_data" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "last_error" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_channel_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_conversations" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'active',
    "subject" TEXT,
    "external_thread_id" TEXT,
    "last_message_at" TIMESTAMP(3) NOT NULL,
    "last_message_preview" TEXT NOT NULL,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "is_ai_enabled" BOOLEAN NOT NULL DEFAULT false,
    "assigned_user_id" TEXT,
    "ai_summary" TEXT,
    "metadata" JSONB,
    "channel_account_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_conversation_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "sender_type" "MessageSenderType" NOT NULL,
    "sender_id" TEXT,
    "content" TEXT NOT NULL,
    "message_type" "MessageType" NOT NULL DEFAULT 'text',
    "status" "MessageStatus" NOT NULL DEFAULT 'sent',
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "ai_confidence" DOUBLE PRECISION,
    "external_message_id" TEXT,
    "reply_to_id" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_automation_rules" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "channel" "ChannelType",
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "trigger_type" "AutomationTriggerType",
    "action_type" "AutomationActionType",
    "execution_count" INTEGER NOT NULL DEFAULT 0,
    "last_executed_at" TIMESTAMP(3),
    "last_error" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outreach_channel_accounts_channel_idx" ON "outreach_channel_accounts"("channel");

-- CreateIndex
CREATE INDEX "outreach_channel_accounts_status_idx" ON "outreach_channel_accounts"("status");

-- CreateIndex
CREATE INDEX "outreach_channel_accounts_is_default_idx" ON "outreach_channel_accounts"("is_default");

-- CreateIndex
CREATE INDEX "outreach_discovery_runs_status_idx" ON "outreach_discovery_runs"("status");

-- CreateIndex
CREATE INDEX "outreach_discovery_runs_created_at_idx" ON "outreach_discovery_runs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_leads_email_key" ON "outreach_leads"("email");

-- CreateIndex
CREATE INDEX "outreach_leads_status_idx" ON "outreach_leads"("status");

-- CreateIndex
CREATE INDEX "outreach_leads_niche_idx" ON "outreach_leads"("niche");

-- CreateIndex
CREATE INDEX "outreach_leads_campaign_id_idx" ON "outreach_leads"("campaign_id");

-- CreateIndex
CREATE INDEX "outreach_leads_email_idx" ON "outreach_leads"("email");

-- CreateIndex
CREATE INDEX "outreach_leads_discovery_run_id_idx" ON "outreach_leads"("discovery_run_id");

-- CreateIndex
CREATE INDEX "outreach_campaigns_channel_account_id_idx" ON "outreach_campaigns"("channel_account_id");

-- CreateIndex
CREATE INDEX "outreach_sent_emails_status_idx" ON "outreach_sent_emails"("status");

-- CreateIndex
CREATE INDEX "outreach_sent_emails_lead_id_idx" ON "outreach_sent_emails"("lead_id");

-- CreateIndex
CREATE INDEX "outreach_sent_emails_campaign_id_idx" ON "outreach_sent_emails"("campaign_id");

-- CreateIndex
CREATE INDEX "outreach_sent_emails_sent_at_idx" ON "outreach_sent_emails"("sent_at");

-- CreateIndex
CREATE INDEX "outreach_sent_emails_channel_account_id_idx" ON "outreach_sent_emails"("channel_account_id");

-- CreateIndex
CREATE INDEX "outreach_replies_intent_idx" ON "outreach_replies"("intent");

-- CreateIndex
CREATE INDEX "outreach_replies_lead_id_idx" ON "outreach_replies"("lead_id");

-- CreateIndex
CREATE INDEX "outreach_replies_is_read_idx" ON "outreach_replies"("is_read");

-- CreateIndex
CREATE INDEX "outreach_ai_generations_lead_id_idx" ON "outreach_ai_generations"("lead_id");

-- CreateIndex
CREATE INDEX "outreach_ai_generations_approved_idx" ON "outreach_ai_generations"("approved");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_settings_key_key" ON "outreach_settings"("key");

-- CreateIndex
CREATE INDEX "outreach_settings_category_idx" ON "outreach_settings"("category");

-- CreateIndex
CREATE INDEX "outreach_audit_logs_action_idx" ON "outreach_audit_logs"("action");

-- CreateIndex
CREATE INDEX "outreach_audit_logs_entity_type_idx" ON "outreach_audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "outreach_audit_logs_created_at_idx" ON "outreach_audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_contacts_lead_id_key" ON "outreach_contacts"("lead_id");

-- CreateIndex
CREATE INDEX "outreach_contacts_email_idx" ON "outreach_contacts"("email");

-- CreateIndex
CREATE INDEX "outreach_contacts_whatsapp_number_idx" ON "outreach_contacts"("whatsapp_number");

-- CreateIndex
CREATE INDEX "outreach_contacts_instagram_username_idx" ON "outreach_contacts"("instagram_username");

-- CreateIndex
CREATE INDEX "outreach_contacts_status_idx" ON "outreach_contacts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_channel_connections_channel_key" ON "outreach_channel_connections"("channel");

-- CreateIndex
CREATE INDEX "outreach_channel_connections_status_idx" ON "outreach_channel_connections"("status");

-- CreateIndex
CREATE INDEX "outreach_conversations_contact_id_idx" ON "outreach_conversations"("contact_id");

-- CreateIndex
CREATE INDEX "outreach_conversations_channel_idx" ON "outreach_conversations"("channel");

-- CreateIndex
CREATE INDEX "outreach_conversations_status_idx" ON "outreach_conversations"("status");

-- CreateIndex
CREATE INDEX "outreach_conversations_last_message_at_idx" ON "outreach_conversations"("last_message_at");

-- CreateIndex
CREATE INDEX "outreach_conversations_channel_account_id_idx" ON "outreach_conversations"("channel_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_conversations_channel_external_thread_id_key" ON "outreach_conversations"("channel", "external_thread_id");

-- CreateIndex
CREATE INDEX "outreach_conversation_messages_conversation_id_idx" ON "outreach_conversation_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "outreach_conversation_messages_channel_idx" ON "outreach_conversation_messages"("channel");

-- CreateIndex
CREATE INDEX "outreach_conversation_messages_timestamp_idx" ON "outreach_conversation_messages"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_conversation_messages_channel_external_message_id_key" ON "outreach_conversation_messages"("channel", "external_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_automation_rules_workflow_id_key" ON "outreach_automation_rules"("workflow_id");

-- CreateIndex
CREATE INDEX "outreach_automation_rules_channel_idx" ON "outreach_automation_rules"("channel");

-- CreateIndex
CREATE INDEX "outreach_automation_rules_is_active_idx" ON "outreach_automation_rules"("is_active");

-- AddForeignKey
ALTER TABLE "outreach_leads" ADD CONSTRAINT "outreach_leads_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "outreach_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_leads" ADD CONSTRAINT "outreach_leads_discovery_run_id_fkey" FOREIGN KEY ("discovery_run_id") REFERENCES "outreach_discovery_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_campaigns" ADD CONSTRAINT "outreach_campaigns_channel_account_id_fkey" FOREIGN KEY ("channel_account_id") REFERENCES "outreach_channel_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_sent_emails" ADD CONSTRAINT "outreach_sent_emails_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "outreach_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_sent_emails" ADD CONSTRAINT "outreach_sent_emails_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "outreach_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_sent_emails" ADD CONSTRAINT "outreach_sent_emails_channel_account_id_fkey" FOREIGN KEY ("channel_account_id") REFERENCES "outreach_channel_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_replies" ADD CONSTRAINT "outreach_replies_sent_email_id_fkey" FOREIGN KEY ("sent_email_id") REFERENCES "outreach_sent_emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_replies" ADD CONSTRAINT "outreach_replies_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "outreach_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_ai_generations" ADD CONSTRAINT "outreach_ai_generations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "outreach_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_ai_generations" ADD CONSTRAINT "outreach_ai_generations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "outreach_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_contacts" ADD CONSTRAINT "outreach_contacts_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "outreach_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_conversations" ADD CONSTRAINT "outreach_conversations_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "outreach_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_conversations" ADD CONSTRAINT "outreach_conversations_channel_account_id_fkey" FOREIGN KEY ("channel_account_id") REFERENCES "outreach_channel_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_conversation_messages" ADD CONSTRAINT "outreach_conversation_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "outreach_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_conversation_messages" ADD CONSTRAINT "outreach_conversation_messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "outreach_conversation_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

