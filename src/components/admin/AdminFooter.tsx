import React from 'react';

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-4 px-4 border-t border-gray-200 bg-white text-center text-xs text-gray-500">
      <p>
        <span className="font-medium">Powered by</span> <a href="https://monkmantra.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">@monkmantra</a>
        <span className="mx-2">&bull;</span>
        <span>All Rights Reserved to Sports Orthopedics &copy; {currentYear}</span>
      </p>
    </footer>
  );
};

export default AdminFooter; 