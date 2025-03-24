'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, X, Plus, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend } from 'date-fns';
import { toast } from 'react-hot-toast';
import type { SpecialDate } from '@/types/schedule';

interface SpecialDatesCalendarProps {
  doctorId: string;
}

export default function SpecialDatesCalendar({ doctorId }: SpecialDatesCalendarProps) {
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

  // Fetch special dates for the current month
  useEffect(() => {
    if (!doctorId) return;

    const fetchSpecialDates = async () => {
      setIsLoading(true);
      try {
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const response = await fetch(
          `/api/admin/special-dates?doctorId=${doctorId}&start=${start}&end=${end}`
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

    fetchSpecialDates();
  }, [doctorId, currentMonth]);

  const handleSave = async () => {
    if (!selectedDate || !doctorId) return;

    try {
      const response = await fetch('/api/admin/special-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
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
    return Array.isArray(specialDates) ? specialDates.find(special => 
      isSameDay(new Date(special.date), date)
    ) : undefined;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[--text-primary]">Special Dates</h2>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CalendarIcon className="w-5 h-5 text-[--text-secondary]" />
          </motion.button>
          <span className="text-lg font-medium text-[--text-primary] min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CalendarIcon className="w-5 h-5 text-[--text-secondary]" />
          </motion.button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[--primary]" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-[--text-secondary] py-2">
              {day}
            </div>
          ))}
          {days.map(day => {
            const specialDate = getSpecialDateForDay(day);
            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedDate(day);
                  setModalOpen(true);
                }}
                className={`
                  aspect-square p-2 rounded-xl relative transition-all
                  ${isWeekend(day) ? 'bg-gray-50' : 'bg-white'}
                  ${specialDate ? 'ring-2 ring-[--primary] shadow-sm' : 'border border-gray-200 hover:border-[--primary]'}
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${specialDate ? 'text-[--primary]' : 'text-[--text-primary]'}
                `}>
                  {format(day, 'd')}
                </span>
                {specialDate && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`
                      text-xs font-medium px-2 py-1 rounded-full
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
      )}

      {/* Modal */}
      {modalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[--text-primary]">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[--text-secondary]" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'HOLIDAY' | 'BREAK' 
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                >
                  <option value="HOLIDAY">Holiday</option>
                  <option value="BREAK">Break Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={formData.type === 'HOLIDAY' ? 'e.g., Public Holiday' : 'e.g., Lunch Break'}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                />
              </div>

              {formData.type === 'BREAK' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                      Break Start
                    </label>
                    <input
                      type="time"
                      value={formData.breakStart}
                      onChange={(e) => setFormData(prev => ({ ...prev, breakStart: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                      Break End
                    </label>
                    <input
                      type="time"
                      value={formData.breakEnd}
                      onChange={(e) => setFormData(prev => ({ ...prev, breakEnd: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-[--text-secondary] hover:text-[--text-primary] font-medium transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="px-4 py-2 bg-[--primary] text-white font-medium rounded-lg hover:bg-[--primary-dark] transition-colors"
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 