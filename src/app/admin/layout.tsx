'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Calendar, 
  Users, 
  Clock, 
  Settings, 
  BarChart2,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ADMIN_EMAIL = 'admin@bookingpress.com';

const navigation = [
  {
    name: 'Schedule Management',
    href: '/admin/schedules',
    icon: Calendar
  },
  {
    name: 'Doctor Management',
    href: '/admin/doctors',
    icon: Users
  },
  {
    name: 'Appointments',
    href: '/admin/appointments',
    icon: Clock
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart2
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Logout failed');

      router.push('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-md text-gray-600 hover:text-[#8B5C9E] transition-colors"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-[#8B5C9E]">
                  BookingPress
                </h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-[#8B5C9E] text-white'
                          : 'text-gray-600 hover:bg-[#8B5C9E]/5 hover:text-[#8B5C9E]'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile & Logout */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#8B5C9E]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#8B5C9E]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Admin</p>
                      <p className="text-xs text-gray-600">{ADMIN_EMAIL}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="p-2 rounded-lg text-gray-600 hover:text-[#8B5C9E] hover:bg-[#8B5C9E]/5 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'lg:pl-64' : ''} transition-all duration-300`}>
        {children}
      </div>
    </div>
  );
} 