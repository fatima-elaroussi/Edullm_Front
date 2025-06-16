import React, { useState } from 'react';
     import { useNavigate } from 'react-router-dom';
     import axios from 'axios';

     const Register = () => {
       const [username, setUsername] = useState('');
       const [password, setPassword] = useState('');
       const [profileId, setProfileId] = useState('');
       const [filiereId, setFiliereId] = useState('');
       const [annee, setAnnee] = useState('');
       const [error, setError] = useState('');
       const navigate = useNavigate();

      const handleRegister = async () => {
  try {
    const payload = {
      username,
      password,
      profile_id: parseInt(profileId),
    };

    // Ajouter filiere_id uniquement s’il est un entier valide
    const parsedFiliere = parseInt(filiereId);
    if (!isNaN(parsedFiliere)) {
      payload.filiere_id = parsedFiliere;
    }

    // Ajouter annee uniquement si elle n’est pas vide
    if (annee.trim() !== '') {
      payload.annee = annee;
    }

    const response = await axios.post('http://localhost:8000/register', payload);

    if (response.data.status === 'success') {
      navigate('/');
    }
  } catch (err) {
    setError(err.response?.data?.detail || "Erreur lors de l'inscription");
  }
};


       return (
         <div className="flex items-center justify-center min-h-screen">
           <div className="bg-white p-6 rounded shadow-md w-96">
             <h2 className="text-2xl mb-4">Inscription</h2>
             {error && <p className="text-red-500">{error}</p>}
             <input
               type="text"
               placeholder="Nom d'utilisateur"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               className="w-full p-2 mb-4 border rounded"
             />
             <input
               type="password"
               placeholder="Mot de passe"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full p-2 mb-4 border rounded"
             />
             <select
               value={profileId}
               onChange={(e) => setProfileId(e.target.value)}
               className="w-full p-2 mb-4 border rounded"
             >
               <option value="">Sélectionner un profil</option>
               <option value="1">Admin</option>
               <option value="2">Professeur</option>
               <option value="3">Étudiant</option>
             </select>
             <input
               type="text"
               placeholder="ID de la filière (optionnel)"
               value={filiereId}
               onChange={(e) => setFiliereId(e.target.value)}
               className="w-full p-2 mb-4 border rounded"
             />
             <input
               type="text"
               placeholder="Année scolaire (optionnel)"
               value={annee}
               onChange={(e) => setAnnee(e.target.value)}
               className="w-full p-2 mb-4 border rounded"
             />
             <button
               onClick={handleRegister}
               className="w-full bg-blue-500 text-white p-2 rounded"
             >
               S'inscrire
             </button>
             <p className="mt-4">
               Déjà un compte ? <a href="/" className="text-blue-500">Se connecter</a>
             </p>
           </div>
         </div>
       );
     };

     export default Register;