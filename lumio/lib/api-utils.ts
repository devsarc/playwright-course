import { NextResponse } from 'next/server';
import { auth } from './auth';

export type ApiSession = {
  userId: string;
  role: string;
};

/**
 * Extracts the authenticated user from the request.
 * Returns null if unauthenticated — callers decide how to respond.
 */
export async function getSession(): Promise<ApiSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { userId: session.user.id, role: session.user.role };
}

/**
 * Throws a 401 Response if the request is unauthenticated.
 * Use in API routes that require authentication.
 */
export async function requireAuth(): Promise<ApiSession> {
  const session = await getSession();
  if (!session) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

export function json<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
