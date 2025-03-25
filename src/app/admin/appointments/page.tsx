'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { fetchAppointments, updateAppointmentStatus } from '@/app/actions/admin';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const result = await fetchAppointments();
      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        toast.error(result.error || 'Failed to load appointments');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdatingStatus(appointmentId);
      const result = await updateAppointmentStatus(appointmentId, newStatus);
      if (result.success) {
        toast.success('Appointment status updated successfully');
        loadAppointments(); // Refresh the appointments list
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all appointments
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <DataTable
          columns={columns}
          data={appointments}
          searchable
          sortable
        />
      </Card>
    </div>
  );
} 