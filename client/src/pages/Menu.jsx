import React, { useState, useEffect } from 'react';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { Search, SlidersHorizontal, Utensils, CheckCircle2, AlertCircle, Flower2 } from 'lucide-react';

export const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'veg', 'jain'
  const [sortBy, setSortBy] = useState('default');

  // Selected food for modal
  const [activeModalFood, setActiveModalFood] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [foodsRes, catRes] = await Promise.all([
          fetch('/api/foods'),
          fetch('/api/categories')
        ]);

        if (foodsRes.ok) setFoods(await foodsRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error('Error loading menu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter & Sort Logic
  const filteredFoods = foods.filter(food => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      food.categoryId === selectedCategory ||
      food.categoryName.toLowerCase() === selectedCategory.toLowerCase();

    const matchesAvailability = availableOnly ? food.isAvailable : true;

    const matchesDietary =
      dietaryFilter === 'all' ? true :
      dietaryFilter === 'jain' ? food.isJain === true :
      dietaryFilter === 'veg' ? food.isVeg === true : true;

    return matchesSearch && matchesCategory && matchesAvailability && matchesDietary;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Menu Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-orange-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orange-500 text-white uppercase tracking-wider">
              SVKM Canteen Menu
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm">
              🟢 100% Pure Veg & 🪷 Jain Options
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black">Cafeteria Food Menu</h1>
          <p className="text-slate-300 text-sm">
            Freshly prepared snacks, beverages, main course thalis, fast food & Jain specialties.
          </p>
        </div>
      </div>

      {/* Search & Controls Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        {/* Top Search & Filter Options */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, drinks, Jain food..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
            />
          </div>

          {/* Dietary Choice Pills (All vs Pure Veg vs Jain) */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                dietaryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items ({foods.length})
            </button>

            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 Pure Veg
            </button>

            <button
              onClick={() => setDietaryFilter('jain')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                dietaryFilter === 'jain'
                  ? 'bg-purple-700 text-amber-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flower2 className="w-3.5 h-3.5 text-amber-300" /> 🪷 Jain Special
            </button>
          </div>

          {/* Right Controls: Sort & Availability */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="default">Default Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              Available Only
            </label>
          </div>
        </div>

        {/* Dynamic Category Image Cards */}
        <div className="flex items-stretch gap-3 overflow-x-auto pt-2 pb-1 no-scrollbar border-t border-slate-100">
          {/* All Categories Card */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`relative flex-shrink-0 w-28 h-20 rounded-2xl overflow-hidden border-2 transition-all focus:outline-none ${
              selectedCategory === 'all'
                ? 'border-orange-500 shadow-lg shadow-orange-500/20 scale-105'
                : 'border-slate-200 hover:border-orange-300'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
              <span className="text-xl">🍽️</span>
              <span className="text-[10px] font-black text-white mt-1 leading-tight text-center drop-shadow">
                All ({foods.length})
              </span>
            </div>
          </button>

          {categories.map(cat => {
            const count = foods.filter(f => f.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative flex-shrink-0 w-28 h-20 rounded-2xl overflow-hidden border-2 transition-all focus:outline-none ${
                  isSelected
                    ? 'border-orange-500 shadow-lg shadow-orange-500/20 scale-105'
                    : 'border-slate-200 hover:border-orange-300'
                }`}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-700" />
                )}
                {/* Dark overlay */}
                <div className={`absolute inset-0 ${isSelected ? 'bg-orange-900/50' : 'bg-slate-900/55 hover:bg-slate-900/40'} transition-colors`} />
                <div className="absolute inset-0 flex flex-col items-end justify-end p-2">
                  <span className="text-[10px] font-black text-white leading-tight text-right drop-shadow-md">
                    {cat.name}
                  </span>
                  <span className="text-[9px] text-orange-200 font-bold drop-shadow-md">
                    {count} items
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-semibold">Loading SVKM cafeteria menu...</p>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Food Items Found</h3>
          <p className="text-slate-500 text-xs">
            No food items matched your current search keyword and dietary filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setAvailableOnly(false);
              setDietaryFilter('all');
              setSortBy('default');
            }}
            className="px-4 py-2 rounded-xl bg-orange-100 text-orange-700 text-xs font-bold hover:bg-orange-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map(food => (
            <FoodCard
              key={food.id}
              food={food}
              onViewDetails={(selected) => setActiveModalFood(selected)}
            />
          ))}
        </div>
      )}

      {/* Food Details Modal */}
      {activeModalFood && (
        <FoodDetailModal
          food={activeModalFood}
          onClose={() => setActiveModalFood(null)}
        />
      )}
    </div>
  );
};
