import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

type UserSessionResult =
  | { authenticated: true; userId: string }
  | { authenticated: false; response: NextResponse };

// Require the existing signed user cookie before serving protected routes.
export function requireUser(request: NextRequest): UserSessionResult {
  const token = request.cookies.get('user_token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Please sign in to download media.' },
        { status: 401 }
      ),
    };
  }

  if (!jwtSecret) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication is temporarily unavailable.' },
        { status: 500 }
      ),
    };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id?: unknown };
    if (typeof decoded.id !== 'string' || !decoded.id) {
      throw new Error('Invalid user session');
    }

    return { authenticated: true, userId: decoded.id };
  } catch {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Your session has expired. Please sign in again.' },
        { status: 401 }
      ),
    };
  }
}