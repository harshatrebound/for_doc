'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchAppointments, createAppointment, updateAppointment, fetchDoctors } from '@/app/actions/admin';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { Loader2, Phone, Plus, CreditCard, Calendar, ChevronDown, ChevronRight, Edit, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import AppointmentModal from '@/components/AppointmentModal';

interface Doctor {
  id: string;
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

export default function AdminDashboard() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [tomorrowAppointments, setTomorrowAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    tomorrow: true,
    upcoming: true
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    today: { page: 1, hasMore: true, isLoading: false },
    tomorrow: { page: 1, hasMore: true, isLoading: false },
    upcoming: { page: 1, hasMore: true, isLoading: false },
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Observer references for infinite scrolling
  const todayObserverRef = useRef<IntersectionObserver | null>(null);
  const tomorrowObserverRef = useRef<IntersectionObserver | null>(null);
  const upcomingObserverRef = useRef<IntersectionObserver | null>(null);
  
  // Element references for infinite scrolling
  const todayEndRef = useRef<HTMLDivElement>(null);
  const tomorrowEndRef = useRef<HTMLDivElement>(null);
  const upcomingEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
    
    // Clean up observers on unmount
    return () => {
      if (todayObserverRef.current) todayObserverRef.current.disconnect();
      if (tomorrowObserverRef.current) tomorrowObserverRef.current.disconnect();
      if (upcomingObserverRef.current) upcomingObserverRef.current.disconnect();
    };
  }, []);

  // Set up observers for infinite scrolling
  useEffect(() => {
    setupObserver('today', todayEndRef, todayObserverRef);
    setupObserver('tomorrow', tomorrowEndRef, tomorrowObserverRef);
    setupObserver('upcoming', upcomingEndRef, upcomingObserverRef);
  }, [pagination]);

  const setupObserver = (section: 'today' | 'tomorrow' | 'upcoming', elementRef: React.RefObject<HTMLDivElement>, observerRef: React.MutableRefObject<IntersectionObserver | null>) => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && pagination[section].hasMore && !pagination[section].isLoading) {
        loadMoreAppointments(section);
      }
    }, { threshold: 0.5 });
    
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const doctorsResult = await fetchDoctors();
      if (doctorsResult.success && doctorsResult.data) {
        setDoctors(doctorsResult.data);
      }
      
      // Initial fetch for all sections
      await Promise.all([
        loadAppointmentsForSection('today', 1),
        loadAppointmentsForSection('tomorrow', 1),
        loadAppointmentsForSection('upcoming', 1)
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreAppointments = async (section: 'today' | 'tomorrow' | 'upcoming') => {
    setPagination(prev => ({
      ...prev,
      [section]: { ...prev[section], isLoading: true }
    }));
    
    const nextPage = pagination[section].page + 1;
    await loadAppointmentsForSection(section, nextPage);
    
    setPagination(prev => ({
      ...prev,
      [section]: { ...prev[section], page: nextPage, isLoading: false }
    }));
  };

  const loadAppointmentsForSection = async (section: 'today' | 'tomorrow' | 'upcoming', page: number) => {
    try {
      let type = section;
      if (section === 'tomorrow') {
        type = 'specific';
      }
      
      const pageSize = 10;
      const result = await fetchAppointments(page, pageSize, {
        type,
        ...(section === 'tomorrow' ? { 
          startDate: addDays(new Date(), 1),
          endDate: addDays(new Date(), 2)
        } : {})
      });
      
      if (result.success && result.data) {
        const appointments = result.data.appointments;
        const hasMore = appointments.length === pageSize;
        
        // Update state based on section
        if (section === 'today') {
          setTodayAppointments(prev => page === 1 ? appointments : [...prev, ...appointments]);
        } else if (section === 'tomorrow') {
          setTomorrowAppointments(prev => page === 1 ? appointments : [...prev, ...appointments]);
        } else if (section === 'upcoming') {
          setUpcomingAppointments(prev => page === 1 ? appointments : [...prev, ...appointments]);
        }
        
        // Update pagination state
        setPagination(prev => ({
          ...prev,
          [section]: { ...prev[section], hasMore }
        }));
      }
    } catch (error) {
      console.error(`Error loading ${section} appointments:`, error);
    }
  };

  const toggleSection = (section: 'today' | 'tomorrow' | 'upcoming') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleSaveAppointment = async (appointment: Appointment) => {
    try {
      if (appointment.id) {
        // Update existing appointment
        const result = await updateAppointment(appointment);
        if (result.success) {
          toast.success('Appointment updated successfully');
          refreshAppointments();
        } else {
          toast.error(result.error || 'Failed to update appointment');
        }
      } else {
        // Create new appointment
        const result = await createAppointment(appointment);
        if (result.success) {
          toast.success('Appointment created successfully');
          refreshAppointments();
        } else {
          toast.error(result.error || 'Failed to create appointment');
        }
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('An error occurred while saving the appointment');
    }
  };

  const refreshAppointments = () => {
    // Reset pagination and reload all sections
    setPagination({
      today: { page: 1, hasMore: true, isLoading: false },
      tomorrow: { page: 1, hasMore: true, isLoading: false },
      upcoming: { page: 1, hasMore: true, isLoading: false },
    });
    
    loadAppointmentsForSection('today', 1);
    loadAppointmentsForSection('tomorrow', 1);
    loadAppointmentsForSection('upcoming', 1);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-[#8B5C9E]/10 text-[#8B5C9E]';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    return (
      <div className="appointment-card bg-white rounded-lg shadow-sm p-4 mb-3 relative hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex flex-col sm:flex-row">
          <div className="time-badge mb-2 sm:mb-0 sm:mr-4 bg-[#8B5C9E]/10 text-[#8B5C9E] font-medium px-3 py-1.5 rounded-md inline-flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-1.5" />
            <span>{appointment.time}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
              <h3 className="font-medium text-gray-900 text-base mb-1 sm:mb-0">
                {appointment.patientName || 'Unknown Patient'}
              </h3>
              <div className="flex items-center gap-1.5 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-gray-100"
                  onClick={() => handleEditAppointment(appointment)}
                >
                  <Edit className="h-3.5 w-3.5 text-gray-500" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-sm">
              <div className="flex items-center text-gray-600">
                <CreditCard className="h-3.5 w-3.5 mr-1.5 text-[#8B5C9E]" />
                <span className="truncate">₹{appointment.doctor?.fee || '—'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-3.5 w-3.5 mr-1.5 text-[#8B5C9E]" />
                <span className="truncate">{appointment.phone || '—'}</span>
              </div>
              <div className="flex items-center text-gray-600 font-medium text-[#8B5C9E]">
                {appointment.doctor?.name || 'Unknown Doctor'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ 
    title, 
    count, 
    isExpanded, 
    onToggle 
  }: { 
    title: string; 
    count: number; 
    isExpanded: boolean; 
    onToggle: () => void;
  }) => (
    <div 
      className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm mb-3 cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="ml-2 px-2 py-0.5 bg-[#8B5C9E]/10 text-[#8B5C9E] rounded-full text-xs font-medium">
          {count}
        </span>
      </div>
      <Button variant="ghost" size="sm" className="p-1">
        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#8B5C9E]">Dashboard</h1>
          <Button 
            onClick={handleNewAppointment}
            className="bg-[#8B5C9E] hover:bg-[#7A4B8D] text-white flex items-center"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Appointment
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-[#8B5C9E] animate-spin mb-4" />
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today's Appointments */}
            <div>
              <SectionHeader 
                title="Today's Appointments" 
                count={todayAppointments.length} 
                isExpanded={expandedSections.today} 
                onToggle={() => toggleSection('today')} 
              />
              
              {expandedSections.today && (
                todayAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {todayAppointments.map(appointment => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                    <div ref={todayEndRef} className="h-4">
                      {pagination.today.isLoading && (
                        <div className="flex justify-center py-2">
                          <Loader2 className="h-5 w-5 text-[#8B5C9E] animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg">
                    <p className="text-gray-500">No appointments for today</p>
                  </div>
                )
              )}
            </div>

            {/* Tomorrow's Appointments */}
            <div>
              <SectionHeader 
                title="Tomorrow's Appointments" 
                count={tomorrowAppointments.length} 
                isExpanded={expandedSections.tomorrow} 
                onToggle={() => toggleSection('tomorrow')} 
              />
              
              {expandedSections.tomorrow && (
                tomorrowAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {tomorrowAppointments.map(appointment => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                    <div ref={tomorrowEndRef} className="h-4">
                      {pagination.tomorrow.isLoading && (
                        <div className="flex justify-center py-2">
                          <Loader2 className="h-5 w-5 text-[#8B5C9E] animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg">
                    <p className="text-gray-500">No appointments for tomorrow</p>
                  </div>
                )
              )}
            </div>

            {/* Upcoming Appointments */}
            <div>
              <SectionHeader 
                title="Upcoming Appointments" 
                count={upcomingAppointments.length} 
                isExpanded={expandedSections.upcoming} 
                onToggle={() => toggleSection('upcoming')} 
              />
              
              {expandedSections.upcoming && (
                upcomingAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingAppointments.map(appointment => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                    <div ref={upcomingEndRef} className="h-4">
                      {pagination.upcoming.isLoading && (
                        <div className="flex justify-center py-2">
                          <Loader2 className="h-5 w-5 text-[#8B5C9E] animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg">
                    <p className="text-gray-500">No upcoming appointments</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {isModalOpen && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          appointment={selectedAppointment}
          onSave={handleSaveAppointment}
          doctors={doctors}
          isNewAppointment={!selectedAppointment}
          selectedDate={selectedAppointment ? undefined : new Date()}
        />
      )}
    </div>
  );
} 