/**
 * StarX-Flow Production Vercel Cron Job Invoker
 * Route: /api/cron/process-jobs
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_MAX_DURATION_MS,
  MAX_BATCH_SIZE,
  processDueJobBatch,
} from '@/lib/jobs/jobBatchProcessor';

function verifyCronSecret(request: Request): { authorized: boolean; reason?: string } {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.trim().length === 0) {
    return { authorized: false, reason: 'CRON_SECRET environment variable is not configured' };
  }

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) {
    return { authorized: false, reason: 'Missing Authorization header' };
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return { authorized: false, reason: 'Invalid Authorization header format. Expected "Bearer <token>"' };
  }

  const token = parts[1];
  const expectedBuffer = Buffer.from(cronSecret, 'utf-8');
  const actualBuffer = Buffer.from(token, 'utf-8');

  if (expectedBuffer.length !== actualBuffer.length) {
    return { authorized: false, reason: 'Invalid authorization token' };
  }

  if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    return { authorized: false, reason: 'Invalid authorization token' };
  }

  return { authorized: true };
}

async function handleCronExecution(request: Request): Promise<NextResponse> {
  const startTime = Date.now();

  const auth = verifyCronSecret(request);
  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: auth.reason || 'Unauthorized',
      },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const requestedBatchSize = parseInt(url.searchParams.get('batch_size') || '0', 10);
  const batchSize = requestedBatchSize > 0 ? Math.min(requestedBatchSize, MAX_BATCH_SIZE) : DEFAULT_BATCH_SIZE;

  const requestedMaxDuration = parseInt(url.searchParams.get('max_duration_ms') || '0', 10);
  const maxDurationMs =
    requestedMaxDuration > 0 ? Math.min(requestedMaxDuration, DEFAULT_MAX_DURATION_MS) : DEFAULT_MAX_DURATION_MS;

  try {
    const summary = await processDueJobBatch({
      batchSize,
      maxDurationMs,
      workerPrefix: 'cron-worker',
    });
    return NextResponse.json(summary, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        workerId: `cron-worker-${Date.now()}`,
        error: 'Fatal scheduler processing error',
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  return handleCronExecution(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return handleCronExecution(request);
}
