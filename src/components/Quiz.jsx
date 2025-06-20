import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Quiz = ({ user }) => {
  const [fileHashes, setFileHashes] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [bloomLevel, setBloomLevel] = useState('');
  const [questions, setQuestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les documents ingérés
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

  const handleSubmit = async () => {
    if (fileHashes.length === 0) {
      setError('❗ Veuillez sélectionner au moins un document.');
      return;
    }

    setIsLoading(true);
    setError('');
    setQuestions([]);

    try {
      const res = await axios.post(
        'http://localhost:8000/quiz',
        {
          file_hashes: fileHashes,
          num_questions: parseInt(numQuestions),
          bloom_level: bloomLevel || null
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setQuestions(res.data.questions);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération du quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDocumentSelection = (hash) => {
    setFileHashes((prev) =>
      prev.includes(hash) ? prev.filter((h) => h !== hash) : [...prev, hash]
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-white p-6 flex items-center justify-center">
      <div className="min-h-screen w-full max-w-7xl bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">📚 Générer un Quiz</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Documents sélectionnés */}
        <div className="mb-5">
          <label className="text-gray-700 font-medium mb-1 block">Documents sélectionnés :</label>
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            📁 Sélectionner les documents
          </button>
        </div>

        {/* Nombre de questions */}
        <div className="mb-5">
          <label className="text-gray-700 font-medium mb-1 block">🔢 Nombre de questions</label>
          <input
            type="number"
            min="1"
            max="10"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Entrez le nombre de questions (1-10)"
            disabled={isLoading}
          />
        </div>

        {/* Niveau de Bloom */}
        <div className="mb-5">
          <label className="text-gray-700 font-medium mb-1 block">
            🎯 Niveau de Bloom (optionnel)
          </label>
          <select
            value={bloomLevel}
            onChange={(e) => setBloomLevel(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            disabled={isLoading}
          >
            <option value="">Tous les niveaux</option>
            <option value="knowledge">Connaissance</option>
            <option value="comprehension">Compréhension</option>
            <option value="application">Application</option>
          </select>
        </div>

        {/* Bouton de génération */}
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
            '🤖 Générer le Quiz'
          )}
        </button>

        {/* Questions générées */}
        {questions.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold mb-4">💬 Questions générées :</h3>
            {questions.map((q, index) => (
              <div
                key={index}
                className="bg-blue-100 text-gray-800 px-5 py-4 rounded-2xl shadow-inner relative"
              >
                <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
                  QuizBot
                </div>
                <p className="font-semibold mb-2">
                  {index + 1}. {q.question}{' '}
                  <span className="text-sm text-gray-500">({q.bloom_level})</span>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {q.options.map((option, i) => (
                    <li key={i} className="flex items-center">
                      <input type="radio" disabled className="mr-2" />
                      {option}
                      {i === q.correct_answer && (
                        <span className="ml-2 text-green-500 font-medium">(Correcte)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de sélection des documents */}
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

export default Quiz;
