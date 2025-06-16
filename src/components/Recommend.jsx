import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Recommend = ({ user }) => {
  const [filiereId, setFiliereId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [filieres, setFilieres] = useState([]);
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const filRes = await axios.get('http://localhost:8000/filieres');
        setFilieres(filRes.data);
        const modRes = await axios.get('http://localhost:8000/modules');
        setModules(modRes.data);
      } catch (err) {
        setError('Erreur lors du chargement des ressources.');
      }
    };
    fetchResources();
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await axios.get('http://localhost:8000/recommend', {
        params: {
          user_id: user.user_id,
          filiere_id: parseInt(filiereId),
          module_id: parseInt(moduleId),
        },
      });
      setResources(res.data.resources);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la récupération des recommandations.');
      setResources([]);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Recommandations de Ressources</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Filière</label>
        <select
          value={filiereId}
          onChange={(e) => setFiliereId(e.target.value)}
          className="w-full p-2 border rounded mt-1"
        >
          <option value="">Sélectionner une filière</option>
          {filieres.map((fil) => (
            <option key={fil.id} value={fil.id}>
              {fil.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Module</label>
        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="w-full p-2 border rounded mt-1"
        >
          <option value="">Sélectionner un module</option>
          {modules.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.nom}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={!filiereId || !moduleId}
      >
        Obtenir des recommandations
      </button>

      {resources.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Ressources recommandées</h3>
          <ul className="list-disc pl-5">
            {resources.map((resource, index) => (
              <li key={index} className="mb-2">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {resource.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Recommend;