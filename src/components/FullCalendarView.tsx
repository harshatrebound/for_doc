'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin for month view
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'; // Plugin for date clicking, dragging, etc.
import timeGridPlugin from '@fullcalendar/timegrid'; // Plugin for week/day views (optional)
import type { EventContentArg, MoreLinkArg, EventClickArg } from '@fullcalendar/core';
import AppointmentModal from './AppointmentModal';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { isBefore, startOfDay, format, isToday } from 'date-fns'; // Import date-fns functions
import type { Doctor } from '@/types/doctor'; // Import Doctor type
import DayAppointmentsDrawer from './DayAppointmentsDrawer'; // Import the new drawer

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

// Define Extended Props structure used within FullCalendar
interface AppointmentExtendedProps {
  doctorName?: string;
  doctorId: string;
  time: string | null;
  status: string;
  customerId: string | null;
  fullAppointment: Appointment;
}

interface FullCalendarViewProps {
  appointments: Appointment[];
  doctors?: Doctor[];
  onUpdateAppointment?: (appointment: Appointment) => Promise<void>;
  onCreateAppointment?: (appointment: Appointment) => Promise<void>;
}

// --- Constants for Drawer --- 
const DRAWER_WORKING_HOURS_START = 9; // 9 AM
const DRAWER_WORKING_HOURS_END = 17; // 5 PM (exclusive)
const DRAWER_TIME_SLOT_INTERVAL = 30; // minutes
// -----------------------------

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
    } as AppointmentExtendedProps // Add type assertion here
  }));
  console.log('[FullCalendarView] Formatted events for calendar:', formatted); // Log formatted data
  return formatted;
};

// Custom rendering function for each event (appointment card)
const renderEventContent = (eventInfo: EventContentArg) => {
  const { event } = eventInfo;
  const extendedProps = event.extendedProps as AppointmentExtendedProps;
  const status = extendedProps.status || 'SCHEDULED';
  const colorClass = getStatusColorClass(status);

  // Trello-like card with brand colors based on status
  return (
    <div className={`h-full border rounded-md p-1.5 shadow-sm flex flex-col justify-between ${colorClass}`}>
      <div>
        <p className="text-xs font-semibold truncate mb-0.5">{event.title}</p>
        {extendedProps.doctorName && 
          <p className="text-[11px] opacity-90 truncate">{extendedProps.doctorName}</p>
        }
      </div>
      {extendedProps.time && 
        <p className="text-[11px] opacity-90 mt-1 self-end font-medium">{extendedProps.time}</p>
      }
    </div>
  );
};

