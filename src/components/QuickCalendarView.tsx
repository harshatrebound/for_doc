'use client'; // Needed if using event handlers or state, safer default

import React, { useState, FC } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default CSS
import { isSameDay } from 'date-fns'; // Useful for comparing dates

type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

// Define a type for your appointment data
interface Appointment {
  id: string | number;
  title: string;
  date: Date;
}

interface QuickCalendarViewProps {
  appointments: Appointment[]; // Pass appointments as props
}

const QuickCalendarView: FC<QuickCalendarViewProps> = ({ appointments }) => {
  const [value, onChange] = useState<CalendarValue>(new Date());

  // Function to render content within each day tile
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    // Only render content in the 'month' view
    if (view === 'month') {
      // Find appointments for this specific date
      const appointmentsForDay = appointments.filter(app => 
        isSameDay(app.date, date)
      );

      // If there are appointments, render them (e.g., as dots or short titles)
      if (appointmentsForDay.length > 0) {
        return (
          <div className="flex flex-col items-center text-xs mt-1">
            {appointmentsForDay.map((app: Appointment) => (
              <div key={app.id} className="bg-blue-500 text-white rounded px-1 text-[10px] mb-0.5 truncate">
                {app.title}
              </div>
              // Or just render dots:
              // <div key={app.id} className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>
            ))}
          </div>
        );
      }
    }
    return null; // Return null if no content for this tile
  };

  return (
    <div>
      <Calendar
        onChange={onChange}
        value={value}
        tileContent={tileContent}
        // You can add more props here for customization if needed
      />
    </div>
  );
};

export default QuickCalendarView; 