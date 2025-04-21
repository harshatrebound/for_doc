import { Metadata } from 'next';
import { ReactNode } from 'react';

// Metadata moved from page.tsx
export const metadata: Metadata = {
  title: 'Surgeons & Staff | Sports Orthopedics Institute',
  description: 'Meet our team of experienced surgeons and staff at Sports Orthopedics Institute. We provide exceptional orthopedic care with a focus on sports injuries.',
  openGraph: {
    title: 'Surgeons & Staff | Sports Orthopedics Institute',
    description: 'Meet our expert team of orthopedic surgeons and supporting staff.',
    images: ['/images/team-hero.jpg'],
  }
};

export default function SurgeonsStaffLayout({ children }: { children: ReactNode }) {
  return <>{children}</>; // Basic layout wrapper
} 