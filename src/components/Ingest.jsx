import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

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
        setMessage('❌ Erreur lors du chargement des ressources.');
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
        setMessage('❌ Erreur : Informations utilisateur manquantes.');
        return;
      }
      if (!file) {
        setMessage('❌ Erreur : Aucun fichier sélectionné.');
        return;
      }
      if (!departementId || !filiereId || !moduleId || !activiteId) {
        setMessage('❌ Erreur : Veuillez sélectionner toutes les options.');
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

      setMessage(`✅ ${response.data.message || 'Fichier indexé avec succès.'}`);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.detail
          ? `❌ Erreur : ${error.response.data.detail}`
          : '❌ Erreur : Impossible de charger le fichier.'
      );
    }
  };

  const renderSelect = (label, value, setValue, options) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      >
        <option value="">Sélectionner un {label.toLowerCase()}</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.nom}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className=" flex items-center justify-center p-6">
      <div className="min-h-screen bg-white shadow-xl rounded-3xl p-8 w-full max-w-7xl">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <CloudArrowUpIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">Charger un document</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fichier</label>
            <input
              type="file"
              accept=".pdf,.txt,.docx,.json"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          {renderSelect('Département', departementId, setDepartementId, departements)}
          {renderSelect('Filière', filiereId, setFiliereId, filieres)}
          {renderSelect('Module', moduleId, setModuleId, modules)}
          {renderSelect('Activité', activiteId, setActiviteId, activites)}
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-semibold transition duration-300 shadow"
        >
          🚀 Lancer l’indexation
        </button>

        {message && (
          <div
            className={`mt-6 p-4 text-sm rounded-xl transition-all duration-300 ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ingest;
