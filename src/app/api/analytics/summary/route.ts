import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { isValidUuid, lookupExistingOrganizationId } from '@/lib/crm/organizationHelper';
import { apiErrorResponse, internalErrorResponse } from '@/lib/security/apiError';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const userId = auth.session.user.id;
    const rawOrg = auth.session.organizationId || userId;
    const emptyResponse = {
      success: true,
      aiTelemetry: {
        totalRuns: 0,
        avgLatencyMs: 0,
        ragHitRatePct: 0,
        handoffRatePct: 0,
        crmLinkedRatePct: 0,
        providers: {} as Record<string, number>,
        topTools: [] as Array<{ tool: string; count: number }>,
        dailyRuns: [] as Array<{ date: string; count: number }>,
        recentTraces: [] as any[],
      },
      operations: {
        workflowsTotal: 0,
        workflowsActive: 0,
        totalWorkflowRuns: 0,
        openTasks: 0,
        jobsPending: 0,
        jobsCompleted: 0,
        jobsFailed: 0,
        activeSequenceEnrollments: 0,
      },
      revenueAndCrm: {
        totalLeads: 0,
        qualifiedLeads: 0,
        pipelineValueEur: 0,
        wonRevenueEur: 0,
        ordersRevenueEur: 0,
        upcomingBookings: 0,
      },
      recentLogs: [] as Array<{
        id: string;
        time: string;
        module: string;
        message: string;
        type: 'success' | 'info' | 'warning';
      }>,
    };

    if (!isSupabaseAdminConfigured || (!isValidUuid(userId) && !isValidUuid(rawOrg))) {
      return NextResponse.json(emptyResponse);
    }

    const resolvedOrg = (await lookupExistingOrganizationId(userId, rawOrg)) || (isValidUuid(rawOrg) ? rawOrg : null);
    const scopeFilter =
      resolvedOrg && isValidUuid(userId) && resolvedOrg !== userId
        ? `organization_id.eq.${resolvedOrg},user_id.eq.${userId}`
        : resolvedOrg
          ? `organization_id.eq.${resolvedOrg},user_id.eq.${resolvedOrg}`
          : `user_id.eq.${userId}`;

    const since30d = new Date(Date.now() - 30 * 86400000).toISOString();

    const [
      tracesRes,
      workflowsRes,
      leadsRes,
      dealsRes,
      ordersRes,
      apptsRes,
      tasksRes,
      jobsRes,
      enrollRes,
      execLogsRes,
    ] = await Promise.all([
      resolvedOrg
        ? supabaseAdmin
            .from('ai_intelligence_traces')
            .select('id, channel, provider, model, intent, rag_chunks_count, memories_count, crm_linked, tool_names_used, requires_handoff, latency_ms, created_at')
            .eq('organization_id', resolvedOrg)
            .gte('created_at', since30d)
            .order('created_at', { ascending: false })
            .limit(200)
        : Promise.resolve({ data: [] }),
      supabaseAdmin.from('workflows').select('id, is_active, executions_count').or(scopeFilter),
      supabaseAdmin.from('leads').select('id, status').or(scopeFilter),
      resolvedOrg
        ? supabaseAdmin.from('crm_deals').select('id, value, status').eq('organization_id', resolvedOrg)
        : Promise.resolve({ data: [] }),
      supabaseAdmin.from('orders').select('total_amount, payment_status').or(scopeFilter),
      supabaseAdmin.from('appointments').select('id, status').or(scopeFilter).in('status', ['scheduled', 'confirmed']),
      supabaseAdmin.from('tasks').select('id, status').eq('user_id', userId).neq('status', 'completed'),
      resolvedOrg
        ? supabaseAdmin.from('receptionist_jobs').select('id, status').eq('organization_id', resolvedOrg).limit(200)
        : Promise.resolve({ data: [] }),
      resolvedOrg
        ? supabaseAdmin.from('crm_sequence_enrollments').select('id, status').eq('organization_id', resolvedOrg).eq('status', 'active')
        : Promise.resolve({ data: [] }),
      isValidUuid(userId)
        ? supabaseAdmin
            .from('execution_logs')
            .select('id, type, channel, message, timestamp')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(30)
        : Promise.resolve({ data: [] }),
    ]);

    const traces = (tracesRes.data || []) as any[];
    const totalRuns = traces.length;
    const avgLatencyMs =
      totalRuns > 0
        ? Math.round(traces.reduce((acc, t) => acc + (Number(t.latency_ms) || 0), 0) / totalRuns)
        : 0;
    const ragHitRatePct =
      totalRuns > 0
        ? Math.round((traces.filter((t) => Number(t.rag_chunks_count || 0) > 0).length / totalRuns) * 100)
        : 0;
    const handoffRatePct =
      totalRuns > 0
        ? Math.round((traces.filter((t) => Boolean(t.requires_handoff)).length / totalRuns) * 100)
        : 0;
    const crmLinkedRatePct =
      totalRuns > 0
        ? Math.round((traces.filter((t) => Boolean(t.crm_linked)).length / totalRuns) * 100)
        : 0;

    const providers: Record<string, number> = {};
    const toolMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      dailyMap.set(d, 0);
    }

    for (const t of traces) {
      const p = String(t.provider || 'unknown');
      providers[p] = (providers[p] || 0) + 1;
      for (const tool of (t.tool_names_used as string[]) || []) {
        toolMap.set(tool, (toolMap.get(tool) || 0) + 1);
      }
      const dayKey = String(t.created_at || '').slice(0, 10);
      if (dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
      }
    }

    const topTools = Array.from(toolMap.entries())
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const wfs = (workflowsRes.data || []) as any[];
    const leads = (leadsRes.data || []) as any[];
    const deals = (dealsRes.data || []) as any[];
    const orders = (ordersRes.data || []) as any[];
    const jobs = (jobsRes.data || []) as any[];

    const openDeals = deals.filter((d) => d.status === 'open');
    const wonDeals = deals.filter((d) => d.status === 'won');
    const paidOrders = orders.filter((o) => o.payment_status === 'paid');

    const recentLogs = [
      ...((execLogsRes.data || []) as any[]).map((row) => ({
        id: `exec-${row.id}`,
        time: new Date(row.timestamp || Date.now()).toLocaleTimeString([], { hour12: false }),
        sortTs: new Date(row.timestamp || Date.now()).getTime(),
        module: row.channel || row.type || 'Workflow Engine',
        message: row.message || 'Automation executed',
        type: (String(row.type || '').includes('error') ? 'warning' : 'success') as 'success' | 'info' | 'warning',
      })),
      ...traces.slice(0, 15).map((t) => ({
        id: `trace-${t.id}`,
        time: new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour12: false }),
        sortTs: new Date(t.created_at || Date.now()).getTime(),
        module: `AI (${t.channel} · ${t.intent})`,
        message: `Provider ${t.provider} responded in ${t.latency_ms}ms · RAG hits: ${t.rag_chunks_count}${t.tool_names_used?.length ? ` · Tools: ${t.tool_names_used.join(', ')}` : ''}`,
        type: (t.requires_handoff ? 'warning' : 'info') as 'success' | 'info' | 'warning',
      })),
    ]
      .sort((a, b) => b.sortTs - a.sortTs)
      .slice(0, 25)
      .map(({ sortTs: _s, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      aiTelemetry: {
        totalRuns,
        avgLatencyMs,
        ragHitRatePct,
        handoffRatePct,
        crmLinkedRatePct,
        providers,
        topTools,
        dailyRuns: Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })),
        recentTraces: traces.slice(0, 10),
      },
      operations: {
        workflowsTotal: wfs.length,
        workflowsActive: wfs.filter((w) => w.is_active).length,
        totalWorkflowRuns: wfs.reduce((sum, w) => sum + (Number(w.executions_count) || 0), 0),
        openTasks: (tasksRes.data || []).length,
        jobsPending: jobs.filter((j) => j.status === 'pending').length,
        jobsCompleted: jobs.filter((j) => j.status === 'completed').length,
        jobsFailed: jobs.filter((j) => j.status === 'failed').length,
        activeSequenceEnrollments: (enrollRes.data || []).length,
      },
      revenueAndCrm: {
        totalLeads: leads.length,
        qualifiedLeads: leads.filter((l) => l.status === 'qualified' || l.status === 'converted').length,
        pipelineValueEur: Math.round(openDeals.reduce((s, d) => s + (Number(d.value) || 0), 0)),
        wonRevenueEur: Math.round(wonDeals.reduce((s, d) => s + (Number(d.value) || 0), 0)),
        ordersRevenueEur: Math.round(paidOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)),
        upcomingBookings: (apptsRes.data || []).length,
      },
      recentLogs,
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to load workspace analytics summary');
  }
}
