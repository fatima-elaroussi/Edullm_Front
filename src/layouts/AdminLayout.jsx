import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import TopBar from '../components/common/TopBar';
import Breadcrumb from '../components/common/Breadcrumb';

const AdminLayout = ({ user, setUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          user={user} 
          setUser={setUser}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          isAdmin={true}
        />
        
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-4">
            <Breadcrumb />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;