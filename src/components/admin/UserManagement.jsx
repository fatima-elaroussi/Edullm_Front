import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */
const normalizeUser = (raw) => ({
  user_id: raw.id,                       // mapping API → front
  username: raw.username,
  profile_id: raw.profile_id,
  filiere_id: raw.filiere_id,
  annee: raw.annee_scolaire ?? '',
});

const profileLabel = (id) =>
  ({ 1: 'Étudiant', 2: 'Enseignant', 3: 'Administrateur' }[id] || 'Inconnu');

/* -------------------------------------------------- */
/* Input & Select sub‑components (focus‑safe)         */
/* -------------------------------------------------- */
const Input = ({ label, value, onChange, type = 'text', required }) => (
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

/* -------------------------------------------------- */
/* Main component                                     */
/* -------------------------------------------------- */
const UserManagement = () => {
  /* ------------------- state --------------------- */
  const emptyForm = {
    username: '',
    password: '',
    profile_id: '1',      // string pour le select
    filiere_id: '',
    annee: String(new Date().getFullYear()),
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfile, setFilterProfile] = useState('all');

  const [formData, setFormData] = useState(emptyForm);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  /* ------------------- fetch --------------------- */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/users');
      if (!res.ok) throw new Error();
      const raw = await res.json();
      setUsers(raw.map(normalizeUser));
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ---------------- payload builder -------------- */
  const buildPayload = () => {
    const p = {
      username: formData.username.trim(),
      profile_id: parseInt(formData.profile_id, 10),
      annee: formData.annee.trim(),
    };
    if (formData.password) p.password = formData.password;
    if (formData.filiere_id.trim() !== '')
      p.filiere_id = parseInt(formData.filiere_id, 10);
    return p;
  };

  /* ---------------- CRUD actions ----------------- */
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Erreur API');
      }
      toast.success('Utilisateur ajouté');
      setShowAddModal(false);
      setFormData(emptyForm);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await fetch(
        `http://localhost:8000/users/${selectedUser.user_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Erreur API');
      }
      toast.success('Utilisateur modifié');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData(emptyForm);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      const res = await fetch(`http://localhost:8000/users/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      toast.success('Utilisateur supprimé');
      setUsers((u) => u.filter((x) => x.user_id !== id));
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  /* ---------------- open modal ------------------- */
  const openEditModal = (u) => {
    setSelectedUser(u);
    setFormData({
      username: u.username,
      password: '',
      profile_id: String(u.profile_id),
      filiere_id: u.filiere_id ? String(u.filiere_id) : '',
      annee: u.annee ? String(u.annee) : '',
    });
    setShowEditModal(true);
  };

  /* ---------------- filtering -------------------- */
  const filteredUsers = users.filter((u) => {
    const okSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const okFilter =
      filterProfile === 'all' || String(u.profile_id) === filterProfile;
    return okSearch && okFilter;
  });

  /* ---------------- modal UI --------------------- */
  const UserModal = ({ show, onClose, onSubmit, title, isEdit }) =>
    !show ? null : (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Nom d’utilisateur"
              value={formData.username}
              onChange={(v) => setFormData({ ...formData, username: v })}
              required
            />
            <Input
              type="password"
              label={isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
              value={formData.password}
              onChange={(v) => setFormData({ ...formData, password: v })}
              required={!isEdit}
            />
            <Select
              label="Profil"
              value={formData.profile_id}
              onChange={(v) => setFormData({ ...formData, profile_id: v })}
              options={[
                { value: '1', label: 'Étudiant' },
                { value: '2', label: 'Enseignant' },
                { value: '3', label: 'Administrateur' },
              ]}
            />
            <Input
              label="Filière ID (optionnel)"
              type="number"
              value={formData.filiere_id}
              onChange={(v) => setFormData({ ...formData, filiere_id: v })}
            />
            <Input
              label="Année"
              type="number"
              value={formData.annee}
              onChange={(v) => setFormData({ ...formData, annee: v })}
              required
            />

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {isEdit ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 py-2 rounded"
                onClick={onClose}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  /* ---------------- render ----------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <button
          onClick={() => {
            setFormData(emptyForm);
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* filters */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterProfile}
              onChange={(e) => setFilterProfile(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les profils</option>
              <option value="1">Étudiants</option>
              <option value="2">Enseignants</option>
              <option value="3">Administrateurs</option>
            </select>
          </div>
          <span className="text-sm text-gray-600">{filteredUsers.length} utilisateur(s)</span>
        </div>
      </div>

      {/* table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Utilisateur', 'Profil', 'Filière', 'Année', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.map((u) => (
              <tr key={u.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{u.username}</div>
                      <div className="text-xs text-gray-500">ID : {u.user_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full font-semibold ${
                      u.profile_id === 3
                        ? 'bg-red-100 text-red-800'
                        : u.profile_id === 2
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {profileLabel(u.profile_id)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{u.filiere_id || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{u.annee || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => openEditModal(u)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteUser(u.user_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">Aucun utilisateur</h3>
            <p className="text-sm text-gray-500">Ajustez vos filtres ou ajoutez un utilisateur.</p>
          </div>
        )}
      </div>

      {/* modals */}
      <UserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        title="Ajouter un utilisateur"
      />
      <UserModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
          setFormData(emptyForm);
        }}
        onSubmit={handleEditUser}
        title="Modifier l’utilisateur"
        isEdit
      />
    </div>
  );
};

export default UserManagement;
