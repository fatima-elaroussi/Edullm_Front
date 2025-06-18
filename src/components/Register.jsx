import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileId, setProfileId] = useState('');
  const [filiereId, setFiliereId] = useState('');
  const [annee, setAnnee] = useState('');
  const [error, setError] = useState('');
  const [filieres, setFilieres] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const response = await axios.get('http://localhost:8000/filieres');
        setFilieres(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des filières.');
      }
    };
    fetchFilieres();
  }, []);

  const handleRegister = async () => {
    try {
      const payload = {
        username,
        password,
        profile_id: parseInt(profileId),
      };

      const parsedFiliere = parseInt(filiereId);
      if (!isNaN(parsedFiliere)) {
        payload.filiere_id = parsedFiliere;
      }

      if (annee.trim() !== '') {
        payload.annee = annee;
      }

      if (parseInt(profileId) === 3 && (isNaN(parsedFiliere) || !annee.trim())) {
        setError('Filière et année scolaire sont requises pour les étudiants.');
        return;
      }

      const response = await axios.post('http://localhost:8000/register', payload);

      if (response.data.status === 'success') {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">Inscription</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <select
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="">Sélectionner un profil</option>
          <option value="1">Admin</option>
          <option value="2">Professeur</option>
          <option value="3">Étudiant</option>
        </select>
        <select
          value={filiereId}
          onChange={(e) => setFiliereId(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          disabled={parseInt(profileId) !== 3} // Disable for non-students
        >
          <option value="">Sélectionner une filière</option>
          {filieres.map(fil => (
            <option key={fil.id} value={fil.id}>{fil.nom}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Année scolaire"
          value={annee}
          onChange={(e) => setAnnee(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          disabled={parseInt(profileId) !== 3} // Disable for non-students
        />
        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          S'inscrire
        </button>
        <p className="mt-4">
          Déjà un compte ? <a href="/" className="text-blue-500">Se connecter</a>
        </p>
      </div>
    </div>
  );
};

export default Register;