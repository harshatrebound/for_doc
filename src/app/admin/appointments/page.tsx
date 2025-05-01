'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import FullCalendarView from '@/components/FullCalendarView';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  fetchAppointments, 
  updateAppointmentStatus, 
  createAppointment,
  updateAppointment,
  fetchDoctors
} from '@/app/actions/admin';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, CalendarIcon, ListIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Pagination, PaginationData } from '@/components/admin/Pagination';

interface Doctor {
  name: string;
  speciality: string;
  fee: number;
}

interface Appointment {
  id: string;
  patientName: string | null;
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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Add pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pageSize: 10,
    pageCount: 0
  });

  useEffect(() => {
    loadInitialData();
  }, [pagination.page, pagination.pageSize]); // Reload when page or page size changes

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [appointmentResult, doctorResult] = await Promise.all([
        fetchAppointments(pagination.page, pagination.pageSize),
        fetchDoctors()
      ]);

      if (appointmentResult.success && appointmentResult.data) {
        setAppointments(appointmentResult.data.appointments);
        setPagination(appointmentResult.data.pagination);
      } else {
        toast.error(appointmentResult.error || 'Failed to load appointments');
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
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-[#8B5C9E]/10 text-[#8B5C9E]';
      case 'COMPLETED':
        return 'bg-[#8B5C9E] text-white';
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
        <div className="font-medium text-gray-900">
          {appointment.patientName || 'N/A'}
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
                className="h-8 w-8 p-0 hover:bg-[#8B5C9E]/10"
                disabled={updatingStatus === appointment.id}
              >
                <ChevronDown className="h-4 w-4 text-[#8B5C9E]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-[160px] p-2 bg-white shadow-lg rounded-md border border-[#8B5C9E]/10"
            >
              {getAvailableStatuses(appointment.status).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(appointment.id, status)}
                  className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer mb-1 last:mb-0 ${
                    status === 'CANCELLED' || status === 'NO_SHOW'
                      ? 'text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700'
                      : 'text-[#8B5C9E] hover:bg-[#8B5C9E]/5 hover:text-[#8B5C9E] focus:bg-[#8B5C9E]/5 focus:text-[#8B5C9E]'
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
          <div className="font-medium text-gray-900">
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
             variant={viewMode === 'list' ? 'default' : 'outline'}
             size="sm"
             onClick={() => setViewMode('list')} 
             className="bg-[#8B5C9E] text-white hover:bg-[#7a4f8a] focus:ring-[#8B5C9E] data-[state=checked]:bg-[#8B5C9E] data-[state=checked]:text-white"
           >
              <ListIcon className="h-4 w-4 mr-2" />
              List View
           </Button>
           <Button 
             variant={viewMode === 'calendar' ? 'default' : 'outline'} 
             size="sm"
             onClick={() => setViewMode('calendar')} 
             className="bg-[#8B5C9E] text-white hover:bg-[#7a4f8a] focus:ring-[#8B5C9E] data-[state=checked]:bg-[#8B5C9E] data-[state=checked]:text-white"
           >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar View
           </Button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={appointments}
            searchable
            sortable
            loading={isLoading}
          />
          
          {/* Add pagination component */}
          {!isLoading && appointments.length > 0 && (
            <Pagination 
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="bg-white border-0 shadow-md rounded-lg p-4"> 
          <FullCalendarView 
            appointments={appointments}
            doctors={doctors}
            onUpdateAppointment={handleUpdateAppointment}
            onCreateAppointment={handleCreateAppointment} 
          />
        </div>
      )}
    </div>
  );
} 