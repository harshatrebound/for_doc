// Import the HomePage component from the /homepage route
import HomePage from './homepage/page';

// Root page component that simply renders the static HomePage component
export default function RootPage() {
  // Re-use the HomePage component for the root route (keeping it static)
  return <HomePage />;
}
