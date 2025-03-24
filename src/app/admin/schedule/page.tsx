'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fetchDoctors, fetchDoctorSchedule } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Card } from '@/components/ui/card';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
}

interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  slotDuration: number;
  bufferTime: number;
  breakStart?: string | null;
  breakEnd?: string | null;
}

interface DoctorWithSchedule extends Doctor {
  schedules: Schedule[];
}

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function SchedulePage() {
  const [doctorsWithSchedule, setDoctorsWithSchedule] = useState<DoctorWithSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDoctorsWithSchedule();
  }, []);

  const loadDoctorsWithSchedule = async () => {
    try {
      const doctorsResult = await fetchDoctors();
      if (!doctorsResult.success || !doctorsResult.data) {
        throw new Error(doctorsResult.error || 'Failed to fetch doctors');
      }

      const doctorsWithSchedule = await Promise.all(
        doctorsResult.data.map(async (doctor) => {
          const scheduleResult = await fetchDoctorSchedule(doctor.id);
          return {
            id: doctor.id,
            name: doctor.name,
            speciality: doctor.speciality,
            schedules: scheduleResult.success && scheduleResult.data ? scheduleResult.data.map(schedule => ({
              id: schedule.id,
              doctorId: schedule.doctorId,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              isActive: schedule.isActive,
              slotDuration: schedule.slotDuration,
              bufferTime: schedule.bufferTime,
              breakStart: schedule.breakStart,
              breakEnd: schedule.breakEnd,
            })) : [],
          } as DoctorWithSchedule;
        })
      );
      setDoctorsWithSchedule(doctorsWithSchedule);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const formatSchedule = (schedules: Schedule[]) => {
    if (!schedules.length) return 'No schedule set';
    
    const activeDays = schedules
      .filter((s) => s.isActive)
      .map((s) => ({
        day: daysOfWeek[s.dayOfWeek],
        time: `${s.startTime} - ${s.endTime}`,
        break: s.breakStart && s.breakEnd ? `Break: ${s.breakStart} - ${s.breakEnd}` : null,
      }));

    if (!activeDays.length) return 'Not available';

    return activeDays
      .map((d) => `${d.day}: ${d.time}${d.break ? `\n${d.break}` : ''}`)
      .join('\n');
  };

  const columns = [
    {
      header: 'Doctor',
      accessorKey: 'name' as keyof DoctorWithSchedule,
      sortable: true,
      cell: (row: DoctorWithSchedule) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      header: 'Speciality',
      accessorKey: 'speciality' as keyof DoctorWithSchedule,
      sortable: true,
      cell: (row: DoctorWithSchedule) => (
        <div className="text-gray-700">{row.speciality}</div>
      ),
    },
    {
      header: 'Schedule',
      accessorKey: 'schedules' as keyof DoctorWithSchedule,
      cell: (row: DoctorWithSchedule) => (
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">
          {formatSchedule(row.schedules)}
        </pre>
      ),
    },
  ];

  const actions = (row: DoctorWithSchedule) => [
    {
      label: 'Edit Schedule',
      onClick: () => router.push(`/admin/doctors/${row.id}/schedule`),
    },
    {
      label: 'Special Dates',
      onClick: () => router.push(`/admin/doctors/${row.id}/special-dates`),
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">Loading schedules...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage doctor schedules and availability
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <DataTable
          columns={columns}
          data={doctorsWithSchedule}
          actions={actions}
          searchable
          sortable
        />
      </Card>
    </div>
  );
} 