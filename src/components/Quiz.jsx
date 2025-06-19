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
    if (fileHashes.length === 0) {
      setError('Veuillez sélectionner au moins un document.');
      return;
    }

    setIsLoading(true);
    setError('');
    setQuestions([]);

    try {
      const res = await axios.post('http://localhost:8000/quiz', {
        file_hashes: fileHashes,
        num_questions: parseInt(numQuestions),
        bloom_level: bloomLevel || null,
      });
      setQuestions(res.data.questions);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération du quiz.');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Générer un Quiz</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Documents</label>
        <select
          multiple
          value={fileHashes}
          onChange={(e) => setFileHashes(Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full p-2 border rounded mt-1"
          disabled={isLoading}
          size="5"
        >
          <option value="">Sélectionner un document</option>
          {documents.map((doc) => (
            <option key={doc.file_hash} value={doc.file_hash}>
              {doc.base_filename}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nombre de questions</label>
        <input
          type="number"
          min="1"
          max="10"
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          className="w-full p-2 border rounded mt-1"
          placeholder="Entrez le nombre de questions (1-10)"
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Niveau de Bloom (optionnel)</label>
        <select
          value={bloomLevel}
          onChange={(e) => setBloomLevel(e.target.value)}
          className="w-full p-2 border rounded mt-1"
          disabled={isLoading}
        >
          <option value="">Tous les niveaux</option>
          <option value="knowledge">Connaissance</option>
          <option value="comprehension">Compréhension</option>
          <option value="application">Application</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={fileHashes.length === 0 || isLoading}
        className={`p-2 rounded flex items-center justify-center gap-2 ${
          fileHashes.length === 0 || isLoading
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {isLoading ? (
          <>
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
          'Générer le Quiz'
        )}
      </button>

      {questions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Questions générées</h3>
          {questions.map((q, index) => (
            <div key={index} className="mb-6 p-4 border rounded bg-white shadow-sm">
              <p className="font-medium mb-2">
                {index + 1}. {q.question} ({q.bloom_level})
              </p>
              <ul className="list-disc pl-5">
                {q.options.map((option, optIndex) => (
                  <li key={optIndex} className="mb-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optIndex}
                        className="mr-2"
                        disabled
                      />
                      {option}
                      {optIndex === q.correct_answer && (
                        <span className="ml-2 text-green-500">(Correcte)</span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quiz;