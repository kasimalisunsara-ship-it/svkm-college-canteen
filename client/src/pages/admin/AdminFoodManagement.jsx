import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, Edit2, Trash2, CheckCircle, Ban, Search, X, 
  Image as ImageIcon, Upload, Database, Check, Server, RefreshCw, Flower2 
} from 'lucide-react';
import { FoodImage } from '../../components/FoodImage';

export const AdminFoodManagement = () => {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Online Database state
  const [dbStatus, setDbStatus] = useState({
    isConnected: false,
    dbType: 'Online-Ready Database',
    status: 'online',
    uriConfigured: false
  });
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [mongoUriInput, setMongoUriInput] = useState('');
  const [testingDb, setTestingDb] = useState(false);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal State for Food Items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    isAvailable: true,
    isJain: false
  });

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.error('Error fetching DB status:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsRes, catRes] = await Promise.all([
        fetch('/api/foods'),
        fetch('/api/categories'),
        fetchDbStatus()
      ]);

      if (foodsRes.ok) setFoods(await foodsRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (err) {
      addToast('Error fetching menu items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle image file upload to server
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    setUploadingImage(true);
    const dataForm = new FormData();
    dataForm.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: dataForm
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setFormData(prev => ({ ...prev, image: data.imageUrl }));
        addToast('Food image uploaded successfully!', 'success');
      } else {
        addToast(data.message || 'Image upload failed.', 'error');
      }
    } catch (err) {
      addToast('Failed to upload image to server.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Online Database Connection
  const handleConnectOnlineDb = async (e) => {
    e.preventDefault();
    if (!mongoUriInput.trim()) {
      addToast('Please enter a valid MongoDB connection string.', 'error');
      return;
    }

    setTestingDb(true);
    try {
      const res = await fetch('/api/db/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mongodbUri: mongoUriInput.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setDbStatus(data.status);
        addToast('Online Database connected successfully!', 'success');
        setIsDbModalOpen(false);
      } else {
        addToast(data.message || 'Could not connect to online database.', 'error');
      }
    } catch (err) {
      addToast('Connection request failed. Check server status.', 'error');
    } finally {
      setTestingDb(false);
    }
  };

  const openAddModal = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      image: '/images/foods/veg-thali.jpg',
      isAvailable: true,
      isJain: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description || '',
      price: food.price,
      categoryId: food.categoryId,
      image: food.image,
      isAvailable: food.isAvailable,
      isJain: food.isJain || false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      categoryId: formData.categoryId,
      image: formData.image,
      isAvailable: formData.isAvailable,
      isJain: formData.isJain
    };

    try {
      const url = editingFood ? `/api/foods/${editingFood.id}` : '/api/foods';
      const method = editingFood ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        addToast(editingFood ? 'Food item updated!' : 'New food item created!', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        addToast(data.message || 'Operation failed.', 'error');
      }
    } catch (err) {
      addToast('Network error while saving food item.', 'error');
    }
  };

  const handleToggleAvailability = async (food) => {
    try {
      const res = await fetch(`/api/foods/${food.id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !food.isAvailable })
      });

      if (res.ok) {
        addToast(`Updated availability for '${food.name}'`, 'success');
        fetchData();
      } else {
        addToast('Failed to update availability.', 'error');
      }
    } catch (err) {
      addToast('Error toggling availability.', 'error');
    }
  };

  const handleDelete = async (food) => {
    if (!window.confirm(`Are you sure you want to delete '${food.name}' from the cafeteria menu?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/foods/${food.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        addToast(`Deleted '${food.name}'`, 'info');
        fetchData();
      } else {
        addToast('Failed to delete item.', 'error');
      }
    } catch (err) {
      addToast('Error deleting item.', 'error');
    }
  };

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sampleFoodPresets = [
    { name: 'Samosa', url: '/images/foods/samosa.jpg' },
    { name: 'Vada Pav', url: '/images/foods/vada-pav.jpg' },
    { name: 'Dosa', url: '/images/foods/masala-dosa.jpg' },
    { name: 'Burger', url: '/images/foods/veg-burger.jpg' },
    { name: 'Sandwich', url: '/images/foods/sandwich.jpg' },
    { name: 'Cold Coffee', url: '/images/foods/cold-coffee.jpg' },
    { name: 'Pav Bhaji', url: '/images/foods/pav-bhaji.jpg' },
    { name: 'Biryani', url: '/images/foods/veg-biryani.jpg' },
    { name: 'Brownie', url: '/images/foods/brownie.jpg' },
    { name: 'Gulab Jamun', url: '/images/foods/gulab-jamun.jpg' },
    { name: 'Fries', url: '/images/foods/french-fries.jpg' },
    { name: 'Mango Shake', url: '/images/foods/mango-milkshake.jpg' },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Online Database Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wide uppercase text-slate-300">Database:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 shadow-sm ${
                dbStatus.isConnected ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`}>
                {dbStatus.isConnected ? '🟢 MYSQL CONNECTED' : '🟡 RESILIENT MODE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {dbStatus.isConnected 
                ? `MySQL Database: ${dbStatus.database || 'svkm_canteen'} (${dbStatus.host || 'localhost'}:${dbStatus.port || 3306})` 
                : 'Server Database: Fallback cache active. Start MySQL Server for relational live persistence.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDbModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all border border-white/20"
        >
          <Server className="w-3.5 h-3.5 text-emerald-400" /> Database Status Details
        </button>
      </div>

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Food Menu Management</h1>
          <p className="text-xs text-slate-500">Add food items, upload high-res photos, manage availability & Jain options</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-orange-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Food Item
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter food by name or category..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Food Items Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm mt-4">Loading menu items...</p>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-slate-700 font-bold text-lg">No food items found</p>
          <p className="text-slate-400 text-sm mt-1">Add your first item or clear the search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFoods.map(food => {
            const catColors = [
              'bg-orange-100 text-orange-700',
              'bg-blue-100 text-blue-700',
              'bg-purple-100 text-purple-700',
              'bg-emerald-100 text-emerald-700',
              'bg-amber-100 text-amber-700',
              'bg-rose-100 text-rose-700',
            ];
            const colorIdx = food.categoryName ? food.categoryName.charCodeAt(0) % catColors.length : 0;
            return (
              <div
                key={food.id}
                className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Food Photo */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <FoodImage
                    src={food.image}
                    alt={food.name}
                    categoryName={food.categoryName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Availability badge */}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black shadow-md ${
                    food.isAvailable
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {food.isAvailable ? '● Available' : '✕ Unavailable'}
                  </span>
                  {food.isJain && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-md flex items-center gap-1">
                      <Flower2 className="w-3 h-3" /> Jain
                    </span>
                  )}
                  {/* Dark gradient for text legibility */}
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Price chip */}
                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/95 text-orange-600 font-black text-sm shadow-md">
                    ₹{food.price}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  {/* Category */}
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${catColors[colorIdx]}`}>
                    {food.categoryName}
                  </span>

                  {/* Name + description */}
                  <h3 className="font-black text-slate-900 text-sm leading-tight">{food.name}</h3>
                  {food.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{food.description}</p>
                  )}

                  {/* Dietary tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">🟢 Veg</span>
                    {food.isJain && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">🪷 Jain</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-1">
                    {/* Toggle availability */}
                    <button
                      onClick={() => handleToggleAvailability(food)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        food.isAvailable
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      }`}
                      title="Click to toggle availability"
                    >
                      {food.isAvailable ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> On</>   
                      ) : (
                        <><Ban className="w-3.5 h-3.5" /> Off</>
                      )}
                    </button>

                    <button
                      onClick={() => openEditModal(food)}
                      className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(food)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900">
                {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Food Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jain Paneer Butter Masala"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="120"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short dish description..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Food Image Upload & Selection Section */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-600" /> Food Image *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Upload file or Pick Preset
                  </span>
                </div>

                {/* Option 1: File Upload */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 block">📤 Upload Image from Device:</span>
                  <label className="flex items-center justify-center gap-2 p-3 bg-white rounded-xl border-2 border-dashed border-orange-300 hover:border-orange-500 cursor-pointer transition-all text-xs font-bold text-orange-700 hover:bg-orange-50">
                    <Upload className="w-4 h-4 text-orange-600" />
                    {uploadingImage ? 'Uploading Image...' : 'Click to Upload Image File (JPG, PNG)'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Option 2: Custom URL */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 block">🔗 Or Enter Image URL:</span>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  />
                </div>

                {/* Option 3: Sample Food Presets Picker */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">🎨 Quick Food Preset Images:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                    {sampleFoodPresets.map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: sample.url })}
                        className={`p-1.5 rounded-lg text-[11px] font-bold transition-all flex flex-col items-center gap-1 border ${
                          formData.image === sample.url
                            ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <img src={sample.url} alt={sample.name} className="w-8 h-8 rounded-md object-cover" />
                        <span className="truncate w-full text-center text-[10px]">{sample.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Live Preview */}
                {formData.image && (
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-slate-300 bg-black/5 mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-sm shadow">
                      Live Image Preview
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-bold text-emerald-900">🟢 100% Pure Veg</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                  <input
                    type="checkbox"
                    checked={formData.isJain}
                    onChange={(e) => setFormData({ ...formData, isJain: e.target.checked })}
                    className="w-4 h-4 text-purple-700 rounded focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-purple-900">🪷 Jain Option</span>
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-xs font-bold text-slate-700">Available for Ordering Immediately</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-orange-600 text-white font-bold text-sm shadow-md hover:bg-orange-700 transition-colors"
              >
                {editingFood ? 'Save Changes' : 'Create Food Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MySQL Database Status Modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900">MySQL Database Status</h2>
              </div>
              <button onClick={() => setIsDbModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`border rounded-2xl p-4 text-xs space-y-2 ${
                dbStatus.isConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <p className="font-extrabold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> Status: {dbStatus.isConnected ? 'Connected & Active' : 'Resilient Cache Mode'}
                </p>
                <p className="text-slate-600 text-xs">
                  {dbStatus.isConnected
                    ? `Connected directly to MySQL Server: database '${dbStatus.database || 'svkm_canteen'}' on ${dbStatus.host || 'localhost'}:${dbStatus.port || 3306}.`
                    : 'MySQL Server is not yet listening on port 3306. Ensure MySQL Server service is started (net start MySQL80) and run migration.'}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <p className="font-bold text-slate-800">Connection Details:</p>
                <div className="font-mono text-[11px] text-slate-600 space-y-1">
                  <div>Host: <span className="text-slate-900 font-bold">{dbStatus.host || 'localhost'}</span></div>
                  <div>Port: <span className="text-slate-900 font-bold">{dbStatus.port || 3306}</span></div>
                  <div>Database: <span className="text-slate-900 font-bold">{dbStatus.database || 'svkm_canteen'}</span></div>
                </div>
              </div>

              <button
                onClick={async () => {
                  setTestingDb(true);
                  await fetchDbStatus();
                  setTestingDb(false);
                  addToast('Database status refreshed.', 'info');
                }}
                disabled={testingDb}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {testingDb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Checking Connection...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Refresh Connection Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
