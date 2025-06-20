import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, Users } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EduLLM</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
              Connexion
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              S'inscrire
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
