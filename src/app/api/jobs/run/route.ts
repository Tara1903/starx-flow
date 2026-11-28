import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { isValidUuid } from '@/lib/crm/organizationHelper';
import { processDueJobBatch } from '@/lib/jobs/jobBatchProcessor';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const TriggerJobsSchema = z.object({
  batchSize: z.number().int().min(1).max(50).optional().default(25),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const orgId = auth.session.organizationId || auth.session.user.id;
    if (!isSupabaseAdminConfigured || !isValidUuid(orgId)) {
      return NextResponse.json({
        success: true,
        summary: { pending: 0, processing: 0, completed: 0, failed: 0, activeSequenceEnrollments: 0 },
        recentJobs: [],
      });
    }

    const [{ data: jobs }, { data: enrollments }] = await Promise.all([
      supabaseAdmin
        .from('receptionist_jobs')
        .select('id, job_type, channel, status, scheduled_for, attempts, last_error, completed_at, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAdmin
        .from('crm_sequence_enrollments')
        .select('id, status')
        .eq('organization_id', orgId)
        .eq('status', 'active'),
    ]);

    const rows = jobs || [];
    return NextResponse.json({
      success: true,
      summary: {
        pending: rows.filter((j: any) => j.status === 'pending').length,
        processing: rows.filter((j: any) => j.status === 'processing').length,
        completed: rows.filter((j: any) => j.status === 'completed').length,
        failed: rows.filter((j: any) => j.status === 'failed').length,
        activeSequenceEnrollments: (enrollments || []).length,
      },
      recentJobs: rows.slice(0, 15),
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to fetch background job summary');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    let rawBody: unknown = {};
    try {
      const text = await req.text();
      if (text.trim()) rawBody = JSON.parse(text);
    } catch {
      return apiErrorResponse(400, 'BAD_JSON', 'Invalid JSON request body');
    }

    const parsed = TriggerJobsSchema.safeParse(rawBody);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid job execution parameters');
    }

    const result = await processDueJobBatch({
      batchSize: parsed.data.batchSize,
      workerPrefix: 'manual-admin',
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to run background jobs');
  }
}
