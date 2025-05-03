'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { 
  fetchAppointments, 
  updateAppointmentStatus, 
  createAppointment,
  updateAppointment,
  fetchDoctors,
  fetchAllAppointmentsForCalendar
} from '@/app/actions/admin';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, CalendarIcon, ListIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { Pagination, PaginationData } from '@/components/admin/Pagination';
import AdminCalendar from '@/components/AdminCalendar';
import DayAppointmentsDrawer from '@/components/DayAppointmentsDrawer';
import AppointmentModal from '@/components/AppointmentModal';

interface Doctor {
  name: string;
  speciality: string;
  fee: number;
}

interface Appointment {
  id: string;
  patientName: string | null;
  email: string | null;
  phone: string | null;
  date: Date;
  time: string | null;
  status: string;
  doctorId: string;
  customerId: string | null;
  doctor: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarAppointments, setCalendarAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  
  // Add pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pageSize: 10,
    pageCount: 0
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDateForDrawer, setSelectedDateForDrawer] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [prefilledTimeForModal, setPrefilledTimeForModal] = useState<string | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));

  useEffect(() => {
    loadInitialData();
  }, [pagination.page, pagination.pageSize, selectedMonth, viewMode]); // Reload when page, page size, month, or view changes

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      let appointmentResult;
      if (viewMode === 'list') {
        appointmentResult = await fetchAppointments(
          pagination.page,
          pagination.pageSize,
          {
            startDate: startOfMonth(selectedMonth),
            endDate: endOfMonth(selectedMonth)
          }
        );
      } else {
        appointmentResult = await fetchAppointments(pagination.page, pagination.pageSize);
      }
      const [calendarAppointmentResult, doctorResult] = await Promise.all([
        fetchAllAppointmentsForCalendar(),
        fetchDoctors()
      ]);

      if (appointmentResult.success && appointmentResult.data) {
        setAppointments(appointmentResult.data.appointments);
        setPagination(appointmentResult.data.pagination);
      } else {
        toast.error(appointmentResult.error || 'Failed to load appointments list');
      }

      if (calendarAppointmentResult.success && calendarAppointmentResult.data) {
        setCalendarAppointments(calendarAppointmentResult.data);
      } else {
        toast.error(calendarAppointmentResult.error || 'Failed to load calendar appointments');
        setCalendarAppointments([]);
      }

      if (doctorResult.success && doctorResult.data) {
        setDoctors(doctorResult.data);
      } else {
        toast.error(doctorResult.error || 'Failed to load doctors');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load page data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const result = await fetchAppointments(pagination.page, pagination.pageSize);
      if (result.success && result.data) {
        setAppointments(result.data.appointments);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error || 'Failed to load appointments');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    }
  };

  // Add pagination navigation handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdatingStatus(appointmentId);
      const result = await updateAppointmentStatus(appointmentId, newStatus);
      if (result.success) {
        toast.success('Appointment status updated successfully');
        loadAppointments();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update appointment status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-[#F3E8FF] text-[#8B5C9E] border border-[#E9D5FF]';
      case 'CONFIRMED':
        return 'bg-[#8B5C9E] text-white';
      case 'COMPLETED':
        return 'bg-[#8B5C9E]/80 text-white';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return '🕒';
      case 'CONFIRMED':
        return '✓';
      case 'COMPLETED':
        return '✔️';
      case 'CANCELLED':
        return '✕';
      case 'NO_SHOW':
        return '⚠️';
      default:
        return '•';
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const allStatuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const columns = [
    {
      header: 'Patient',
      accessorKey: 'patientName',
      cell: (appointment: Appointment) => (
        <div>
          <div className="font-medium text-gray-900">
            {appointment.patientName || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {appointment.email && (
              <div className="truncate">{appointment.email}</div>
            )}
            {appointment.phone && (
              <div>{appointment.phone}</div>
            )}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Doctor',
      accessorKey: 'doctor',
      cell: (appointment: Appointment) => (
        <div>
          <div className="font-medium text-gray-900">{appointment.doctor?.name}</div>
          <div className="text-sm text-gray-500">{appointment.doctor?.speciality}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Date & Time',
      accessorKey: 'date',
      cell: (appointment: Appointment) => (
        <div>
          <div className="font-medium text-gray-900">
            {format(new Date(appointment.date), 'MMM d, yyyy')}
          </div>
          <div className="text-sm text-gray-500">{appointment.time}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (appointment: Appointment) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
              appointment.status
            )}`}
          >
            <span className="mr-1">{getStatusIcon(appointment.status)}</span>
            {appointment.status}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
                disabled={updatingStatus === appointment.id}
              >
                {updatingStatus === appointment.id ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-[160px] p-2 bg-white shadow-lg rounded-md border border-primary/10"
            >
              {getAvailableStatuses(appointment.status).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(appointment.id, status)}
                  className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer mb-1 last:mb-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    status === 'CANCELLED' || status === 'NO_SHOW'
                      ? 'text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700'
                      : 'text-primary hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary'
                  }`}
                >
                  <span className="mr-2">{getStatusIcon(status)}</span>
                  Change to {status.toLowerCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Fee',
      accessorKey: 'doctor.fee',
      cell: (appointment: Appointment) => {
        const fee = appointment.doctor?.fee ?? 0;
        return (
          <div className="font-medium text-gray-900 hidden md:block">
            ₹{fee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      },
      sortable: true,
    },
  ];

  const handleUpdateAppointment = async (appointment: Appointment) => {
    try {
      setUpdatingStatus(appointment.id || null);
      const result = await updateAppointment(appointment);
      if (result.success) {
        toast.success('Appointment updated successfully');
        loadAppointments();
      } else {
        toast.error(result.error || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  const handleCreateAppointment = async (appointment: Appointment) => {
    try {
      const result = await createAppointment(appointment);
      if (result.success) {
        toast.success('Appointment created successfully');
        loadAppointments();
      } else {
        toast.error(result.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  // --- Handlers for calendar integration ---
  const handleDayClick = (date: Date) => {
    setSelectedDateForDrawer(date);
    setIsDrawerOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsNewAppointment(false);
    setPrefilledTimeForModal(undefined);
    setIsModalOpen(true);
  };

  const handleBookAgain = (appointment: Appointment) => {
    setIsNewAppointment(true);
    setSelectedAppointment(appointment);
    setSelectedDate(new Date()); // Default to today, user can change
    setPrefilledTimeForModal(undefined);
    setIsModalOpen(true);
  };

  const handleDrawerAppointmentClick = (appointment: Appointment) => {
    handleAppointmentClick(appointment);
    setIsDrawerOpen(false);
  };

  const handleDrawerAddSlotClick = (date: Date, time: string) => {
    setSelectedDate(date);
    setPrefilledTimeForModal(time);
    setSelectedAppointment(null);
    setIsNewAppointment(true);
    setIsModalOpen(true);
    setIsDrawerOpen(false);
  };

  const handleSaveAppointment = async (appointment: Appointment) => {
    if (isNewAppointment) {
      await createAppointment(appointment);
    } else {
      await updateAppointment(appointment);
    }
    setIsModalOpen(false);
    loadInitialData();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">Loading appointments...</div>
      </div>
    );
  }
  
  console.log('[AppointmentsPage] Appointments state:', appointments);
  console.log('[AppointmentsPage] Doctors state:', doctors);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative bg-gray-100 rounded-full p-1 flex flex-nowrap w-auto min-w-[220px]">
            <button
              className={`flex-1 px-3 py-2 rounded-full transition-all duration-200 text-sm font-medium focus:outline-none whitespace-nowrap ${viewMode === 'list' ? 'bg-[#8B5C9E] text-white shadow' : 'text-[#8B5C9E] hover:bg-[#F3E8FF]'}`}
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              List View
            </button>
            <button
              className={`flex-1 px-3 py-2 rounded-full transition-all duration-200 text-sm font-medium focus:outline-none whitespace-nowrap ${viewMode === 'calendar' ? 'bg-[#8B5C9E] text-white shadow' : 'text-[#8B5C9E] hover:bg-[#F3E8FF]'}`}
              onClick={() => setViewMode('calendar')}
              aria-pressed={viewMode === 'calendar'}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>
      {/* Mobile: Month filter and count for list view */}
      {viewMode === 'list' && (
        <>
          <div className="sm:hidden px-4 mb-2 flex items-center gap-2">
            <button
              className="p-2 rounded-full bg-[#F3E8FF] text-[#8B5C9E] hover:bg-[#E9D5FF]"
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-base font-semibold text-[#8B5C9E]">
              {format(selectedMonth, 'MMMM yyyy')}
            </span>
            <button
              className="p-2 rounded-full bg-[#F3E8FF] text-[#8B5C9E] hover:bg-[#E9D5FF]"
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="sm:hidden px-4 mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-700">Appointments this month:</span>
            <span className="text-base font-semibold text-[#8B5C9E]">{pagination.total}</span>
          </div>
        </>
      )}
      {viewMode === 'list' ? (
        <Card className="mt-4 overflow-hidden border-0 shadow-none bg-transparent">
          <div className="overflow-visible w-full">
            <DataTable
              columns={columns}
              data={appointments}
              searchable
              sortable
              loading={isLoading}
            />
            <Pagination 
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </Card>
      ) : (
        <Card className="mt-4 p-4 overflow-hidden border-0 shadow-none bg-transparent">
          <AdminCalendar
            appointments={calendarAppointments}
            onDayClick={handleDayClick}
            onAppointmentClick={handleAppointmentClick}
          />
          <DayAppointmentsDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            selectedDate={selectedDateForDrawer}
            allAppointments={calendarAppointments}
            onAppointmentClick={handleDrawerAppointmentClick}
            onAddSlotClick={handleDrawerAddSlotClick}
            getStatusColorClass={() => ''}
            workingHoursStart={9}
            workingHoursEnd={17}
            timeSlotIntervalMinutes={30}
          />
          {isModalOpen && (
            <AppointmentModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              appointment={selectedAppointment}
              onSave={handleSaveAppointment}
              isNewAppointment={isNewAppointment}
              selectedDate={selectedDate}
              prefilledTime={prefilledTimeForModal}
              doctors={doctors}
              onBookAgain={handleBookAgain}
            />
          )}
        </Card>
      )}
    </div>
  );
} 