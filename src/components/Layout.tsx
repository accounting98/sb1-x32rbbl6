import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div
        className={`fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity duration-150 ease-in-out ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-150 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1">
        <Navbar openSidebar={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;