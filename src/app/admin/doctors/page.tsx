'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DoctorModal from './components/DoctorModal';
import { toast } from 'react-hot-toast';
import { fetchDoctors } from '@/app/actions/admin';
import { Card } from '@/components/ui/card';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  fee: number;
  image?: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDoctors = async () => {
    try {
      const result = await fetchDoctors();
      if (result.success && result.data) {
        setDoctors(result.data as Doctor[]);
      } else {
        toast.error(result.error || 'Failed to load doctors');
      }
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name' as keyof Doctor,
      sortable: true,
      cell: (row: Doctor) => (
        <div className="flex items-center gap-3">
          {row.image && (
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <img
                src={row.image}
                alt={row.name}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Speciality',
      accessorKey: 'speciality' as keyof Doctor,
      sortable: true,
      cell: (row: Doctor) => (
        <span className="text-gray-700">{row.speciality}</span>
      ),
    },
    {
      header: 'Fee',
      accessorKey: 'fee' as keyof Doctor,
      cell: (row: Doctor) => (
        <span className="font-medium text-gray-900">₹{row.fee}</span>
      ),
      sortable: true,
    },
  ];

  const actions = (row: Doctor) => [
    {
      label: 'Edit',
      onClick: () => {
        setSelectedDoctor(row);
        setIsModalOpen(true);
      },
    },
    {
      label: 'Schedule',
      onClick: () => {
        window.location.href = `/admin/doctors/${row.id}/schedule`;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all doctors in your clinic
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedDoctor(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <DataTable
          columns={columns}
          data={doctors}
          actions={actions}
          searchable
          sortable
        />
      </Card>

      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={selectedDoctor}
        onSuccess={() => {
          setIsModalOpen(false);
          loadDoctors();
          toast.success(
            `Doctor ${selectedDoctor ? 'updated' : 'added'} successfully`
          );
        }}
      />
    </div>
  );
} 