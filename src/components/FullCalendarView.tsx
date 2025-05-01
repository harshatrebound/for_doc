'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin for month view
import interactionPlugin from '@fullcalendar/interaction'; // Plugin for date clicking, dragging, etc.
import timeGridPlugin from '@fullcalendar/timegrid'; // Plugin for week/day views (optional)
import { EventContentArg, DayCellMountArg } from '@fullcalendar/core';
import AppointmentModal from './AppointmentModal';
import { PlusCircle } from 'lucide-react';
import { isBefore, startOfDay } from 'date-fns'; // Import date-fns functions

// Re-use or import the Appointment type from the admin page
interface Appointment {
  id: string;
  patientName: string | null;
  date: Date;
  time: string | null;
  status: string;
  doctorId: string;
  customerId: string | null;
  // Assuming Doctor info might be needed for display
  doctor: {
    name: string;
    speciality: string;
  };
}

interface FullCalendarViewProps {
  appointments: Appointment[];
  doctors?: Doctor[];
  onUpdateAppointment?: (appointment: Appointment) => Promise<void>;
  onCreateAppointment?: (appointment: Appointment) => Promise<void>;
}

// Helper function to determine card background based on appointment status
const getStatusColorClass = (status: string = 'SCHEDULED') => {
  switch (status.toUpperCase()) {
    case 'SCHEDULED':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'CONFIRMED':
      return 'bg-[#8B5C9E]/10 border-[#8B5C9E]/30 text-[#8B5C9E]';
    case 'COMPLETED':
      return 'bg-[#8B5C9E] border-[#8B5C9E] text-white';
    case 'CANCELLED':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'NO_SHOW':
      return 'bg-gray-100 border-gray-300 text-gray-800';
    default:
      return 'bg-[#8B5C9E]/10 border-[#8B5C9E]/30 text-[#8B5C9E]';
  }
};

// Function to format your appointments into FullCalendar events
const formatAppointmentsForCalendar = (appointments: Appointment[]) => {
  console.log('[FullCalendarView] Raw appointments received:', appointments); // Log raw data
  const formatted = appointments.map(app => ({
    id: app.id,
    title: app.patientName || 'Appointment', // Use patient name as title, or a default
    start: new Date(app.date), // Ensure 'start' is a Date object
    allDay: !app.time, // Assume allDay if no specific time is set
    extendedProps: { // Store other data you might want in the event card
      doctorName: app.doctor?.name,
      doctorId: app.doctorId,
      time: app.time,
      status: app.status,
      customerId: app.customerId,
      fullAppointment: app // Store full appointment data for easy access
    }
  }));
  console.log('[FullCalendarView] Formatted events for calendar:', formatted); // Log formatted data
  return formatted;
};

// Custom rendering function for each event (appointment card)
const renderEventContent = (eventInfo: EventContentArg) => {
  const { event } = eventInfo;
  const { extendedProps } = event;
  const status = extendedProps.status || 'SCHEDULED';
  const colorClass = getStatusColorClass(status);

  // Trello-like card with brand colors based on status
  return (
    <div className={`h-full border rounded-md p-1.5 shadow-sm flex flex-col justify-between ${colorClass}`}>
      <div>
        <p className="text-xs font-semibold truncate mb-0.5">{event.title}</p>
        {extendedProps.doctorName && 
          <p className="text-[11px] opacity-90 truncate">Dr. {extendedProps.doctorName}</p>
        }
      </div>
      {extendedProps.time && 
        <p className="text-[11px] opacity-90 mt-1 self-end font-medium">{extendedProps.time}</p>
      }
    </div>
  );
};

