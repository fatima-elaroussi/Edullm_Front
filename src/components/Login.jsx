import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// A simple lock icon component to add a bit of visual flair.
const LockIcon = () => (
  <svg
    className="w-6 h-6 mr-2 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    ></path>
  </svg>
);

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    // Prevent form submission if it was a form element
    e.preventDefault();

    // Basic validation to prevent empty submissions
    if (!username || !password) {
      setError('Veuillez saisir le nom d\'utilisateur et le mot de passe.');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8000/login', {
        username,
        password,
      });
      setUser(response.data.user_info);
      navigate('/chat');
    } catch (err) {
      setError('Nom d\'utilisateur ou mot de passe incorrect.');
    }
  };

  return (
    // Main container with a soft background color
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Login form container with enhanced styling */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        {/* Header */}
        <div className="flex items-center justify-center">
          <LockIcon />
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Connexion
          </h2>
        </div>

        {/* Form element for better semantics and accessibility */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Error message display */}
          {error && (
            <p className="px-3 py-2 text-sm font-medium text-center text-red-700 bg-red-100 rounded-lg">
              {error}
            </p>
          )}

          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="text-sm font-semibold text-gray-600"
            >
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              placeholder="Saisissez votre nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mt-1 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-gray-600"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="Saisissez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
              required
            />
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              className="w-full p-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
              Se connecter
            </button>
          </div>
          
          <hr className="border-gray-300" />
          
          {/* Link to Registration */}
          <p className="text-sm text-center text-gray-600">
            Pas de compte ?{' '}
            <a
              href="/register"
              className="font-semibold text-indigo-600 hover:underline"
            >
              S'inscrire
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;