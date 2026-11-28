import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { sanitizeClientError } from './sanitizeClientError';

export interface StructuredApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Emits consistent REST error envelopes `{ error: { code, message, details? } }`.
 */
export function apiErrorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse<StructuredApiError> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status }
  );
}

/**
 * Formats Zod validation failures as HTTP 422 VALIDATION_ERROR.
 */
export function zodValidationError(err: ZodError, summary = 'Invalid request data'): NextResponse<StructuredApiError> {
  const firstMsg = err.issues[0]?.message;
  return apiErrorResponse(422, 'VALIDATION_ERROR', firstMsg || summary, err.flatten());
}

/**
 * Formats unexpected server exceptions without leaking internal stack frames or secrets.
 */
export function internalErrorResponse(err: unknown, fallbackMessage: string): NextResponse<StructuredApiError> {
  return apiErrorResponse(500, 'INTERNAL_ERROR', sanitizeClientError(err, fallbackMessage));
}
