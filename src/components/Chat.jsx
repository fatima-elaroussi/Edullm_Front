import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Chat = ({ user, setUser }) => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // ✅ État de chargement
  const [departementId, setDepartementId] = useState('');
  const [filiereId, setFiliereId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [activiteId, setActiviteId] = useState('');
  const [departements, setDepartements] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [modules, setModules] = useState([]);
  const [activites, setActivites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const depRes = await axios.get('http://localhost:8000/departements');
        setDepartements(depRes.data);
        const filRes = await axios.get('http://localhost:8000/filieres');
        setFilieres(filRes.data);
        const modRes = await axios.get('http://localhost:8000/modules');
        setModules(modRes.data);
        const actRes = await axios.get('http://localhost:8000/activites');
        setActivites(actRes.data);
      } catch (error) {
        setError('Erreur lors du chargement des ressources.');
      }
    };
    fetchResources();
  }, []);

  const handleSubmit = async () => {
    // ✅ Validation avant de commencer le chargement
    if (!message || !departementId || !filiereId || !moduleId || !activiteId) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (!user || !user.profile_id || !user.user_id) {
      setError('Utilisateur non authentifié.');
      navigate('/');
      return;
    }

    setIsLoading(true); // ✅ Activer le chargement
    setError(''); // ✅ Réinitialiser les erreurs

    const payload = {
      message,
      departement_id: parseInt(departementId),
      filiere_id: parseInt(filiereId),
      module_id: parseInt(moduleId),
      activite_id: parseInt(activiteId),
      profile_id: user.profile_id,
      user_id: user.user_id
    };

    console.log("Données envoyées au serveur :", payload);

    try {
      const response = await axios.post('http://localhost:8000/chat', payload);
      setResponse(response.data.response);
    } catch (error) {
      console.error('Chat error:', error);
      setError(
        error.response?.data?.detail
          ? `Erreur : ${error.response.data.detail}`
          : 'Erreur : Impossible de contacter le serveur.'
      );
    } finally {
      setIsLoading(false); // ✅ Désactiver le chargement dans tous les cas
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Chat</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 rounded"
        >
          Déconnexion
        </button>
      </div>
      <select
        value={departementId}
        onChange={(e) => setDepartementId(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        disabled={isLoading} // ✅ Désactiver pendant le chargement
      >
        <option value="">Sélectionner un département</option>
        {departements.map(dep => (
          <option key={dep.id} value={dep.id}>{dep.nom}</option>
        ))}
      </select>
      <select
        value={filiereId}
        onChange={(e) => setFiliereId(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        disabled={isLoading} // ✅ Désactiver pendant le chargement
      >
        <option value="">Sélectionner une filière</option>
        {filieres.map(fil => (
          <option key={fil.id} value={fil.id}>{fil.nom}</option>
        ))}
      </select>
      <select
        value={moduleId}
        onChange={(e) => setModuleId(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        disabled={isLoading} // ✅ Désactiver pendant le chargement
      >
        <option value="">Sélectionner un module</option>
        {modules.map(mod => (
          <option key={mod.id} value={mod.id}>{mod.nom}</option>
        ))}
      </select>
      <select
        value={activiteId}
        onChange={(e) => setActiviteId(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        disabled={isLoading} // ✅ Désactiver pendant le chargement
      >
        <option value="">Sélectionner une activité</option>
        {activites.map(act => (
          <option key={act.id} value={act.id}>{act.nom}</option>
        ))}
      </select>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Entrez votre message..."
        className="w-full p-2 mb-4 border rounded"
        disabled={isLoading} // ✅ Désactiver pendant le chargement
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading} // ✅ Désactiver le bouton pendant le chargement
        className={`p-2 rounded flex items-center justify-center gap-2 ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {isLoading ? (
          <>
            {/* ✅ Icône de rechargement animée */}
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Génération en cours...
          </>
        ) : (
          'Envoyer'
        )}
      </button>
      {response && <p className="mt-4">Réponse : {response}</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default Chat;