'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, Plus, Loader2, ChevronLeft, ArrowLeft } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import type { SpecialDate } from '@/types/schedule';

interface PageProps {
  params: {
    id: string;
  };
}

export default function SpecialDatesPage({ params }: PageProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'HOLIDAY' as 'HOLIDAY' | 'BREAK',
    reason: '',
    breakStart: '13:00',
    breakEnd: '14:00'
  });

  useEffect(() => {
    if (!params.id) return;
    fetchSpecialDates();
  }, [params.id, currentMonth]);

  const fetchSpecialDates = async () => {
    setIsLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const response = await fetch(
        `/api/admin/special-dates?doctorId=${params.id}&start=${start}&end=${end}`
      );
      if (!response.ok) throw new Error('Failed to fetch special dates');
      const data = await response.json();
      setSpecialDates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch special dates:', error);
      toast.error('Failed to load special dates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDate || !params.id) return;

    try {
      const response = await fetch('/api/admin/special-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: params.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          ...formData
        }),
      });

      if (!response.ok) throw new Error('Failed to save special date');
      
      const newSpecialDate = await response.json();
      setSpecialDates(current => [...current, newSpecialDate]);
      setModalOpen(false);
      toast.success(
        formData.type === 'HOLIDAY' 
          ? 'Holiday marked successfully' 
          : 'Break time set successfully'
      );
    } catch (error) {
      console.error('Failed to save special date:', error);
      toast.error('Failed to save changes');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/special-dates/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete special date');
      
      setSpecialDates(current => current.filter(date => date.id !== id));
      toast.success('Successfully removed');
    } catch (error) {
      console.error('Failed to delete special date:', error);
      toast.error('Failed to remove');
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getSpecialDateForDay = (date: Date) => {
    return specialDates.find(special => 
      isSameDay(new Date(special.date), date)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Special Dates</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage holidays and special schedules
              </p>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            >
              Previous
            </Button>
            <span className="text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B5C9E]" />
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                  {day}
                </div>
              ))}
              {days.map(day => {
                const specialDate = getSpecialDateForDay(day);
                return (
                  <motion.button
                    key={day.toISOString()}
                    whileHover={{ scale: 0.98 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedDate(day);
                      setModalOpen(true);
                    }}
                    className={`
                      aspect-square p-3 relative transition-all
                      ${isWeekend(day) ? 'bg-gray-50/50' : 'hover:bg-gray-50'}
                      ${specialDate ? 'bg-[#8B5C9E]/5' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${specialDate ? 'text-[#8B5C9E]' : 'text-gray-900'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {specialDate && (
                      <div className="absolute inset-x-2 bottom-2">
                        <div className={`
                          text-[10px] font-medium px-1.5 py-0.5 rounded-full
                          ${specialDate.type === 'HOLIDAY' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                          }
                        `}>
                          {specialDate.type === 'HOLIDAY' ? 'Holiday' : 'Break'}
                        </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setModalOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Type
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'HOLIDAY' | 'BREAK') => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOLIDAY">Holiday</SelectItem>
                      <SelectItem value="BREAK">Break Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Reason
                  </label>
                  <Input
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Enter reason"
                  />
                </div>

                {formData.type === 'BREAK' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Start Time
                      </label>
                      <Input
                        type="time"
                        value={formData.breakStart}
                        onChange={(e) => setFormData(prev => ({ ...prev, breakStart: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        End Time
                      </label>
                      <Input
                        type="time"
                        value={formData.breakEnd}
                        onChange={(e) => setFormData(prev => ({ ...prev, breakEnd: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-[#8B5C9E] hover:bg-[#8B5C9E]/90"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 