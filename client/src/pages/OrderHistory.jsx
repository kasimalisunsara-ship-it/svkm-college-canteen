import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';

export const OrderHistory = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to load orders history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Order History</h1>
          <p className="text-xs text-slate-500">Track and review all your college cafeteria orders</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'Placed', 'Preparing', 'Ready', 'Completed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-semibold">Fetching your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
          <p className="text-slate-500 text-xs">
            {statusFilter === 'all'
              ? "You haven't placed any orders yet."
              : `No orders currently marked as '${statusFilter}'.`}
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs"
          >
            Order Food Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-slate-900 text-lg group-hover:text-orange-600 transition-colors">
                    {order.orderId}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'Ready' ? 'bg-amber-100 text-amber-800' :
                    order.status === 'Preparing' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Items Summary */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                  <span className="text-xs text-slate-400 font-medium">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Grand Total</span>
                    <span className="text-lg font-black text-slate-900">₹{order.grandTotal}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold block border mt-0.5 ${
                      (order.status === 'Completed' || order.status === 'Ready' || order.paymentStatus?.includes('Paid'))
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {
                        (order.status === 'Completed' || order.status === 'Ready' || order.paymentStatus?.includes('Paid'))
                          ? (order.paymentMethod === 'Online UPI' ? 'Paid via Online UPI' : order.paymentMethod === 'Campus Card' ? 'Paid via SVKM Campus Card' : 'Paid Cash (Received at Counter)')
                          : `${order.paymentMethod || 'Cash'} (Pending Counter)`
                      }
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
