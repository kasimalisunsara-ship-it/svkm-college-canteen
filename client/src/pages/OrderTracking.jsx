import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OrderProgressTracker } from '../components/OrderProgressTracker';
import { Clock, ArrowLeft, RefreshCw, Calendar, Tag, ShieldCheck, Smartphone, Banknote } from 'lucide-react';
import { FoodImage } from '../components/FoodImage';

export const OrderTracking = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setErrorMsg('');
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Order not found.');
      }
    } catch (e) {
      setErrorMsg('Failed to connect to cafeteria server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !id) return;
    fetchOrder();

    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [id, token]);

  if (loading) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-semibold">Loading live order status...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
        <Clock className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-slate-500 text-xs">{errorMsg || 'We could not locate this order ID.'}</p>
        <Link to="/orders" className="inline-block px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl">
          Back to Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Orders
        </Link>

        <button
          onClick={fetchOrder}
          className="text-xs font-bold text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {/* Order Title Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block">
            Cafeteria Order Reference
          </span>
          <h1 className="text-3xl font-black font-mono text-amber-400">{order.orderId}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="text-xs text-slate-400 block font-semibold">Total Amount</span>
          <span className="text-2xl font-black text-white">₹{order.grandTotal}</span>
          <div className="flex items-center justify-end gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
              (order.status === 'Completed' || order.status === 'Ready' || order.paymentStatus?.includes('Paid'))
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              💳 {
                (order.status === 'Completed' || order.status === 'Ready' || order.paymentStatus?.includes('Paid'))
                  ? (order.paymentMethod === 'Online UPI' ? 'Paid via Online UPI' : order.paymentMethod === 'Campus Card' ? 'Paid via SVKM Campus Card' : 'Paid Cash (Received at Counter)')
                  : `${order.paymentMethod || 'Cash'} (Pending Counter Payment)`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Visual Timeline Status Tracker */}
      <OrderProgressTracker status={order.status} />

      {/* Ordered Items Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
          Ordered Items ({order.items.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <FoodImage
                    src={item.image}
                    alt={item.name}
                    categoryName={item.categoryName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  <span className="text-xs text-slate-500 font-medium">
                    ₹{item.price} × {item.quantity}
                  </span>
                </div>
              </div>

              <span className="font-extrabold text-slate-900 text-sm">
                ₹{item.subtotal}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-black text-lg text-slate-900">
          <span>Grand Total</span>
          <span className="text-orange-600">₹{order.grandTotal}</span>
        </div>
      </div>
    </div>
  );
};
