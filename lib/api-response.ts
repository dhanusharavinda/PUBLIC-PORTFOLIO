import { NextResponse } from 'next/server';

export function apiError(error: string, status: number, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details ? { details } : {}),
    },
    { status }
  );
}
