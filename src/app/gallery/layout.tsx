import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Gallery | Sports Orthopedics Institute',
  description: 'Browse photos of our facilities, team, events, and procedures at Sports Orthopedics Institute, Bangalore.',
  openGraph: {
    title: 'Photo Gallery | Sports Orthopedics Institute',
    description: 'Explore our gallery showcasing our team, facilities, events, and procedures.',
    images: ['/images/team-hero.jpg'],
  }
};

export default function GalleryLayout({
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