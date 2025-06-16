import React, { useState, useEffect } from 'react';
     import axios from 'axios';

     const Summarize = ({ user }) => {
       const [fileHash, setFileHash] = useState('');
       const [level, setLevel] = useState('simplified');
       const [summary, setSummary] = useState('');
       const [documents, setDocuments] = useState([]);

       useEffect(() => {
         const fetchDocuments = async () => {
           const res = await axios.get('http://localhost:8000/ingested');
           setDocuments(res.data);
         };
         fetchDocuments();
       }, []);

       const handleSubmit = async () => {
         try {
           const res = await axios.post('http://localhost:8000/summarize', {
             file_hash: fileHash,
             level
           });
           setSummary(res.data.summary);
         } catch (error) {
           setSummary('Erreur : ' + error.response.data.detail);
         }
       };

       return (
         <div className="p-6">
           <h2 className="text-2xl mb-4">Résumer un document</h2>
           <select
             value={fileHash}
             onChange={(e) => setFileHash(e.target.value)}
             className="w-full p-2 mb-4 border rounded"
           >
             <option value="">Sélectionner un document</option>
             {documents.map(doc => (
               <option key={doc.file_hash} value={doc.file_hash}>{doc.base_filename}</option>
             ))}
           </select>
           <select
             value={level}
             onChange={(e) => setLevel(e.target.value)}
             className="w-full p-2 mb-4 border rounded"
           >
             <option value="simplified">Simplifié</option>
             <option value="detailed">Détaillé</option>
           </select>
           <button
             onClick={handleSubmit}
             className="bg-blue-500 text-white p-2 rounded"
           >
             Générer le résumé
           </button>
           <p className="mt-4">{summary}</p>
         </div>
       );
     };

     export default Summarize;