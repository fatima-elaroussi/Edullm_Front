import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FileText,
  RefreshCw,
  Trash2,
  Eye,
  Search as SearchIcon,
} from "lucide-react";

/**
 * Documents
 * -----------------------------------------------------------------------------
 * Affiche la liste des documents ingérés dans la base.
 * ⚠️ Toutes les fonctionnalités existantes ont été conservées :
 *   - Récupération des documents via l'API protégée
 *   - Recherche, filtres, tri
 *   - Aperçu et suppression conditionnelle
 * -----------------------------------------------------------------------------
 * Améliorations UI/UX :
 *   • Palette cohérente, boutons primaires/secondaires
 *   • Animation spinner lors du chargement
 *   • Table responsive, en-têtes collants
 *   • Traductions françaises
 * -----------------------------------------------------------------------------
 */
const Documents = ({ user }) => {

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  /* ------------------------------------------------------------------------- */
  /* Effects                                                                   */
  /* ------------------------------------------------------------------------- */
  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------------------- */
  /* Helpers                                                                   */
  /* ------------------------------------------------------------------------- */
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/ingested", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      toast.error("Échec du chargement des documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (fileHash) => {
    if (!window.confirm("Supprimer ce document ?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/debug/document/${fileHash}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error();
      toast.success("Document supprimé");
      fetchDocuments();
    } catch (error) {
      console.error(error);
      toast.error("Échec de la suppression");
    }
  };

  const handlePreviewDocument = async (fileHash) => {
    try {
      const response = await fetch(
        `http://localhost:8000/debug/document/${fileHash}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error();
      const data = await response.json();
      setSelectedDocument(data);
      setShowPreview(true);
    } catch (error) {
      toast.error("Échec du chargement de l'aperçu");
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ------------------------------------------------------------------------- */
  /* Memoized filtering / sorting                                              */
  /* ------------------------------------------------------------------------- */
  const filteredAndSortedDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.base_filename
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (filterBy === "all") return matchesSearch;
      if (filterBy === "recent") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return matchesSearch && new Date(doc.ingestion_date) > oneWeekAgo;
      }
      if (filterBy === "my_docs" && user)
        return matchesSearch && doc.user_id === user.user_id;
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.ingestion_date) - new Date(a.ingestion_date);
        case "date_asc":
          return new Date(a.ingestion_date) - new Date(b.ingestion_date);
        case "name_asc":
          return (a.base_filename || "").localeCompare(b.base_filename || "");
        case "name_desc":
          return (b.base_filename || "").localeCompare(a.base_filename || "");
        case "size_desc":
          return (b.chunks_count || 0) - (a.chunks_count || 0);
        case "size_asc":
          return (a.chunks_count || 0) - (b.chunks_count || 0);
        default:
          return 0;
      }
    });

  /* ------------------------------------------------------------------------- */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------- */
  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Documents
        </h1>
        <button
          onClick={fetchDocuments}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded hover:bg-blue-700 focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-300 disabled:opacity-50 disabled:pointer-events-none"
        >
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Toolbar                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid w-full grid-cols-1 gap-4 mb-6 md:grid-cols-3 lg:grid-cols-6">
        <div className="relative col-span-2 md:col-span-3 lg:col-span-2">
          <SearchIcon className="absolute w-4 h-4 text-gray-400 top-3 left-3" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-10 py-2 text-sm bg-white border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="all">Tous</option>
          <option value="recent">Récents (7 jours)</option>
          <option value="my_docs">Mes documents</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="date_desc">Date ↓</option>
          <option value="date_asc">Date ↑</option>
          <option value="name_asc">Nom A‑Z</option>
          <option value="name_desc">Nom Z‑A</option>
          <option value="size_desc">Chunks ↓</option>
          <option value="size_asc">Chunks ↑</option>
        </select>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Table                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="overflow-auto bg-white border rounded shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="sticky top-0 z-10 text-xs uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Fichier</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Chunks</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              /* --------------------------------------------------------- */
              /* Skeleton Loader                                          */
              /* --------------------------------------------------------- */
              [...Array(5).keys()].map((i) => (
                <tr key={i} className="border-t animate-pulse">
                  {[...Array(6).keys()].map((j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="w-full h-4 bg-gray-200 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              /* --------------------------------------------------------- */
              /* Data Rows                                                */
              /* --------------------------------------------------------- */
              filteredAndSortedDocuments.map((doc) => (
                <tr
                  key={doc.file_hash}
                  className="border-t transition-colors hover:bg-gray-50"
                >
                  <td className="flex items-center gap-2 px-4 py-3 whitespace-nowrap">
                    <FileText className="w-4 h-4 text-gray-500" />
                    {doc.base_filename}
                  </td>
                  <td className="px-4 py-3 uppercase whitespace-nowrap">
                    {doc.base_filename?.split(".").pop()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {doc.chunks_count}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(doc.ingestion_date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{doc.user_id}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handlePreviewDocument(doc.file_hash)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 focus:outline-none"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="sr-only">Aperçu</span>
                      </button>

                      {(user?.profile_id === 1 || doc.user_id === user.user_id) && (
                        <button
                          onClick={() => handleDeleteDocument(doc.file_hash)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-800 focus:outline-none"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Supprimer</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && filteredAndSortedDocuments.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="py-12 text-center text-gray-500 whitespace-nowrap"
                >
                  Aucun document trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-4xl max-h-[80vh] overflow-auto bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Aperçu du document</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <p>
                <strong>Fichier :</strong> {selectedDocument.base_filename}
              </p>
              <p>
                <strong>Hash :</strong> {selectedDocument.file_hash}
              </p>
              <p>
                <strong>Chunks :</strong> {selectedDocument.chunk_count}
              </p>
              <p>
                <strong>Présent en DB :</strong>{" "}
                {selectedDocument.exists_in_chromadb ? "Oui" : "Non"}
              </p>
              {selectedDocument.sample_document && (
                <div>
                  <h3 className="mb-1 font-semibold">Extrait :</h3>
                  <p className="p-3 text-gray-800 bg-gray-100 rounded">
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
