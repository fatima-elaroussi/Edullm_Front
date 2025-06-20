import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Hash,
  AlertCircle
} from 'lucide-react';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [debugMode, setDebugMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  // Add toast notification function
  const showToast = (message, type = 'info') => {
    // Simple toast implementation - you can replace with your preferred toast library
    console.log(`${type.toUpperCase()}: ${message}`);
    // For now, using alert - replace with proper toast notification
    if (type === 'error') {
      alert(`Erreur: ${message}`);
    } else if (type === 'success') {
      alert(`Succès: ${message}`);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/ingested');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched documents:', data); // Debug log
        setDocuments(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.detail || 'Erreur lors du chargement des documents', 'error');
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      showToast('Erreur lors du chargement des documents', 'error');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteDocument = async (fileHash) => {
    if (!fileHash) {
      showToast('Hash du document manquant', 'error');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document? Cette action supprimera le document de la base de données et de ChromaDB.')) {
      setDeleteLoading(true);
      try {
        // Use the new delete endpoint instead of debug endpoint
        const response = await fetch(`http://localhost:8000/documents/${encodeURIComponent(fileHash)}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const result = await response.json();
          showToast(result.message || 'Document supprimé avec succès', 'success');
          // Refresh the documents list
          await fetchDocuments();
          await fetchStats();
        } else {
          const errorData = await response.json().catch(() => ({}));
          showToast(errorData.detail || 'Erreur lors de la suppression', 'error');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        showToast('Erreur lors de la suppression du document', 'error');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleViewDocumentInfo = async (fileHash) => {
    if (!fileHash) {
      showToast('Hash du document manquant', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/debug/document/${encodeURIComponent(fileHash)}`);
      if (response.ok) {
        const data = await response.json();
        // Create a more readable display
        const formattedInfo = `
Document Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File Hash: ${data.file_hash || 'N/A'}
Exists in ChromaDB: ${data.exists_in_chromadb ? 'Yes' : 'No'}
Chunk Count: ${data.chunk_count || 0}

Sample Metadata:
${data.sample_metadata ? JSON.stringify(data.sample_metadata, null, 2) : 'N/A'}

Sample Content:
${data.sample_document || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
        
        // Create a modal-like display instead of alert
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
          <div class="bg-white rounded-lg max-w-4xl max-h-96 overflow-auto p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Informations du Document</h3>
              <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                ✕
              </button>
            </div>
            <pre class="text-sm whitespace-pre-wrap font-mono bg-gray-100 p-4 rounded">${formattedInfo}</pre>
          </div>
        `;
        document.body.appendChild(modal);
        
        // Remove modal when clicking outside
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.remove();
          }
        });
        
      } else {
        showToast('Erreur lors de la récupération des informations', 'error');
      }
    } catch (error) {
      console.error('Error fetching document info:', error);
      showToast('Erreur lors de la récupération des informations', 'error');
    }
  };

  const fetchCollectionStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/debug/collection/stats');
      if (response.ok) {
        const data = await response.json();
        const formattedStats = `
Collection Statistics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Documents: ${data.total_documents || 0}
Unique File Hashes: ${data.unique_file_hashes || 0}
Sample IDs: ${data.sample_ids ? data.sample_ids.slice(0, 5).join(', ') + (data.sample_ids.length > 5 ? '...' : '') : 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
        alert(formattedStats);
      }
    } catch (error) {
      console.error('Error fetching collection stats:', error);
      showToast('Erreur lors de la récupération des statistiques', 'error');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    (doc.filename && doc.filename.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.file_hash && doc.file_hash.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.departement_name && doc.departement_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.filiere_name && doc.filiere_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Helper function to safely get values
  const safeValue = (value, fallback = 'N/A') => {
    return value !== null && value !== undefined && value !== '' ? value : fallback;
  };

  const totalChunks = documents.reduce((sum, doc) => sum + (doc.nb_chunks || 0), 0);
  const totalSize = documents.reduce((sum, doc) => sum + (doc.taille_estimee || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Documents</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
              debugMode 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            <span>Mode Debug</span>
          </button>
          {debugMode && (
            <button
              onClick={fetchCollectionStats}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Stats Collection
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Chunks</p>
              <p className="text-2xl font-bold text-gray-900">{totalChunks}</p>
            </div>
            <Hash className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taille Totale</p>
              <p className="text-2xl font-bold text-gray-900">{totalSize.toFixed(1)} KB</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dernière Ingestion</p>
              <p className="text-sm font-bold text-gray-900">
                {documents.length > 0 
                  ? formatDate(documents[0].ingestion_date) 
                  : 'N/A'
                }
              </p>
            </div>
            <User className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, hash, département, filière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-80"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredDocuments.length} document(s) trouvé(s)
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contexte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'ingestion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc, index) => (
                <tr key={doc.file_hash || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900" title={doc.filename}>
                          {doc.filename && doc.filename.length > 30 
                            ? doc.filename.substring(0, 30) + '...' 
                            : safeValue(doc.filename)
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          Utilisateur: {safeValue(doc.user_id)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-mono text-gray-600 bg-gray-100 p-2 rounded max-w-32" title={doc.file_hash}>
                      {doc.file_hash ? 
                        (doc.file_hash.length > 16 ? doc.file_hash.substring(0, 16) + '...' : doc.file_hash) 
                        : 'N/A'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div><strong>Dept:</strong> {safeValue(doc.departement_name, safeValue(doc.departement_id))}</div>
                      <div><strong>Fil:</strong> {safeValue(doc.filiere_name, safeValue(doc.filiere_id))}</div>
                      <div><strong>Mod:</strong> {safeValue(doc.module_name, safeValue(doc.module_id))}</div>
                      <div><strong>Act:</strong> {safeValue(doc.activite_name, safeValue(doc.activite_id))}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div><strong>Chunks:</strong> {doc.nb_chunks || 0}</div>
                      <div><strong>Taille:</strong> {doc.taille_estimee || 0} KB</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(doc.ingestion_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {debugMode && (
                        <button
                          onClick={() => handleViewDocumentInfo(doc.file_hash)}
                          className="text-purple-600 hover:text-purple-900 disabled:text-purple-300 p-1 hover:bg-purple-50 rounded"
                          title="Voir les informations du document"
                          disabled={!doc.file_hash}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc.file_hash)}
                        className="text-red-600 hover:text-red-900 disabled:text-red-300 p-1 hover:bg-red-50 rounded"
                        title="Supprimer le document"
                        disabled={deleteLoading || !doc.file_hash}
                      >
                        {deleteLoading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDocuments.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {documents.length === 0 
                ? "Aucun document n'a été ingéré dans le système."
                : "Aucun document ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        )}
      </div>

      {deleteLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-lg">Suppression en cours...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;