import { NextResponse } from 'next/server';
import { validateAndCreateAppointment } from '@/lib/services/appointmentService';

export async function POST(request: Request) {
