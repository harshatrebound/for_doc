import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Use environment variables for admin credentials instead of hardcoded values
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bookingpress.com'; // Fallback for dev
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Fallback for dev
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Simple credential check
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create a JWT token with longer expiration
      const token = sign(
        { email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' } // Extended from 24h to 7 days
      );

      // Set the token in an HTTP-only cookie with longer max age
      cookies().set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days (extended from 24 hours)
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 