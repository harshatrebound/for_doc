'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchSpecialDates, createSpecialDate, deleteSpecialDate } from '@/app/actions/admin';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { CalendarIcon, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecialDateEntry {
  id: string;
  date: string | Date;
  name: string;
  type: string;
}

const SPECIAL_DATE_TYPES = [
  { value: 'HOLIDAY', label: 'Public Holiday' },
  { value: 'CLOSURE', label: 'Clinic Closure' },
  { value: 'EVENT', label: 'Special Event' },
  { value: 'OTHER', label: 'Other' },
];

export default function GlobalSpecialDatesManager() {
  const [specialDates, setSpecialDates] = useState<SpecialDateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateName, setDateName] = useState('');
  const [dateType, setDateType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDates = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchSpecialDates();
    if (result.success && result.data) {
      setSpecialDates(result.data);
    } else {
      toast.error(result.error || 'Failed to load special dates');
      setSpecialDates([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  const handleAddDate = async () => {
    if (!selectedDate || !dateName || !dateType) {
      toast.error('Please select a date, enter a name, and select a type.');
      return;
    }

    setIsSubmitting(true);
    const result = await createSpecialDate({
      date: selectedDate,
      name: dateName,
      type: dateType,
    });

    if (result.success) {
      toast.success('Special date added successfully.');
      await loadDates();
      setSelectedDate(undefined);
      setDateName('');
      setDateType('');
    } else {
      toast.error(result.error || 'Failed to add special date.');
    }
    setIsSubmitting(false);
  };

  const handleDeleteDate = async (id: string) => {
    setDeletingId(id);
    const result = await deleteSpecialDate(id);
    if (result.success) {
      toast.success('Special date removed successfully.');
      await loadDates();
    } else {
      toast.error(result.error || 'Failed to remove special date.');
    }
    setDeletingId(null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <h4 className="font-medium text-gray-800">Add New Special Date</h4>
            <div>
              <label className="text-sm font-medium block mb-1">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label htmlFor="dateName" className="text-sm font-medium block mb-1">Name / Reason</label>
              <Input 
                id="dateName"
                value={dateName}
                onChange={(e) => setDateName(e.target.value)}
                placeholder="e.g., Christmas Day, Clinic Maintenance"
              />
            </div>
            <div>
              <label htmlFor="dateType" className="text-sm font-medium block mb-1">Type</label>
               <Select value={dateType} onValueChange={setDateType}>
                 <SelectTrigger id="dateType">
                   <SelectValue placeholder="Select type..." />
                 </SelectTrigger>
                 <SelectContent>
                   {SPECIAL_DATE_TYPES.map(type => (
                     <SelectItem key={type.value} value={type.value}>
                       {type.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
            <Button onClick={handleAddDate} disabled={isSubmitting || !selectedDate || !dateName || !dateType} className="w-full bg-[#8B5C9E] hover:bg-[#8B5C9E]/90">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Special Date
            </Button>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-medium text-gray-800 mb-4">Existing Special Dates</h4>
            {isLoading ? (
              <p>Loading dates...</p>
            ) : specialDates.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No special dates added.</p>
            ) : (
              <div className="border rounded-md max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialDates.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{format(new Date(item.date), 'PPP')}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {SPECIAL_DATE_TYPES.find(t => t.value === item.type)?.label || item.type}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDate(item.id)}
                            disabled={deletingId === item.id}
                            aria-label="Delete special date"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 