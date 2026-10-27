import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { FoodImage } from './FoodImage';
import { X, Plus, Minus, ShoppingBag, CheckCircle, Ban, Tag, Flower2 } from 'lucide-react';

export const FoodDetailModal = ({ food, onClose }) => {
  const { cartItems, addToCart, setItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!food) return null;

  const cartItem = cartItems.find(item => item.foodId === food.id);

  const handleAdd = () => {
    if (!food.isAvailable) return;
    if (cartItem) {
      setItemQuantity(food.id, cartItem.quantity + quantity);
    } else {
      addToCart(food, quantity);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/50 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Image */}
        <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
          <FoodImage
            src={food.image}
            alt={food.name}
            categoryName={food.categoryName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent flex items-end p-6 z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orange-500 text-white shadow-sm inline-flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {food.categoryName}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm">
                  🟢 Pure Veg
                </span>
                {food.isJain && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-700 text-amber-200 shadow-sm flex items-center gap-1">
                    <Flower2 className="w-3.5 h-3.5 text-amber-300" /> Jain Special
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{food.name}</h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Unit Price</span>
              <div className="text-2xl font-black text-slate-900">₹{food.price}</div>
            </div>

            <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              food.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {food.isAvailable ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Currently Available
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 text-rose-600" /> Out of Stock
                </>
              )}
            </div>
          </div>

          {/* Description & Dietary Callout */}
          <div className="space-y-2">
            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {food.description || 'Prepared fresh daily by our college cafeteria chef team using high quality ingredients.'}
            </p>

            {food.isJain && (
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2">
                <Flower2 className="w-4 h-4 text-purple-700 shrink-0" />
                <span>100% Jain Certified: Prepared strictly without onion, garlic, or root vegetables.</span>
              </div>
            )}
          </div>

          {/* Quantity Selector & Action */}
          {food.isAvailable ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-2xl">
                <span className="text-sm font-bold text-slate-700 pl-2">Select Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-xl bg-white text-slate-700 font-bold shadow-sm hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-bold text-slate-900 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-xl bg-white text-slate-700 font-bold shadow-sm hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-base hover:from-orange-700 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart — ₹{(food.price * quantity).toFixed(2)}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-center text-sm font-semibold">
              This item is currently unavailable and cannot be ordered right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
