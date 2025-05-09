import { useState } from 'react';
import { Outlet } from 'react-router-dom';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Add sidebar and navbar components */}
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;