const FullCalendarView: React.FC<FullCalendarViewProps> = ({ 
  appointments, 
  doctors = [],
  onUpdateAppointment = async () => {},
  onCreateAppointment = async () => {}
}) => {
  const calendarEvents = formatAppointmentsForCalendar(appointments);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Handle event click - open modal for editing
  const handleEventClick = (info: any) => {
    const eventId = info.event.id;
    console.log("Appointment clicked with ID:", eventId);
    console.log("Event object:", info.event);
    console.log("Event start:", info.event.start);
    console.log("Extended props:", info.event.extendedProps);
    
    // Get appointment data from the appointments array
    const appointmentToEdit = appointments.find(app => app.id === eventId);
    console.log("Found appointment in array:", appointmentToEdit);
    
    if (appointmentToEdit) {
      // Create a complete appointment object with all required fields
      const completeAppointment = {
        ...appointmentToEdit,
        date: new Date(appointmentToEdit.date),
        // Explicitly set these properties to ensure they're not lost
        time: appointmentToEdit.time,
        doctorId: appointmentToEdit.doctorId,
        patientName: appointmentToEdit.patientName,
        status: appointmentToEdit.status
      };
      
      console.log("Complete appointment data to edit:", completeAppointment);
      console.log("--- DEBUG --- Doctor ID before setting state:", completeAppointment.doctorId);
      console.log("--- DEBUG --- Time before setting state:", completeAppointment.time);
      
      setSelectedAppointment(completeAppointment);
      setIsNewAppointment(false);
      setIsModalOpen(true);
    }
  };
  
  // Handle "+" button click - open modal for creating
  const handleAddAppointment = (date: Date) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
    setIsNewAppointment(true);
    setIsModalOpen(true);
  };
  
  // Handle saving appointment (create or update)
  const handleSaveAppointment = async (appointment: Appointment) => {
    if (isNewAppointment) {
      await onCreateAppointment(appointment);
    } else {
      await onUpdateAppointment(appointment);
    }
    setIsModalOpen(false);
  };
  
  // Custom day cell content to add "+" button
  const dayCellDidMount = (arg: DayCellMountArg) => {
    const { el, date } = arg;
    const today = startOfDay(new Date());
    const cellDate = startOfDay(date);

    // Only add the button for today and future dates
    if (!isBefore(cellDate, today)) {
      // Ensure the parent cell is positioned relatively for absolute positioning of the button
      el.style.position = 'relative';

      // Create the "+" button
      const addButton = document.createElement('button');
      addButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5C9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
      addButton.className = 'add-appointment-btn';
      addButton.style.cssText = `
        position: absolute;
        bottom: 2px;
        right: 2px;
        background: transparent;
        border: none;
        cursor: pointer;
        display: none; /* Initially hidden */
        z-index: 10;
      `;
      
      // Add hover effect to the day cell to show/hide the button
      el.addEventListener('mouseenter', () => {
        addButton.style.display = 'block';
      });
      
      el.addEventListener('mouseleave', () => {
        addButton.style.display = 'none';
      });
      
      // Handle click event
      addButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleAddAppointment(date);
      });
      
      // Append the button to the day cell
      el.appendChild(addButton);
    }
  };

  return (
    <div className="fc-theme-standard"> {/* Add custom wrapper for full calendar styling */}
      <style jsx global>{`
        /* Calendar header styling */
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
        }
        
        /* Style the day names (Mon, Tue) */
        .fc .fc-col-header-cell {
          background-color: #f9f9f9;
          padding: 8px 0;
        }
        
        /* Style the calendar day cells */
        .fc .fc-daygrid-day {
          min-height: 120px;
        }
        
        /* Style buttons to match your admin theme */
        .fc .fc-button-primary {
          background-color: #8B5C9E !important;
          border-color: #8B5C9E !important;
        }
        
        .fc .fc-button-primary:hover {
          background-color: #7a4f8a !important;
        }
        
        /* Apply custom styles to the "more" link */
        .fc .fc-daygrid-more-link {
          color: #8B5C9E;
          font-weight: 500;
        }

        /* Fix hover effects extending beyond card boundaries */
        .fc-event-main {
          padding: 0 !important;
        }
        
        .fc-h-event {
          background: transparent !important;
          border: none !important;
        }

        .fc-daygrid-event {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        
        /* Remove FullCalendar's default hover effect */
        .fc-event:hover {
          filter: none !important;
          box-shadow: none !important;
        }
        
        /* Style for day cell hover */
        .fc .fc-daygrid-day:hover {
          background-color: rgba(139, 92, 158, 0.03);
        }
        
        /* Make events clickable */
        .fc-event {
          cursor: pointer;
        }

        /* Custom Scrollbar Styling for SelectContent */
        [data-radix-select-content][class*="max-h-"] {
          /* Firefox */
          scrollbar-width: thin;
          scrollbar-color: #8B5C9E #f0eaf3; /* thumb track */

          /* WebKit (Chrome, Safari, Edge) */
          &::-webkit-scrollbar {
            width: 6px;
          }
          &::-webkit-scrollbar-track {
            background: #f0eaf3; /* Light purple track */
            border-radius: 3px;
          }
          &::-webkit-scrollbar-thumb {
            background-color: #8B5C9E; /* Brand purple thumb */
            border-radius: 3px;
            border: 1px solid #f0eaf3; /* Creates padding around thumb */
          }
          &::-webkit-scrollbar-thumb:hover {
            background-color: #7a4f8a; /* Darker purple on hover */
          }
        }
      `}</style>
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]} 
        initialView="dayGridMonth" 
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay' 
        }}
        events={calendarEvents} 
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        dayCellDidMount={dayCellDidMount}
        editable={true} 
        selectable={true}
        dayMaxEvents={3}
        aspectRatio={1.35}
        height="auto"
      />
      
      {/* Appointment editing/creation modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
        onSave={handleSaveAppointment}
        doctors={doctors}
        isNewAppointment={isNewAppointment}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default FullCalendarView; 