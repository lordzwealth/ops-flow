// middleware.ts (root)
import { updateSession } from '@supabase/auth-helpers-nextjs';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/.*)\\..*)',
    '/((?!.*\\..*|_next).*)',
  ],
};
