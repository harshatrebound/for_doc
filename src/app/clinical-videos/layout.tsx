import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clinical Videos | Sports Orthopedics Institute',
  description: 'Watch clinical videos from Sports Orthopedics, Bangalore, featuring expert treatments, surgical procedures, and patient recovery insights.',
  openGraph: {
    title: 'Clinical Videos | Sports Orthopedics',
    description: 'Watch educational videos on orthopedic conditions, treatments, and surgical procedures.',
    images: ['/images/team-hero.jpg'],
  }
};

export default function ClinicalVideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 