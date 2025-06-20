import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* -------------------------------------------------------------------------- */
/*  Documents – design “UserManagement‑like”                                  */
/* -------------------------------------------------------------------------- */
const Documents = ({ user }) => {
  /* ------------------------------ État ----------------------------------- */
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* barre d’outils */
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');      // all | recent | my_docs
  const [sortBy, setSortBy] = useState('date_desc');    // date/name/size + asc/desc

  /* aperçu modal */
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  /* ---------------------------- Effet init ------------------------------- */
  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------- Fonctions API ----------------------------- */
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/ingested', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error();
      setDocuments(await res.json());
    } catch (e) {
      console.error(e);
      toast.error('Échec du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (hash) => {
    if (!window.confirm('Supprimer ce document ?')) return;
    try {
      const res = await fetch(
        `http://localhost:8000/debug/document/${hash}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error();
      toast.success('Document supprimé');
      fetchDocuments();
    } catch (e) {
      console.error(e);
      toast.error('Échec de la suppression');
    }
  };

  const handlePreviewDocument = async (hash) => {
    try {
      const res = await fetch(
        `http://localhost:8000/debug/document/${hash}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error();
      setSelectedDocument(await res.json());
      setShowPreview(true);
    } catch {
      toast.error("Échec de l'aperçu");
    }
  };

  /* -------------------------- Helpers UI -------------------------------- */
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const filtered = documents
    .filter((doc) => {
      const inSearch = doc.filename
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!inSearch) return false;
      if (filterBy === 'recent') {
        const oneWeek = new Date();
        oneWeek.setDate(oneWeek.getDate() - 7);
        return new Date(doc.ingestion_date) > oneWeek;
      }
      if (filterBy === 'my_docs' && user)
        return doc.user_id === user.user_id;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.ingestion_date) - new Date(b.ingestion_date);
        case 'date_desc':
          return new Date(b.ingestion_date) - new Date(a.ingestion_date);
        case 'name_asc':
          return a.filename.localeCompare(b.filename);
        case 'name_desc':
          return b.filename.localeCompare(a.filename);
        case 'size_asc':
          return (a.nb_chunks || 0) - (b.nb_chunks || 0);
        case 'size_desc':
          return (b.nb_chunks || 0) - (a.nb_chunks || 0);
        default:
          return 0;
      }
    });

  /* ============================== RENDER ================================ */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Titre & refresh                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des documents</h1>
        <button
          onClick={fetchDocuments}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Rafraîchir</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Barre d’outils recherche + filtres                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Recherche --------------------------------------------------- */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un fichier…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtres ----------------------------------------------------- */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="recent">Récents (7 jours)</option>
                <option value="my_docs">Mes documents</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date_desc">Date ↓</option>
              <option value="date_asc">Date ↑</option>
              <option value="name_asc">Nom A‑Z</option>
              <option value="name_desc">Nom Z‑A</option>
              <option value="size_desc">Chunks ↓</option>
              <option value="size_asc">Chunks ↑</option>
            </select>
          </div>

          {/* Compteur ---------------------------------------------------- */}
          <div className="text-sm text-gray-600">
            {filtered.length} document(s) trouvé(s)
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Tableau                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Fichier',
                  'Type',
                  'Chunks',
                  'Date',
                  'Utilisateur',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((doc) => (
                <tr key={doc.file_hash} className="hover:bg-gray-50">
                  {/* Fichier ------------------------------------------------ */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {doc.filename}
                        </div>
                        <div className="text-xs text-gray-500">
                          Hash: {doc.file_hash.slice(0, 8)}…
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type -------------------------------------------------- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                    {doc.filename?.split('.').pop()}
                  </td>

                  {/* Chunks ------------------------------------------------ */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.nb_chunks}
                  </td>

                  {/* Date -------------------------------------------------- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(doc.ingestion_date)}
                  </td>

                  {/* Utilisateur ------------------------------------------ */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.user_id}
                  </td>

                  {/* Actions ---------------------------------------------- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreviewDocument(doc.file_hash)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {(user?.profile_id === 1 ||
                        doc.user_id === user.user_id) && (
                        <button
                          onClick={() => handleDeleteDocument(doc.file_hash)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state ---------------------------------------------------- */}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucun document trouvé
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun fichier ne correspond à vos critères.
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modal d’aperçu ---------------------------------------------------- */}
      {/* ------------------------------------------------------------------ */}
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Aperçu du document</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Fichier :</strong> {selectedDocument.filename}
              </p>
              <p>
                <strong>Hash :</strong> {selectedDocument.file_hash}
              </p>
              <p>
                <strong>Chunks :</strong> {selectedDocument.chunk_count}
              </p>
              <p>
                <strong>Présent en DB :</strong>{' '}
                {selectedDocument.exists_in_chromadb ? 'Oui' : 'Non'}
              </p>

              {selectedDocument.sample_document && (
                <div>
                  <h4 className="font-semibold mb-1">Extrait</h4>
                  <p className="p-3 bg-gray-100 rounded text-gray-800">
                    {selectedDocument.sample_document}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
