import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FolderTree, Plus, Edit2, Trash2, X } from 'lucide-react';

export const AdminCategoryManagement = () => {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      addToast('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('Category name is required.', 'error');
      return;
    }

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        addToast(editingCategory ? 'Category updated!' : 'New category created!', 'success');
        setIsModalOpen(false);
        fetchCategories();
      } else {
        addToast(data.message || 'Operation failed.', 'error');
      }
    } catch (err) {
      addToast('Network error saving category.', 'error');
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category '${cat.name}'?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        addToast(`Category '${cat.name}' deleted.`, 'info');
        fetchCategories();
      } else {
        addToast(data.message || 'Could not delete category.', 'error');
      }
    } catch (err) {
      addToast('Error deleting category.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Category Management</h1>
          <p className="text-xs text-slate-500">Organize cafeteria food items into dynamic categories</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {cat.description || 'Cafeteria category group'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
                Category ID: <span className="font-mono text-slate-700">{cat.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. South Indian Specials"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category overview..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-orange-600 text-white font-bold text-sm shadow-md hover:bg-orange-700 transition-colors"
              >
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
