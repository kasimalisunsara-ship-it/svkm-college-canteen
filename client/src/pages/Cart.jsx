import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { FoodImage } from '../components/FoodImage';

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartSubtotal, cartCount } = useCart();
  const navigate = useNavigate();

  const grandTotal = cartSubtotal; // Can add tax/packaging if needed, grand total = subtotal

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          Looks like you haven't added any cafeteria food items to your cart yet.
        </p>
        <Link
          to="/menu"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-sm shadow-md hover:from-orange-700 hover:to-amber-600 transition-all flex items-center gap-2"
        >
          Browse Menu Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Your Shopping Cart</h1>
            <p className="text-xs text-slate-500">{cartCount} items in cart</p>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.foodId}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <FoodImage
                  src={item.image}
                  alt={item.name}
                  categoryName={item.categoryName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                  {item.categoryName}
                </span>
                <h3 className="font-bold text-slate-900 text-sm truncate">{item.name}</h3>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  ₹{item.price} × {item.quantity} = <span className="font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.foodId, -1)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold shadow-sm hover:bg-orange-600 hover:text-white transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-slate-800 text-sm w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.foodId, 1)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold shadow-sm hover:bg-orange-600 hover:text-white transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.foodId)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-6 h-fit">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Order Calculation
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Items Total ({cartCount})</span>
              <span>₹{cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Cafeteria Service Fee</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-black text-base text-slate-900">
              <span>Grand Total</span>
              <span className="text-2xl text-orange-600">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-base shadow-lg shadow-orange-500/25 hover:from-orange-700 hover:to-amber-600 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            Proceed to Checkout <ArrowRight className="w-5 h-5" />
          </button>

          <Link
            to="/menu"
            className="block text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Add More Items from Menu
          </Link>
        </div>
      </div>
    </div>
  );
};
