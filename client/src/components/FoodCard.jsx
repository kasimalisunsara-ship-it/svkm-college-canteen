import React from 'react';
import { useCart } from '../context/CartContext';
import { FoodImage } from './FoodImage';
import { Plus, Minus, ShoppingBag, Eye, CheckCircle, Ban, Flower2 } from 'lucide-react';

export const FoodCard = ({ food, onViewDetails }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find(item => item.foodId === food.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  return (
    <div className={`group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden ${!food.isAvailable ? 'opacity-75 bg-slate-50/80' : ''}`}>
      
      {/* Thumbnail Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <FoodImage
          src={food.image}
          alt={food.name}
          categoryName={food.categoryName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="eager"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none gap-1 flex-wrap z-10">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-md shadow-sm">
              {food.categoryName}
            </span>
            {/* Pure Veg Pill */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Veg
            </span>
            {/* Jain Badge if applicable */}
            {food.isJain && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-700/90 text-amber-200 backdrop-blur-md shadow-sm flex items-center gap-0.5 border border-amber-300/40">
                <Flower2 className="w-3 h-3 text-amber-300" /> Jain
              </span>
            )}
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1 shadow-sm ${
            food.isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
          }`}>
            {food.isAvailable ? (
              <>
                <CheckCircle className="w-3 h-3" /> Available
              </>
            ) : (
              <>
                <Ban className="w-3 h-3" /> Out of Stock
              </>
            )}
          </span>
        </div>

        {/* Quick View Hover Button */}
        <button
          onClick={() => onViewDetails(food)}
          className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-[2px] z-10"
        >
          <Eye className="w-4 h-4" /> Quick View
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-orange-600 transition-colors line-clamp-1">
              {food.name}
            </h3>
          </div>
          <p className="text-slate-500 text-xs line-clamp-2 mt-1 leading-relaxed">
            {food.description || 'Freshly prepared delicious item from our campus kitchen.'}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Price</span>
            <div className="text-base font-black text-slate-900">
              ₹{food.price}
            </div>
          </div>

          <div>
            {!food.isAvailable ? (
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed">
                Unavailable
              </span>
            ) : inCartQty > 0 ? (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(food.id, -1)}
                  className="w-7 h-7 rounded-lg bg-white text-orange-600 shadow-sm flex items-center justify-center font-bold hover:bg-orange-600 hover:text-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-slate-800 text-sm px-1 min-w-[1.25rem] text-center">
                  {inCartQty}
                </span>
                <button
                  onClick={() => updateQuantity(food.id, 1)}
                  className="w-7 h-7 rounded-lg bg-white text-orange-600 shadow-sm flex items-center justify-center font-bold hover:bg-orange-600 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(food)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-orange-600 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
