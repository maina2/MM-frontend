import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      {/* Navbar (Desktop: Top, Mobile: Top + Bottom) */}
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar (Desktop Only) */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Main Content */}
        <div className="flex-1 p-4 md:pl-72 md:p-8 pb-16 md:pb-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;