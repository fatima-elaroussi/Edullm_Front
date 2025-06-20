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
        setError('❌ Erreur lors du chargement des ressources.');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white py-10 px-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">📚 Recommandations de Ressources</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Filière */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-1">🎓 Filière</label>
          <select
            value={filiereId}
            onChange={(e) => setFiliereId(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Sélectionner une filière</option>
            {filieres.map((fil) => (
              <option key={fil.id} value={fil.id}>
                {fil.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Module */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">📘 Module</label>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
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
          disabled={!filiereId || !moduleId}
          className={`w-full py-3 rounded-xl font-semibold text-white transition ${
            !filiereId || !moduleId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          🤖 Obtenir des recommandations
        </button>

        {/* Bot-style Response */}
        {resources.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">💡 Recommandations de QuizBot</h3>
            <div className="space-y-4">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-blue-100 px-5 py-4 rounded-2xl shadow-inner text-gray-800 relative"
                >
                  <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
                    QuizBot
                  </div>
                  <p className="text-sm font-medium">
                    📎 <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {resource.title}
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommend;
