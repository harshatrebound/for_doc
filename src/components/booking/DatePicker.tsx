import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  placeholderText?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  minDate,
  placeholderText,
  className,
}) => {
  const filterDate = (date: Date): boolean => {
    // Exclude weekends or specific days if needed
    // const day = date.getDay();
    // return day !== 0 && day !== 6; // Exclude weekends
    return true;
  };

  return (
    <ReactDatePicker
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
  );
}; 