import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the admin token cookie with the same options used when setting it
  cookies().delete({
    name: 'admin_token',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  return NextResponse.json({ success: true });
} 