import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Quiz = ({ user }) => {
  const [fileHash, setFileHash] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [bloomLevel, setBloomLevel] = useState('');
  const [questions, setQuestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');

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
    try {
      const res = await axios.post('http://localhost:8000/quiz', {
        file_hash: fileHash,
        num_questions: parseInt(numQuestions),
        bloom_level: bloomLevel || null,
      });
      setQuestions(res.data.questions);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération du quiz.');
      setQuestions([]);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Générer un Quiz</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Document</label>
        <select
          value={fileHash}
          onChange={(e) => setFileHash(e.target.value)}
          className="w-full p-2 border rounded mt-1"
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
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Niveau de Bloom (optionnel)</label>
        <select
          value={bloomLevel}
          onChange={(e) => setBloomLevel(e.target.value)}
          className="w-full p-2 border rounded mt-1"
        >
          <option value="">Tous les niveaux</option>
          <option value="knowledge">Connaissance</option>
          <option value="comprehension">Compréhension</option>
          <option value="application">Application</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={!fileHash}
      >
        Générer le Quiz
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