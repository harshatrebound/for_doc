'use client';

// Import the HomePage component from the /homepage route
import HomePage from './homepage/page';

// Root page component that simply renders the HomePage component
export default function RootPage() {
  // Re-use the HomePage component for the root route
  return <HomePage />;
}
