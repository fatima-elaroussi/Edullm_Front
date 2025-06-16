import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Ingest = ({ user, setUser }) => {
  const [file, setFile] = useState(null);
  const [baseFilename, setBaseFilename] = useState('');
  const [departementId, setDepartementId] = useState('');
  const [filiereId, setFiliereId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [activiteId, setActiviteId] = useState('');
  const [departements, setDepartements] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [modules, setModules] = useState([]);
  const [activites, setActivites] = useState([]);
  const [message, setMessage] = useState('');
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
        setMessage('Erreur lors du chargement des ressources.');
      }
    };
    fetchResources();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setBaseFilename(e.target.files[0]?.name || '');
  };

  const handleSubmit = async () => {
    try {
      if (!user || !user.profile_id || !user.user_id) {
        setMessage('Erreur : Informations utilisateur manquantes.');
        return;
      }
      if (!file) {
        setMessage('Erreur : Aucun fichier sélectionné.');
        return;
      }
      if (!departementId || !filiereId || !moduleId || !activiteId) {
        setMessage('Erreur : Veuillez sélectionner toutes les options.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('departement_id', parseInt(departementId));
      formData.append('filiere_id', parseInt(filiereId));
      formData.append('module_id', parseInt(moduleId));
      formData.append('activite_id', parseInt(activiteId));
      formData.append('profile_id', user.profile_id);
      formData.append('user_id', user.user_id);

      const response = await axios.post('http://localhost:8000/ingest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message || 'Fichier indexé avec succès.');
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.detail
          ? `Erreur : ${error.response.data.detail}`
          : 'Erreur : Impossible de charger le fichier.'
      );
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
        <h2 className="text-2xl">Charger un document</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 rounded"
        >
          Déconnexion
        </button>
      </div>
      <input
        type="file"
        accept=".pdf,.txt,.docx,.json"
        onChange={handleFileChange}
        className="mb-4"
      />
      <select
        value={departementId}
        onChange={(e) => setDepartementId(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
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
      >
        <option value="">Sélectionner une activité</option>
        {activites.map(act => (
          <option key={act.id} value={act.id}>{act.nom}</option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Charger
      </button>
      <p className="mt-4">{message}</p>
    </div>
  );
};

export default Ingest;