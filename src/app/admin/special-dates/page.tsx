'use client';

import React from 'react';
import GlobalSpecialDatesManager from '@/components/admin/GlobalSpecialDatesManager'; // We will create this component next

export default function SpecialDatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Special Dates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add or remove global holidays or closure dates that apply to all doctors.
          </p>
        </div>
        <GlobalSpecialDatesManager />
      </div>
    </div>
  );
} 