import { Metadata } from 'next';
import { ReactNode } from 'react';

// Metadata moved from page.tsx
export const metadata: Metadata = {
  title: 'Bone & Joint School | Educational Resources',
  description: 'Explore comprehensive information on various orthopedic conditions, treatments, and recovery strategies in our bone and joint educational center.',
  openGraph: {
    title: 'Bone & Joint School | Sports Orthopedics Institute',
    description: 'Learn about orthopedic conditions and treatments from expert medical professionals.',
    images: ['/images_bone_joint/analyzing-spine-structure.webp'],
  }
};

export default function BoneJointSchoolLayout({ children }: { children: ReactNode }) {
  return <>{children}</>; // Basic layout wrapper
} 