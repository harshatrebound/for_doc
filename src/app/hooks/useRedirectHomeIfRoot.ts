'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * This hook redirects users from the root path (/) to the homepage path (/homepage)
 */
export function useRedirectRootToHome() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/') {
      router.push('/homepage');
    }
  }, [pathname, router]);
}

/**
 * This hook redirects users from the homepage path (/homepage) to the root path (/)
 */
export function useRedirectHomeToRoot() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/homepage') {
      router.push('/');
    }
  }, [pathname, router]);
} 