'use client';

export default function DashboardRedirect() {
  // Use a simple script to redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to dashboard...</p>
      <script 
        dangerouslySetInnerHTML={{ 
          __html: `window.location.href = '/admin';` 
        }}
      />
    </div>
  );
} 