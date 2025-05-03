'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Users,
  Clock,
  BarChart2,
  Settings,
  Menu,
  X,
  LogOut,
  CalendarRange,
  CalendarClock,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import AdminFooter from '@/components/admin/AdminFooter';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart2 },
  { href: '/admin/doctors', label: 'Doctors', icon: Users },
  { href: '/admin/schedule', label: 'Schedule', icon: Calendar },
  { href: '/admin/appointments', label: 'Appointments', icon: Clock },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/content', label: 'Content', icon: FileText, hideOnMobile: true },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon, hideOnMobile: true }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  
  // Check if current page is login page
  const isLoginPage = pathname === '/admin/login';

  // Handle sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Logout failed');

      // Clear any client-side state
      router.push('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // If this is the login page, render a simplified layout without the sidebar
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Simple header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <h1 className="text-xl font-bold text-[#8B5C9E]">Sports Orthopedics Admin</h1>
        </header>
        
        {/* Main content */}
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
        
        {/* Admin Footer */}
        <AdminFooter />
      </div>
    );
  }

  // Regular admin layout with sidebar for authenticated pages
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-30 h-screen w-[250px] bg-white border-r border-gray-200',
          'transform transition-transform duration-200 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 flex-shrink-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-lg font-bold text-[#8B5C9E]">Admin Panel</h1>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation - Fixed height with own scrollbar */}
          <div className="flex-grow flex flex-col h-[calc(100vh-64px-60px)] overflow-hidden">
            <nav className="flex-grow overflow-y-auto py-4">
              <ul className="space-y-1 px-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  
                  // Skip items marked as hideOnMobile on small screens
                  if (item.hideOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
                    return null;
                  }
                  
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[#8B5C9E] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Logout Button - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 md:hidden bg-white border-b border-gray-200 flex-shrink-0 h-16">
          <div className="flex items-center justify-between h-full px-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-lg font-semibold text-[#8B5C9E]">Admin Panel</h1>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </header>

        {/* Page Content Area */}
        <main className="flex-1 overflow-auto w-full h-[calc(100vh-4rem-2.5rem)] md:h-[calc(100vh-2.5rem)]">
          {children}
        </main>

        {/* Admin Footer */}
        <AdminFooter />
      </div>
    </div>
  );
} 