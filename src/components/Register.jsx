import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

import {
  Brain,
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  BookOpen,
  Calendar
} from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileId, setProfileId] = useState('');
  const [filiereId, setFiliereId] = useState('');
  const [annee, setAnnee] = useState('');
  const [filieres, setFilieres] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const { data } = await axios.get('http://localhost:8000/filieres');
        setFilieres(data);
      } catch {
        toast.error('Erreur lors du chargement des filières.');
      }
    };
    fetchFilieres();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!username || !password || !profileId) {
        toast.error('Veuillez remplir tous les champs requis.');
        return;
      }

      const payload = {
        username,
        password,
        profile_id: parseInt(profileId, 10)
      };

      const parsedFiliere = parseInt(filiereId, 10);
      if (!isNaN(parsedFiliere)) payload.filiere_id = parsedFiliere;
      if (annee.trim()) payload.annee = annee;

      if (
        payload.profile_id === 3 &&
        (isNaN(parsedFiliere) || !annee.trim())
      ) {
        toast.error('Filière et année scolaire requises pour les étudiants.');
        return;
      }

      const { data } = await axios.post(
        'http://localhost:8000/register',
        payload
      );

      if (data.status === 'success') {
        toast.success('Inscription réussie !');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Créer un compte EduLLM
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Assistant IA d'aide à l'apprentissage
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            {/* Username */}
            <div className="relative">
              <User className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Profile */}
            <div className="relative">
              <Shield className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400" />
              <select
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un profil</option>
                <option value="1">Admin</option>
                <option value="2">Professeur</option>
                <option value="3">Étudiant</option>
              </select>
            </div>

            {/* Filière + Année scolaire (grouped in same row) */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filière */}
              <div className="relative flex-1">
                <BookOpen className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400" />
                <select
                  value={filiereId}
                  onChange={(e) => setFiliereId(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={parseInt(profileId, 10) !== 3}
                >
                  <option value="">Sélectionner une filière</option>
                  {filieres.map((fil) => (
                    <option key={fil.id} value={fil.id}>
                      {fil.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Année scolaire */}
              <div className="relative flex-1">
                <Calendar className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Année scolaire"
                  value={annee}
                  onChange={(e) => setAnnee(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={parseInt(profileId, 10) !== 3}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Inscription…
                </div>
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>

          {/* Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <a
                href="/"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Se connecter
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
