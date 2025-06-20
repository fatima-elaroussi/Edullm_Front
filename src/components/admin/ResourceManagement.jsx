// components/admin/ResourceManagement.jsx - Complete implementation
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Building, 
  GraduationCap, 
  Book, 
  Activity,
  X,
  ChevronRight,
  ChevronDown,
  Search,
  Save,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ResourceManagement = () => {
  const [activeTab, setActiveTab] = useState('departements');
  const [expandedItems, setExpandedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentResource, setCurrentResource] = useState(null);
  const [loading, setLoading] = useState(false);

  // Data states
  const [departements, setDepartements] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [modules, setModules] = useState([]);
  const [activites, setActivites] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    departement_id: '',
    filiere_id: '',
    module_id: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDepartements(),
        fetchFilieres(),
        fetchModules(),
        fetchActivites()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartements = async () => {
    try {
      const response = await fetch('http://localhost:8000/departements');
      if (response.ok) {
        const data = await response.json();
        setDepartements(data);
      }
    } catch (error) {
      console.error('Error fetching departements:', error);
    }
  };

  const fetchFilieres = async () => {
    try {
      const response = await fetch('http://localhost:8000/filieres');
      if (response.ok) {
        const data = await response.json();
        setFilieres(data);
      }
    } catch (error) {
      console.error('Error fetching filieres:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('http://localhost:8000/modules');
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchActivites = async () => {
    try {
      const response = await fetch('http://localhost:8000/activites');
      if (response.ok) {
        const data = await response.json();
        setActivites(data);
      }
    } catch (error) {
      console.error('Error fetching activites:', error);
    }
  };

  const handleAdd = (type) => {
    setModalType('add');
    setCurrentResource(null);
    setFormData({
      nom: '',
      description: '',
      departement_id: '',
      filiere_id: '',
      module_id: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType('edit');
    setCurrentResource({ ...item, type });
    setFormData({
      nom: item.nom || '',
      description: item.description || '',
      departement_id: item.departement_id || '',
      filiere_id: item.filiere_id || '',
      module_id: item.module_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cet élément?`)) {
      try {
        const response = await fetch(`http://localhost:8000/${type}/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          toast.success('Élément supprimé avec succès');
          fetchAllData();
        } else {
          const error = await response.json();
          toast.error(error.detail || 'Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = activeTab;
    const method = modalType === 'add' ? 'POST' : 'PUT';
    const url = modalType === 'add' 
      ? `http://localhost:8000/${endpoint}`
      : `http://localhost:8000/${endpoint}/${currentResource.id}`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(`${modalType === 'add' ? 'Ajouté' : 'Modifié'} avec succès`);
        setShowModal(false);
        fetchAllData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erreur lors de l\'opération');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getFilteredData = () => {
    let data = [];
    switch (activeTab) {
      case 'departements':
        data = departements;
        break;
      case 'filieres':
        data = filieres;
        break;
      case 'modules':
        data = modules;
        break;
      case 'activites':
        data = activites;
        break;
      default:
        data = [];
    }
    return data.filter(item => 
      item.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getDepartementName = (id) => {
    const dept = departements.find(d => d.id === id);
    return dept ? dept.nom : 'N/A';
  };

  const getFiliereName = (id) => {
    const fil = filieres.find(f => f.id === id);
    return fil ? fil.nom : 'N/A';
  };

  const getModuleName = (id) => {
    const mod = modules.find(m => m.id === id);
    return mod ? mod.nom : 'N/A';
  };

  const ResourceModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {modalType === 'add' ? 'Ajouter' : 'Modifier'} {activeTab.slice(0, -1)}
            </h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Conditional fields based on resource type */}
            {activeTab === 'filieres' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Département
                </label>
                <select
                  value={formData.departement_id}
                  onChange={(e) => setFormData({...formData, departement_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un département</option>
                  {departements.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.nom}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'modules' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filière
                </label>
                <select
                  value={formData.filiere_id}
                  onChange={(e) => setFormData({...formData, filiere_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner une filière</option>
                  {filieres.map(fil => (
                    <option key={fil.id} value={fil.id}>{fil.nom}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'activites' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module
                </label>
                <select
                  value={formData.module_id}
                  onChange={(e) => setFormData({...formData, module_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un module</option>
                  {modules.map(mod => (
                    <option key={mod.id} value={mod.id}>{mod.nom}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{modalType === 'add' ? 'Ajouter' : 'Modifier'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ResourceCard = ({ item, type }) => {
    const getIcon = () => {
      switch (type) {
        case 'departements': return <Building className="h-5 w-5 text-blue-500" />;
        case 'filieres': return <GraduationCap className="h-5 w-5 text-green-500" />;
        case 'modules': return <Book className="h-5 w-5 text-purple-500" />;
        case 'activites': return <Activity className="h-5 w-5 text-orange-500" />;
        default: return <BookOpen className="h-5 w-5 text-gray-500" />;
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getIcon()}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.nom}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              )}
              <div className="mt-2 space-y-1">
                {item.departement_id && (
                  <p className="text-xs text-gray-500">
                    Département: {getDepartementName(item.departement_id)}
                  </p>
                )}
                {item.filiere_id && (
                  <p className="text-xs text-gray-500">
                    Filière: {getFiliereName(item.filiere_id)}
                  </p>
                )}
                {item.module_id && (
                  <p className="text-xs text-gray-500">
                    Module: {getModuleName(item.module_id)}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(item, type)}
              className="text-blue-600 hover:text-blue-900 p-1"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(item.id, type)}
              className="text-red-600 hover:text-red-900 p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const tabs = [
    { id: 'departements', label: 'Départements', icon: Building },
    { id: 'filieres', label: 'Filières', icon: GraduationCap },
    { id: 'modules', label: 'Modules', icon: Book },
    { id: 'activites', label: 'Activités', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Ressources</h1>
        <button
          onClick={() => handleAdd(activeTab)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={`Rechercher dans ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun élément trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucun élément ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((item) => (
                <ResourceCard key={item.id} item={item} type={activeTab} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ResourceModal />
    </div>
  );
};

export default ResourceManagement;