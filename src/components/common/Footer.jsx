import React from 'react';
import { Brain } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6" />
            <span className="text-lg font-semibold">EduLLM</span>
          </div>
        </div>
        <div className="mt-4 text-center text-gray-400">
          <p>&copy; 2025 EduLLM. Assistant IA d'Aide à l'Apprentissage.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;