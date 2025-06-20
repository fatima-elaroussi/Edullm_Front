import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BookOpen, 
  FileText,
  Settings,
  BarChart3,
  Shield,
  X
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onToggle, user }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard Admin' },
    { path: '/admin/users', icon: Users, label: 'Gestion Utilisateurs' },
    { path: '/admin/resources', icon: BookOpen, label: 'Gestion Ressources' },
    { path: '/admin/documents', icon: FileText, label: 'Gestion Documents' },
    { path: '/admin/statistics', icon: BarChart3, label: 'Statistiques' },
    { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
          </div>
          <button 
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-800 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-6 py-3 text-sm font-medium transition-colors duration-150
                  ${isActive 
                    ? 'bg-blue-600 text-white border-r-2 border-blue-400' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
                onClick={() => window.innerWidth < 1024 && onToggle()}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <div className="text-sm text-gray-300">
            <p className="font-medium">{user?.username}</p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
