import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { isValidUuid, lookupExistingOrganizationId } from '../crm/organizationHelper';
import { BusinessProfileService, BusinessReceptionistProfile } from '../ai/businessProfileService';

export interface WorkflowStepNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  nodeType: string;
  properties?: Record<string, any>;
}

export interface WorkflowEvaluationInput {
  userId: string;
  organizationId?: string | null;
  channel: string;
  messageText: string;
  conversationId?: string;
  leadId?: string | null;
  senderName?: string;
  isNewLead?: boolean;
  referenceTimestamp?: string;
}

export interface WorkflowEvaluationOutcome {
  matchedWorkflowIds: string[];
  matchedWorkflowNames: string[];
  promptDirectives: string[];
  executedActions: Array<{ workflowId: string; action: string; detail: string }>;
  shouldNotifyHuman: boolean;
}

const NEGATIVE_SENTIMENT_RE = /\b(angry|refund|terrible|worst|lawsuit|complaint|ruined|unacceptable|broken|scam|furious)\b/i;
const POSITIVE_SENTIMENT_RE = /\b(thank|thanks|awesome|great|love|amazing|helpful|wonderful|book)\b/i;

function evaluateSentimentLabel(text: string): 'Negative' | 'Positive' | 'Neutral' {
  if (NEGATIVE_SENTIMENT_RE.test(text)) return 'Negative';
  if (POSITIVE_SENTIMENT_RE.test(text)) return 'Positive';
  return 'Neutral';
}

function stepConditionPasses(
  step: WorkflowStepNode,
  ctx: {
    messageText: string;
    isNewLead: boolean;
    businessProfile: BusinessReceptionistProfile;
    referenceDate: Date;
  }
): boolean {
  const props = step.properties || {};

  switch (step.nodeType) {
    case 'keyword_match': {
      const raw = String(props.keywords || '').trim();
      if (!raw) return true;
      const keywords = raw
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
      if (keywords.length === 0) return true;
      const lowerMsg = ctx.messageText.toLowerCase();
      return keywords.some((kw) => lowerMsg.includes(kw));
    }

    case 'outside_hours': {
      const status = BusinessProfileService.isWithinBusinessHours(ctx.businessProfile, ctx.referenceDate);
      return !status.isOpen;
    }

    case 'new_customer': {
      if (props.strictMode) {
        return ctx.isNewLead;
      }
      return true;
    }

    case 'sentiment_check': {
      const target = String(props.sentiment || 'Negative');
      return evaluateSentimentLabel(ctx.messageText) === target;
    }

    default:
      return true;
  }
}

