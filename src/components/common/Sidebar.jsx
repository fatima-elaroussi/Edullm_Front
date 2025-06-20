import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  Upload, 
  FileText, 
  HelpCircle, 
  Star,
  FolderOpen,
  User,
  BarChart3,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle, user }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/app', icon: Home, label: 'Tableau de bord' },
    { path: '/app/chat', icon: MessageCircle, label: 'Chat IA' },
    { path: '/app/ingest', icon: Upload, label: 'Importer documents' },
    { path: '/app/documents', icon: FolderOpen, label: 'Mes documents' },
    { path: '/app/summarize', icon: FileText, label: 'Résumer' },
    { path: '/app/quiz', icon: HelpCircle, label: 'Quiz' },
    { path: '/app/recommend', icon: Star, label: 'Recommandations' },
    { path: '/app/statistics', icon: BarChart3, label: 'Statistiques' },
    { path: '/app/profile', icon: User, label: 'Profil' },
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
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
          <button 
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
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
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            <p className="font-medium">{user?.username}</p>
            <p className="text-xs text-gray-500">
              {user?.profile_id === 1 ? 'Étudiant' : 
               user?.profile_id === 2 ? 'Enseignant' : 'Administrateur'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;