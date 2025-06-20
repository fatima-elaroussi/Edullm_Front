import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Summarize = ({ user }) => {
  const [fileHashes, setFileHashes] = useState([]);
  const [level, setLevel] = useState('simplified');
  const [summary, setSummary] = useState('');
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* -------------------------------------------------------------- */
  /* Chargement des documents ingérés                               */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get('http://localhost:8000/ingested', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setDocuments(res.data);
      } catch (err) {
        setError('❌ Erreur lors du chargement des documents.');
      }
    };
    fetchDocuments();
  }, [user?.token]);

  /* -------------------------------------------------------------- */
  /* Soumission                                                     */
  /* -------------------------------------------------------------- */
  const handleSubmit = async () => {
    if (fileHashes.length === 0) {
      setError('❗ Veuillez sélectionner au moins un document.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await axios.post(
        'http://localhost:8000/summarize',
        { file_hashes: fileHashes, level },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setSummary(res.data.summary);
    } catch (error) {
      setError(
        '❌ Erreur : ' +
          (error.response?.data?.detail || 'Impossible de contacter le serveur.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------------------- */
  /* Sélection / désélection                                        */
  /* -------------------------------------------------------------- */
  const toggleDocumentSelection = (hash) => {
    setFileHashes((prev) =>
      prev.includes(hash) ? prev.filter((h) => h !== hash) : [...prev, hash]
    );
  };

  /* =============================== UI ============================ */
  return (
    <div className="bg-gradient-to-br from-gray-100 to-white p-6 flex items-center justify-center">
      <div className="min-h-screen w-full max-w-7xl bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">📄 Générer un résumé</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* ---------------------------------------------------------- */}
        {/* Documents sélectionnés                                     */}
        {/* ---------------------------------------------------------- */}
        <div className="mb-5">
          <label className="text-gray-700 font-medium mb-1 block">
            Documents sélectionnés :
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {fileHashes.length > 0 ? (
              fileHashes.map((hash) => {
                const doc = documents.find((d) => d.file_hash === hash);
                return (
                  <span
                    key={hash}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full shadow"
                  >
                    {doc?.filename || hash}
                  </span>
                );
              })
            ) : (
              <span className="text-gray-400">Aucun document sélectionné</span>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition shadow"
          >
            📁 Sélectionner les documents
          </button>
        </div>

        {/* Niveau de détail ---------------------------------------- */}
        <div className="mb-5">
          <label className="text-gray-700 font-medium mb-1 block">
            🎯 Niveau de détail
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            disabled={isLoading}
          >
            <option value="simplified">Simplifié</option>
            <option value="detailed">Détaillé</option>
          </select>
        </div>

        {/* Bouton générer ----------------------------------------- */}
        <button
          onClick={handleSubmit}
          disabled={fileHashes.length === 0 || isLoading}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-white transition ${
            fileHashes.length === 0 || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="white"
                  d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"
                />
              </svg>
              Génération en cours...
            </>
          ) : (
            '🤖 Générer le résumé'
          )}
        </button>

        {/* Résumé -------------------------------------------------- */}
        {summary && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              💬 Assistant IA :
            </h3>
            <div className="bg-blue-100 text-gray-800 px-5 py-4 rounded-2xl whitespace-pre-wrap shadow-inner relative">
              <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
                ChatBot
              </div>
              <p className="text-base">{summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Modal sélection documents                                  */}
      {/* ---------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              📂 Sélectionnez vos documents
            </h3>
            <div className="max-h-60 overflow-y-auto border rounded p-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <label
                    key={doc.file_hash}
                    className="block cursor-pointer mb-2 text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={fileHashes.includes(doc.file_hash)}
                      onChange={() => toggleDocumentSelection(doc.file_hash)}
                      className="mr-2"
                    />
                    {doc.filename}
                  </label>
                ))
              ) : (
                <p className="text-gray-500">Aucun document disponible.</p>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summarize;
