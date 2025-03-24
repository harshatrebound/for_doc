import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getAvailableTimeSlots } from '@/lib/services/scheduleService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date || Array.isArray(doctorId) || Array.isArray(date)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const availableSlots = await getAvailableTimeSlots(doctorId, new Date(date));
    return res.status(200).json({ slots: availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return res.status(500).json({ error: 'Failed to fetch available slots' });
  }
} 