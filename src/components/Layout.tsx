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
    <div className="min-h-screen bg-neutral flex">
      {/* Sidebar (Desktop: Fixed, Mobile: Overlay) */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar (Desktop: Top, Mobile: Bottom) */}
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Content Area */}
        <main className="flex-1 p-6 md:ml-64 md:p-8 pb-16 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;