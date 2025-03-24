'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchDoctorSchedule } from '@/app/actions/admin';

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

interface DefaultSchedule {
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
  bufferTime: number;
  breakStart?: string | null;
  breakEnd?: string | null;
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

export default function DoctorSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params?.id) {
      loadSchedules();
    }
  }, [params?.id]);

  const loadSchedules = async () => {
    if (!params?.id) return;
    
    try {
      const result = await fetchDoctorSchedule(params.id as string);
      if (result.success && result.data) {
        setSchedules(result.data);
      } else {
        toast.error(result.error || 'Failed to load schedule');
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleChange = (dayOfWeek: number, field: keyof (Schedule | DefaultSchedule), value: any) => {
    setSchedules(current => {
      const existingSchedule = current.find(s => s.dayOfWeek === dayOfWeek);
      if (existingSchedule) {
        return current.map(schedule =>
          schedule.dayOfWeek === dayOfWeek
            ? { ...schedule, [field]: value }
            : schedule
        );
      } else {
        return [
          ...current,
          {
            id: `temp-${dayOfWeek}`,
            doctorId: params?.id as string,
            dayOfWeek,
            startTime: '09:00',
            endTime: '17:00',
            isActive: field === 'isActive' ? value : false,
            slotDuration: 30,
            bufferTime: 5,
            breakStart: null,
            breakEnd: null,
            [field]: value,
          } as Schedule
        ];
      }
    });
  };

  const handleSubmit = async () => {
    if (!params?.id) return;
    
    setIsSaving(true);
    try {
      // Create payload and log it for debugging
      const payload = {
        doctorId: params.id,
        schedules: schedules
      };
      
      console.log("Submitting doctor schedule:", payload);
      
      const response = await fetch('/api/admin/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || 'Failed to save schedule');
      }

      console.log("Schedule update successful:", responseData);
      toast.success('Schedule updated successfully');
      router.push('/admin/schedule');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-[#8B5C9E]">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="text-[#8B5C9E] hover:text-[#8B5C9E]/80 hover:bg-[#8B5C9E]/10"
          onClick={() => router.push('/admin/schedule')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-[#8B5C9E]">Edit Schedule</h1>
      </div>

      <div className="grid gap-6">
        {daysOfWeek.map((day, index) => {
          const schedule = schedules.find(s => s.dayOfWeek === index) || {
            dayOfWeek: index,
            isActive: false,
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            bufferTime: 5,
            breakStart: null,
            breakEnd: null,
          } as DefaultSchedule;

          return (
            <Card key={day} className="p-6 bg-white">
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={schedule.isActive}
                    onCheckedChange={(checked: boolean) =>
                      handleScheduleChange(index, 'isActive', checked)
                    }
                    className="data-[state=checked]:bg-[#8B5C9E]"
                  />
                  <h3 className="text-lg font-semibold text-[#8B5C9E]">{day}</h3>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-[#8B5C9E] mb-1">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) =>
                        handleScheduleChange(index, 'startTime', e.target.value)
                      }
                      disabled={!schedule.isActive}
                      className="w-full bg-white disabled:bg-gray-100 border-[#8B5C9E]/20 focus:border-[#8B5C9E] focus:ring-[#8B5C9E] text-[#8B5C9E] placeholder-[#8B5C9E]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8B5C9E] mb-1">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) =>
                        handleScheduleChange(index, 'endTime', e.target.value)
                      }
                      disabled={!schedule.isActive}
                      className="w-full bg-white disabled:bg-gray-100 border-[#8B5C9E]/20 focus:border-[#8B5C9E] focus:ring-[#8B5C9E] text-[#8B5C9E] placeholder-[#8B5C9E]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8B5C9E] mb-1">
                      Break Start
                    </label>
                    <Input
                      type="time"
                      value={schedule.breakStart || ''}
                      onChange={(e) =>
                        handleScheduleChange(index, 'breakStart', e.target.value || null)
                      }
                      disabled={!schedule.isActive}
                      className="w-full bg-white disabled:bg-gray-100 border-[#8B5C9E]/20 focus:border-[#8B5C9E] focus:ring-[#8B5C9E] text-[#8B5C9E] placeholder-[#8B5C9E]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8B5C9E] mb-1">
                      Break End
                    </label>
                    <Input
                      type="time"
                      value={schedule.breakEnd || ''}
                      onChange={(e) =>
                        handleScheduleChange(index, 'breakEnd', e.target.value || null)
                      }
                      disabled={!schedule.isActive}
                      className="w-full bg-white disabled:bg-gray-100 border-[#8B5C9E]/20 focus:border-[#8B5C9E] focus:ring-[#8B5C9E] text-[#8B5C9E] placeholder-[#8B5C9E]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8B5C9E] mb-1">
                      Slot Duration (min)
                    </label>
                    <Input
                      type="number"
                      value={schedule.slotDuration}
                      onChange={(e) =>
                        handleScheduleChange(index, 'slotDuration', parseInt(e.target.value))
                      }
                      disabled={!schedule.isActive}
                      min={5}
                      step={5}
                      className="w-full bg-white disabled:bg-gray-100 border-[#8B5C9E]/20 focus:border-[#8B5C9E] focus:ring-[#8B5C9E] text-[#8B5C9E] placeholder-[#8B5C9E]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8B5C9E] mb-1">
                      Buffer Time (min)
                    </label>
                    <Input
                      type="number"
                      value={schedule.bufferTime}
                      onChange={(e) =>
                        handleScheduleChange(index, 'bufferTime', parseInt(e.target.value))
                      }
                      disabled={!schedule.isActive}
                      min={0}
                      step={5}
                      className="w-full bg-white disabled:bg-gray-100 border-[#8B5C9E]/20 focus:border-[#8B5C9E] focus:ring-[#8B5C9E] text-[#8B5C9E] placeholder-[#8B5C9E]/50"
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/schedule')}
          className="bg-white border-[#8B5C9E] text-[#8B5C9E] hover:bg-[#8B5C9E]/5 hover:text-[#8B5C9E] hover:border-[#8B5C9E]"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-[#8B5C9E] text-white hover:bg-[#8B5C9E]/90 disabled:bg-[#8B5C9E]/50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
} 