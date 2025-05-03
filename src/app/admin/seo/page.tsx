'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SEORedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/admin/seo/page');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-6">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p>Please wait while we redirect you to the SEO management page.</p>
      </div>
    </div>
  );
} 