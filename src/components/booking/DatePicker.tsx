'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { convertToIST } from '@/lib/dateUtils';

interface DatePickerISTProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  placeholderText?: string;
  className?: string;
}

export const DatePickerIST = ({
  selected,
  onChange,
  minDate,
  placeholderText = 'Select date (IST)',
  className,
}: DatePickerISTProps): JSX.Element => {
  const filterDate = (date: Date): boolean => {
    // Exclude weekends or specific days if needed
    // const day = date.getDay();
    // return day !== 0 && day !== 6; // Exclude weekends
    return true;
  };

  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        placeholderText={placeholderText}
        className={className}
        dateFormat="MMMM d, yyyy"
        isClearable
        showPopperArrow={false}
        excludeDates={[]} // You can add excluded dates here
        filterDate={filterDate}
      />
      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-gray-100 text-xs text-gray-500 px-1 rounded">
        IST
      </div>
    </div>
  );
}; 