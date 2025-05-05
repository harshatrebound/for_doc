'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, CalendarIcon, Trash2 } from 'lucide-react';
import { 
  fetchDoctorSchedule, 
  fetchDoctorById, 
  fetchSpecialDates, 
  createSpecialDate, 
  deleteSpecialDate 
} from '@/app/actions/admin';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface Doctor {
  id: string;
  name: string;
  // Add other fields if needed
}

interface SpecialDateEntry {
  id: string;
  date: string | Date;
  reason?: string | null;
  name?: string;
  type?: string;
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
  const doctorId = params?.id as string;

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [blocks, setBlocks] = useState<SpecialDateEntry[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(true);
  const [selectedBlockDate, setSelectedBlockDate] = useState<Date | undefined>(undefined);
  const [blockReason, setBlockReason] = useState('');
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);
  const [isTimeBlock, setIsTimeBlock] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState('09:00');
  const [blockEndTime, setBlockEndTime] = useState('12:00');

  const loadData = useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setIsLoadingBlocks(true);
    try {
      const [scheduleResult, doctorResult, blocksResult] = await Promise.all([
        fetchDoctorSchedule(id),
        fetchDoctorById(id),
        fetchSpecialDates(id)
      ]);

      if (scheduleResult.success && scheduleResult.data) {
        setSchedules(scheduleResult.data);
      } else {
        toast.error(scheduleResult.error || 'Failed to load schedule');
        setSchedules([]);
      }

      if (doctorResult.success && doctorResult.data) {
        setDoctor(doctorResult.data as Doctor);
      } else {
        toast.error(doctorResult.error || 'Failed to load doctor details');
        setDoctor(null);
      }

      if (blocksResult.success && blocksResult.data) {
        setBlocks(blocksResult.data as SpecialDateEntry[]);
      } else {
        console.error('Failed to load availability blocks:', blocksResult.error);
        setBlocks([]);
      }

    } catch (error) {
      console.error('Error loading page data:', error);
      toast.error('Failed to load page data');
      setDoctor(null);
      setSchedules([]);
      setBlocks([]);
    } finally {
      setIsLoading(false);
      setIsLoadingBlocks(false);
    }
  }, []);

  useEffect(() => {
    if (doctorId) {
      loadData(doctorId);
    }
  }, [doctorId, loadData]);

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

  const handleAddBlock = async () => {
    if (!selectedBlockDate || !doctorId) {
      toast.error('Please select a date to block.');
      return;
    }

    let formattedDate;
    try {
      formattedDate = format(selectedBlockDate, 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error formatting date:", error);
      toast.error('Invalid date selected.');
      return;
    }

    setIsSubmittingBlock(true);
    
    let result;
    
    if (isTimeBlock) {
      result = await createSpecialDate({ 
        doctorId: doctorId,
        date: formattedDate,
        reason: `TIME:${blockStartTime}-${blockEndTime}:${blockReason || 'Time Block'}`,
        type: 'TIME_BLOCK',
        name: `${blockStartTime}-${blockEndTime}: ${blockReason || 'Time Block'}`
      });
    } else {
      result = await createSpecialDate({ 
        doctorId: doctorId,
        date: formattedDate,
        reason: blockReason || undefined,
        type: 'UNAVAILABLE',
        name: blockReason || 'Doctor Unavailable'
      });
    }

    if (result.success) {
      toast.success(isTimeBlock ? 'Time block added successfully.' : 'Availability block added successfully.');
      const refreshResult = await fetchSpecialDates(doctorId);
      if (refreshResult.success && refreshResult.data) {
         setBlocks(refreshResult.data as SpecialDateEntry[]); 
      }
      setSelectedBlockDate(undefined);
      setBlockReason('');
      setBlockStartTime('09:00');
      setBlockEndTime('12:00');
      setIsTimeBlock(false);
    } else {
      toast.error(result.error || 'Failed to add block.');
    }
    
    setIsSubmittingBlock(false);
  };

  const handleDeleteBlock = async (id: string) => {
    if (!doctorId) return;
    setDeletingBlockId(id);
    const result = await deleteSpecialDate(id); 
    if (result.success) {
      toast.success('Availability block removed successfully.');
      const refreshResult = await fetchSpecialDates(doctorId);
      if (refreshResult.success && refreshResult.data) {
         setBlocks(refreshResult.data as SpecialDateEntry[]); 
      }
    } else {
      toast.error(result.error || 'Failed to remove block.');
    }
    setDeletingBlockId(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-[#8B5C9E]">Loading schedule...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Could not load doctor details.</div>
        <Button onClick={() => router.push('/admin/schedule')} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          className="text-[#8B5C9E] hover:text-[#8B5C9E]/80 hover:bg-[#8B5C9E]/10"
          onClick={() => router.push('/admin/schedule')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-[#8B5C9E]">
          Edit Schedule of {doctor.name}
        </h1>
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

      <Card className="p-6 bg-white">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl font-semibold text-gray-700">Manage Availability Blocks</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Add specific dates when {doctor.name} is unavailable (e.g., vacation, conference).</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <h4 className="font-medium text-gray-800">Add New Block</h4>
              <div>
                <label className="text-sm font-medium block mb-1">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedBlockDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedBlockDate ? format(selectedBlockDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedBlockDate}
                      onSelect={setSelectedBlockDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-base font-medium mb-2">Block Type</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="fullDayBlock"
                        name="blockType"
                        checked={!isTimeBlock}
                        onChange={() => setIsTimeBlock(false)}
                        className="w-4 h-4 text-[#8B5C9E] focus:ring-[#8B5C9E]"
                      />
                      <label htmlFor="fullDayBlock" className="text-sm font-medium text-gray-700">
                        Full Day Block
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="timeBlock"
                        name="blockType"
                        checked={isTimeBlock}
                        onChange={() => setIsTimeBlock(true)}
                        className="w-4 h-4 text-[#8B5C9E] focus:ring-[#8B5C9E]"
                      />
                      <label htmlFor="timeBlock" className="text-sm font-medium text-gray-700">
                        Specific Time Block
                      </label>
                    </div>
                  </div>
                </div>

                {isTimeBlock && (
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Time Range</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Start Time</label>
                          <Input
                            type="time"
                            value={blockStartTime}
                            onChange={(e) => setBlockStartTime(e.target.value)}
                            className="w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">End Time</label>
                          <Input
                            type="time"
                            value={blockEndTime}
                            onChange={(e) => setBlockEndTime(e.target.value)}
                            className="w-full text-sm"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Specific time blocks will make these hours unavailable for booking while keeping the rest of the day open.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Block {isTimeBlock && `(${blockStartTime} - ${blockEndTime})`}
                </label>
                <Input
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder={isTimeBlock ? "e.g., Meeting, Training, Lunch..." : "e.g., Holiday, Out of Office..."}
                  className="w-full"
                />
                {isTimeBlock && (
                  <p className="text-xs text-gray-500 mt-1">
                    This time block will prevent patients from booking appointments during the specified hours.
                  </p>
                )}
              </div>
              <Button onClick={handleAddBlock} disabled={isSubmittingBlock || !selectedBlockDate} className="w-full bg-[#8B5C9E] hover:bg-[#8B5C9E]/90">
                {isSubmittingBlock ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Block
              </Button>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-800 mb-4">Existing Blocks for {doctor.name}</h4>
              {isLoadingBlocks ? (
                <div className="flex justify-center items-center h-24"><Loader2 className="h-6 w-6 animate-spin text-[#8B5C9E]"/></div>
              ) : blocks.length === 0 ? (
                <p className="text-sm text-gray-500 italic py-4">No specific blocks added for this doctor.</p>
              ) : (
                <div className="border rounded-md max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blocks.map((item) => {
                        const isTimeBlock = item.type === 'TIME_BLOCK';
                        
                        let displayTime = 'All Day';
                        let displayReason = item.reason || '-';
                        
                        if (isTimeBlock && item.reason?.startsWith('TIME:')) {
                          const parts = item.reason.split(':');
                          if (parts.length >= 3) {
                            displayTime = `${parts[1]}-${parts[2]}`;
                            displayReason = parts.slice(3).join(':') || '-';
                          }
                        }
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{format(new Date(item.date), 'PPP')}</TableCell>
                            <TableCell>{displayTime}</TableCell>
                            <TableCell>{displayReason}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteBlock(item.id)}
                                disabled={deletingBlockId === item.id}
                                aria-label="Delete block"
                                className="hover:bg-red-100/50"
                              >
                                {deletingBlockId === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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