import React from 'react';

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-4 px-4 border-t border-gray-200 bg-white text-center text-xs text-gray-500">
      <p>
        powered by <span className="font-medium">@monkmantra</span> &bull; all rights reserved to Sports Orthopedics &copy; {currentYear}
      </p>
    </footer>
  );
};

export default AdminFooter; 