export class WorkflowExecutionEngine {
  /**
   * Evaluates active workflows for an inbound event, runs step conditions and side-effect actions
   * (create_task, update_lead, notify_team, send_message), and logs execution metrics.
   */
  static async evaluateInbound(input: WorkflowEvaluationInput): Promise<WorkflowEvaluationOutcome> {
    const empty: WorkflowEvaluationOutcome = {
      matchedWorkflowIds: [],
      matchedWorkflowNames: [],
      promptDirectives: [],
      executedActions: [],
      shouldNotifyHuman: false,
    };

    if (!isSupabaseAdminConfigured || (!isValidUuid(input.userId) && !isValidUuid(input.organizationId))) {
      return empty;
    }

    try {
      const orgId =
        (await lookupExistingOrganizationId(input.userId, input.organizationId)) ||
        (isValidUuid(input.organizationId) ? input.organizationId : null);

      const scopeFilter =
        orgId && isValidUuid(input.userId) && orgId !== input.userId
          ? `organization_id.eq.${orgId},user_id.eq.${input.userId}`
          : orgId
            ? `organization_id.eq.${orgId},user_id.eq.${orgId}`
            : `user_id.eq.${input.userId}`;

      const { data: workflows } = await supabaseAdmin
        .from('workflows')
        .select('id, name, channel, trigger, action, custom_prompt, config')
        .or(scopeFilter)
        .eq('is_active', true)
        .limit(20);

      if (!workflows || workflows.length === 0) {
        return empty;
      }

      const normalizedChannel = input.channel.toLowerCase();
      const matchingByChannel = workflows.filter((w: any) => {
        const wfCh = String(w.channel || '').toLowerCase();
        return !wfCh || wfCh === normalizedChannel || wfCh === 'all';
      });

      if (matchingByChannel.length === 0) {
        return empty;
      }

      const referenceDate =
        input.referenceTimestamp && !Number.isNaN(Date.parse(input.referenceTimestamp))
          ? new Date(input.referenceTimestamp)
          : new Date();
      const businessProfile = await BusinessProfileService.getProfile(orgId || input.userId, input.userId);

      const outcome: WorkflowEvaluationOutcome = {
        matchedWorkflowIds: [],
        matchedWorkflowNames: [],
        promptDirectives: [],
        executedActions: [],
        shouldNotifyHuman: false,
      };

      for (const wf of matchingByChannel as any[]) {
        const rawSteps: WorkflowStepNode[] = Array.isArray(wf.config?.steps) ? wf.config.steps : [];
        const conditionSteps = rawSteps.filter((s) => s.type === 'condition');
        const allConditionsPass = conditionSteps.every((cond) =>
          stepConditionPasses(cond, {
            messageText: input.messageText,
            isNewLead: Boolean(input.isNewLead),
            businessProfile,
            referenceDate,
          })
        );

        if (!allConditionsPass) continue;

        outcome.matchedWorkflowIds.push(wf.id);
        outcome.matchedWorkflowNames.push(wf.name);

        if (wf.custom_prompt && String(wf.custom_prompt).trim()) {
          outcome.promptDirectives.push(`[Workflow "${wf.name}"]: ${String(wf.custom_prompt).trim()}`);
        }

        const actionSteps = rawSteps.filter((s) => s.type === 'action');
        for (const act of actionSteps) {
          const props = act.properties || {};

          if (act.nodeType === 'send_message' && props.message) {
            outcome.promptDirectives.push(
              `[Workflow "${wf.name}" response rule]: ${String(props.message).trim()}`
            );
            outcome.executedActions.push({
              workflowId: wf.id,
              action: 'send_message',
              detail: String(props.message).slice(0, 120),
            });
          } else if (act.nodeType === 'create_task' && isValidUuid(input.userId)) {
            const title = String(props.title || `${wf.name}: Follow up with ${input.senderName || 'Customer'}`).slice(0, 140);
            const description = String(
              props.description || `Triggered by ${input.channel} message: "${input.messageText.slice(0, 180)}"`
            );
            await supabaseAdmin.from('tasks').insert({
              user_id: input.userId,
              ...(isValidUuid(input.leadId) ? { lead_id: input.leadId } : {}),
              title,
              description,
              priority: 'medium',
              status: 'todo',
            });
            outcome.executedActions.push({
              workflowId: wf.id,
              action: 'create_task',
              detail: title,
            });
          } else if (act.nodeType === 'notify_team') {
            outcome.shouldNotifyHuman = true;
            if (isValidUuid(input.userId)) {
              const title = `Team Alert (${String(props.priority || 'High')}): ${wf.name}`;
              await supabaseAdmin.from('tasks').insert({
                user_id: input.userId,
                ...(isValidUuid(input.leadId) ? { lead_id: input.leadId } : {}),
                title,
                description: `${input.senderName || 'Visitor'} on ${input.channel}: ${input.messageText.slice(0, 180)}`,
                priority: String(props.priority || '').toLowerCase() === 'high' ? 'high' : 'medium',
                status: 'todo',
              });
            }
            outcome.executedActions.push({
              workflowId: wf.id,
              action: 'notify_team',
              detail: String(props.channel || 'Operations'),
            });
          } else if (
            act.nodeType === 'update_lead' &&
            isValidUuid(input.leadId) &&
            ['new', 'contacted', 'qualified', 'converted', 'lost'].includes(String(props.status || ''))
          ) {
            const nextStatus = String(props.status);
            await supabaseAdmin
              .from('leads')
              .update({ status: nextStatus, updated_at: new Date().toISOString() })
              .eq('id', input.leadId);
            if (isValidUuid(orgId)) {
              await supabaseAdmin.from('crm_activities').insert({
                organization_id: orgId,
                lead_id: input.leadId,
                activity_type: 'stage_change',
                title: `Workflow "${wf.name}" updated lead status to ${nextStatus}`,
                metadata: { workflow_id: wf.id, status: nextStatus },
              });
            }
            outcome.executedActions.push({
              workflowId: wf.id,
              action: 'update_lead',
              detail: nextStatus,
            });
          }
        }

        // Persist workflow execution telemetry & stats non-blockingly
        if (isValidUuid(wf.id)) {
          try {
            await supabaseAdmin.rpc('increment_workflow_stats', { wf_id: wf.id, hours: 0.1 });
          } catch {
            // Non-blocking stats counter
          }

          if (isValidUuid(orgId)) {
            await supabaseAdmin.from('workflow_executions').insert({
              organization_id: orgId,
              workflow_id: wf.id,
              trigger_event: `${input.channel}:${wf.trigger || 'inbound_message'}`,
              status: 'completed',
              context: {
                conversationId: input.conversationId || null,
                leadId: input.leadId || null,
                actionsCount: actionSteps.length,
              },
              completed_at: new Date().toISOString(),
            });
          }
        }
      }

      return outcome;
    } catch (err) {
      console.warn('[WorkflowExecutionEngine] Non-fatal evaluation warning:', err);
      return empty;
    }
  }
}