const FullCalendarView = ({ 
  appointments, 
  doctors = [],
  onUpdateAppointment = async () => {},
  onCreateAppointment = async () => {}
}: FullCalendarViewProps) => {
  const calendarEvents = formatAppointmentsForCalendar(appointments);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [prefilledTimeForModal, setPrefilledTimeForModal] = useState<string | undefined>(undefined);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDateForDrawer, setSelectedDateForDrawer] = useState<Date | null>(null);

  // Handle event click - open modal for editing
  const handleEventClick = (info: EventClickArg | { event: { extendedProps: AppointmentExtendedProps } }) => { 
    // Ensure info.event.id exists if it's a real EventClickArg
    const eventId = 'id' in info.event ? info.event.id : null;
    const extendedProps = info.event.extendedProps as AppointmentExtendedProps;
    console.log("Event click triggered for:", extendedProps.fullAppointment?.patientName);

    // Get the full appointment data from extendedProps
    const appointmentToEdit = extendedProps.fullAppointment;
    
    if (appointmentToEdit) {
        const appointmentDate = typeof appointmentToEdit.date === 'string' 
                                ? new Date(appointmentToEdit.date) 
                                : appointmentToEdit.date;
        const completeAppointment = {
            ...appointmentToEdit,
            date: appointmentDate,
            time: appointmentToEdit.time ?? null, 
            patientName: appointmentToEdit.patientName ?? null,
            status: appointmentToEdit.status ?? 'SCHEDULED', 
            doctorId: appointmentToEdit.doctorId ?? '',
            customerId: appointmentToEdit.customerId ?? null,
            doctor: appointmentToEdit.doctor ?? { name: 'N/A', speciality: 'N/A' }
        };

        console.log("Complete appointment data for modal:", completeAppointment);
        setSelectedAppointment(completeAppointment);
        setIsNewAppointment(false);
        setPrefilledTimeForModal(undefined);
        setIsModalOpen(true);
    } else {
        console.error("Could not find full appointment data in event click info:", info);
    }
  };
  
  // Handle background day cell click on calendar -> Opens Drawer
  const handleDateClick = (clickInfo: DateClickArg) => {
    const clickedDate = clickInfo.date;
    // Open drawer only for today or future dates
    if (!isBefore(startOfDay(clickedDate), startOfDay(new Date()))) {
      console.log("Date cell clicked:", clickedDate);
      setSelectedDateForDrawer(clickedDate);
      setIsDrawerOpen(true);
    } else {
      console.log("Ignoring click on past date:", clickedDate);
    }
  };
  
  // Handle "+N more" link click -> Opens Drawer
  const handleMoreLinkClick = (arg: MoreLinkArg) => {
    console.log("More link clicked for date:", arg.date);
    setSelectedDateForDrawer(arg.date);
    setIsDrawerOpen(true);
    arg.jsEvent.preventDefault(); 
    arg.jsEvent.stopPropagation();
    return false; 
  };

  // Handle clicking an existing appointment *inside the drawer* -> Opens Modal
  const handleDrawerAppointmentClick = (appointment: Appointment) => {
    console.log("Appointment clicked from drawer:", appointment);
    const simulatedEventInfo = {
        event: {
            extendedProps: { 
                fullAppointment: appointment,
                doctorName: appointment.doctor?.name,
                doctorId: appointment.doctorId,
                time: appointment.time,
                status: appointment.status,
                customerId: appointment.customerId,
             } as AppointmentExtendedProps
        }
    };
    handleEventClick(simulatedEventInfo);
    setIsDrawerOpen(false); // Close drawer after clicking
  };
  
  // Handle clicking the '+' button for an empty slot *inside the drawer* -> Opens Modal for new appointment
  const handleDrawerAddSlotClick = (date: Date, time: string) => {
    console.log("Add slot clicked from drawer:", date, time);
    console.log("--> Setting selectedDate for modal to:", date); // Log date being set
    setSelectedDate(date); // Set date context for modal
    setPrefilledTimeForModal(time); // Set time context for modal
    setSelectedAppointment(null);
    setIsNewAppointment(true);
    setIsModalOpen(true);
    setIsDrawerOpen(false); // Close drawer
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

  return (
    <div className="fc-theme-standard relative"> {/* Ensure relative positioning */}
      <style>{` 
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
          border-color: #e2e8f0; /* Tailwind gray-200 */
          position: relative; /* Ensure relative positioning for the button */
          min-height: 100px; /* Adjust height as needed */
        }

        .fc .fc-daygrid-day-top {
            text-align: center;
            padding: 4px;
        }

        /* Past day styling */
        .fc .fc-day-past {
            background-color: #f8f9fa; /* Lighter gray for past dates */
        }

        /* Today styling */
        .fc .fc-day-today {
            background-color: #fef3c7; /* Tailwind amber-100 */
            font-weight: bold;
        }

        /* Event rendering adjustments */
        .fc-daygrid-event {
            white-space: normal; /* Allow text wrapping inside event */
            cursor: pointer;
            margin-bottom: 3px !important; /* Ensure spacing between events */
            border: none !important; /* Remove default FC border */
            padding: 0 !important; /* Remove default FC padding */
        }

        /* Ensure our custom event content fills the container */
        .fc-daygrid-event .fc-event-main {
            height: 100%;
        }

        /* Styling for the add button */
        .add-appointment-btn svg {
            display: inline-block; /* Prevents potential layout shifts */
            vertical-align: middle;
        }
        .add-appointment-btn:hover svg {
           stroke: #6d28d9; /* Example: Darker purple on hover */
        }
        
        /* Styling for the "more" link */
        .fc .fc-daygrid-more-link {
            color: #6d28d9; /* Brand color */
            font-weight: 500;
            font-size: 0.75rem; /* Smaller text */
            padding: 2px 4px;
            border-radius: 3px;
            transition: background-color 0.2s ease;
        }
        .fc .fc-daygrid-more-link:hover {
            background-color: #f3e8ff; /* Lighter purple background on hover */
            text-decoration: none;
        }

        /* Ensure day cells are clickable */
        .fc .fc-daygrid-day:not(.fc-day-past) .fc-daygrid-day-frame {
            cursor: pointer;
        }
        /* Style for hover effect on clickable day cells */
        .fc .fc-daygrid-day:not(.fc-day-past):hover .fc-daygrid-day-frame {
            background-color: rgba(139, 92, 158, 0.04); /* Subtle hover */
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
        dateClick={handleDateClick}
        moreLinkClick={handleMoreLinkClick}
        moreLinkContent={(args: { num: number }) => `+${args.num} more`}
        dayMaxEventRows={4}
        aspectRatio={1.35}
        height="auto"
      />
      
      {/* Appointment Modal (Update Props) */}
      {isModalOpen && (
        <>
          {/* Log the prop being passed */}
          {console.log("<-- Passing selectedDate prop to Modal:", selectedDate)}
          <AppointmentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            appointment={selectedAppointment}
            onSave={handleSaveAppointment}
            isNew={isNewAppointment} 
            selectedDate={selectedDate} 
            prefilledTime={prefilledTimeForModal} 
            doctors={doctors} 
          />
        </>
      )}
      
      {/* ADD Day Appointments Drawer */}
      <DayAppointmentsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedDate={selectedDateForDrawer}
        allAppointments={appointments}
        onAppointmentClick={handleDrawerAppointmentClick}
        onAddSlotClick={handleDrawerAddSlotClick}
        getStatusColorClass={getStatusColorClass}
        workingHoursStart={DRAWER_WORKING_HOURS_START}
        workingHoursEnd={DRAWER_WORKING_HOURS_END}
        timeSlotIntervalMinutes={DRAWER_TIME_SLOT_INTERVAL}
      />
    </div>
  );
};

export default FullCalendarView; 