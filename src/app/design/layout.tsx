import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design System | Doctor Booking App',
  description: 'Design guidelines and components for building consistent interfaces in our doctor booking application.',
};

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 