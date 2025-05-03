// Special layout for login page - completely isolated from admin layout
// This prevents the admin sidebar from appearing on the login page

'use client';

import React from 'react';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      
      {/* Simple footer */}
      <footer className="py-4 px-6 border-t border-gray-200 bg-white text-center text-xs text-gray-500">
        <p>
          powered by <span className="font-medium">@monkmantra</span> &bull; all rights reserved to Sports Orthopedics
        </p>
      </footer>
    </div>
  );
} 