import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Support multiple admins via comma-separated .env variables
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
const ADMIN_PASSWORDS = (process.env.ADMIN_PASSWORDS || '').split(',').map(p => p.trim());
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Multi-admin credential check
    const emailIndex = ADMIN_EMAILS.findIndex(e => e === email);
    if (emailIndex !== -1 && ADMIN_PASSWORDS[emailIndex] === password) {
      // Create a JWT token with longer expiration
      const token = sign(
        { email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set the token in an HTTP-only cookie with longer max age
      cookies().set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
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