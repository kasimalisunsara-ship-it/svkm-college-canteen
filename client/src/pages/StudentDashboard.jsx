import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { OrderProgressTracker } from '../components/OrderProgressTracker';
import {
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, token } = useAuth();
  const { cartCount, cartSubtotal } = useCart();
  const [activeOrder, setActiveOrder] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecentOrders(data.slice(0, 3));
          
          // Find first uncompleted order for live tracker
          const active = data.find(o => o.status !== 'Completed');
          setActiveOrder(active || null);
        }
      } catch (err) {
        console.error('Failed to load student orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Live poll order status updates
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-8 md:p-10 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> College Cafeteria Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-black">
              Welcome back, {user ? user.name : 'Student'}! 👋
            </h1>
            <p className="text-orange-100 text-sm md:text-base">
              Ready for a delicious meal break? Browse today's cafeteria specials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="px-6 py-3 rounded-2xl bg-white text-orange-600 font-extrabold text-sm shadow-md hover:bg-orange-50 transition-colors flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" /> Browse Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Active Order Live Tracker (if exists) */}
      {activeOrder && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600 animate-pulse" /> Active Order Tracker
            </h2>
            <Link
              to={`/orders/${activeOrder.id}`}
              className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
            >
              Order Details ({activeOrder.orderId}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <OrderProgressTracker status={activeOrder.status} />
        </section>
      )}

      {/* Quick Action Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Menu Access Card */}
        <Link
          to="/menu"
          className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              Full Food Menu
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Explore snacks, hot beverages, filling thalis, fast food items and delicious desserts.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-orange-600 gap-1 pt-2">
            View Menu <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Cart Summary Card */}
        <Link
          to="/cart"
          className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                Shopping Cart
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Subtotal: <span className="font-extrabold text-slate-900 text-sm">₹{cartSubtotal.toFixed(2)}</span>
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-orange-600 gap-1 pt-2">
            Checkout Cart <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Recent Orders Card */}
        <Link
          to="/orders"
          className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              Order History
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Review your previous campus cafeteria orders and re-order your favorite meals.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-orange-600 gap-1 pt-2">
            View All Orders <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* Recent Orders List Preview */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Campus Orders</h2>
          <Link to="/orders" className="text-xs font-bold text-orange-600 hover:underline">
            See All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-sm font-medium">You haven't placed any orders yet.</p>
            <Link to="/menu" className="text-xs font-bold text-orange-600 hover:underline">
              Order food now →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map(ord => (
              <div key={ord.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ord.orderId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      ord.status === 'Ready' ? 'bg-amber-100 text-amber-800' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 text-sm">₹{ord.grandTotal}</span>
                  <span className="block text-[10px] text-slate-400">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
