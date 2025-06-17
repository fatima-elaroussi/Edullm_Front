import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Summarize = ({ user }) => {
  const [fileHash, setFileHash] = useState('');
  const [level, setLevel] = useState('simplified');
  const [summary, setSummary] = useState('');
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // ✅ État de chargement

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get('http://localhost:8000/ingested');
        setDocuments(res.data);
      } catch (err) {
        setError('Erreur lors du chargement des documents.');
      }
    };
    fetchDocuments();
  }, []);

  const handleSubmit = async () => {
    if (!fileHash) {
      setError('Veuillez sélectionner un document.');
      return;
    }

    setIsLoading(true); // ✅ Activer le chargement
    setError(''); // ✅ Réinitialiser les erreurs
    setSummary(''); // ✅ Réinitialiser le résumé précédent

    try {
      const res = await axios.post('http://localhost:8000/summarize', {
        file_hash: fileHash,
        level
      });
      setSummary(res.data.summary);
    } catch (error) {
      setError('Erreur : ' + (error.response?.data?.detail || 'Impossible de contacter le serveur.'));
      setSummary('');
    } finally {
      setIsLoading(false); // ✅ Désactiver le chargement dans tous les cas
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Résumer un document</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Document</label>
        <select
          value={fileHash}
          onChange={(e) => setFileHash(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={isLoading} // ✅ Désactiver pendant le chargement
        >
          <option value="">Sélectionner un document</option>
          {documents.map(doc => (
            <option key={doc.file_hash} value={doc.file_hash}>
              {doc.base_filename}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de détail</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={isLoading} // ✅ Désactiver pendant le chargement
        >
          <option value="simplified">Simplifié</option>
          <option value="detailed">Détaillé</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!fileHash || isLoading} // ✅ Désactiver si pas de fichier ou en chargement
        className={`p-2 rounded flex items-center justify-center gap-2 ${
          !fileHash || isLoading
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
          'Générer le résumé'
        )}
      </button>

      {summary && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <h3 className="text-lg font-semibold mb-3">Résumé généré :</h3>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summarize;