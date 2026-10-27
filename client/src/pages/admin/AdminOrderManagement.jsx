import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Flame,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Calendar,
  Search,
  CreditCard,
  Banknote,
  QrCode,
  X,
  CalendarDays
} from 'lucide-react';

export const AdminOrderManagement = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Date filter from URL query param e.g. ?date=2026-09-02
  const dateFilter = searchParams.get('date') || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchOrders();

    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [token]);

  const handleUpdateStatus = async (orderId, targetStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      const data = await res.json();

      if (res.ok) {
        addToast(`Order status updated to '${targetStatus}'`, 'success');
        fetchOrders();
      } else {
        addToast(data.message || 'Failed to update order status.', 'error');
      }
    } catch (err) {
      addToast('Error updating status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(ord => {
    const matchesStatus = statusFilter === 'all' || ord.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      ord.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter: match orders placed on the selected date
    let matchesDate = true;
    if (dateFilter) {
      const orderDate = new Date(ord.createdAt || ord.orderDate).toISOString().slice(0, 10);
      matchesDate = orderDate === dateFilter;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  // Human-readable label for the active date filter
  const dateFilterLabel = dateFilter
    ? new Date(dateFilter + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const getNextStatusAction = (currentStatus) => {
    switch (currentStatus) {
      case 'Placed':
        return { label: 'Start Preparing', targetStatus: 'Preparing', icon: Flame, color: 'bg-orange-600 hover:bg-orange-700' };
      case 'Preparing':
        return { label: 'Mark Ready for Pickup', targetStatus: 'Ready', icon: Bell, color: 'bg-amber-600 hover:bg-amber-700' };
      case 'Ready':
        return { label: 'Mark Completed', targetStatus: 'Completed', icon: CheckCircle2, color: 'bg-emerald-600 hover:bg-emerald-700' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Live Kitchen Order Management</h1>
          <p className="text-xs text-slate-500">Monitor student orders and update kitchen preparation status in real-time</p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'Placed', 'Preparing', 'Ready', 'Completed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
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

      {/* Active Date Filter Banner */}
      {dateFilter && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <CalendarDays className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-black text-amber-800 uppercase tracking-wide block">
              Filtered by Date
            </span>
            <span className="text-sm font-bold text-amber-900">
              Showing all orders placed on <strong>{dateFilterLabel}</strong>
            </span>
            <span className="text-xs text-amber-700 ml-2">— {filteredOrders.length} order(s) found</span>
          </div>
          <button
            onClick={() => { setSearchParams({}); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear Date Filter
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order ID, Student Name, Email..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
          <p className="text-slate-500 text-xs">There are no orders matching your current filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const action = getNextStatusAction(order.status);
            const ActionIcon = action?.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-orange-200 transition-all"
              >
                {/* Top Row: Order ID, Student Info, Date & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-2xl text-slate-900">{order.orderId}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Ready' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'Preparing' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <User className="w-3.5 h-3.5 text-orange-600" /> {order.userName} ({order.userEmail})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs text-slate-400 block font-semibold">Grand Total</span>
                    <span className="text-2xl font-black text-orange-600">₹{order.grandTotal}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-block border ${
                      (order.status === 'Completed' || order.status === 'Ready' || order.paymentStatus?.includes('Paid'))
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      💳 {
                        (order.status === 'Completed' || order.status === 'Ready' || order.paymentStatus?.includes('Paid'))
                          ? (order.paymentMethod === 'Online UPI' ? 'Paid via Online UPI' : order.paymentMethod === 'Campus Card' ? 'Paid via SVKM Campus Card' : 'Paid Cash (Received at Counter)')
                          : `${order.paymentMethod || 'Cash'} (${order.paymentStatus || 'Pending Counter Payment'})`
                      }
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Ordered Dishes
                  </span>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-800 font-medium">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-slate-500 text-xs font-semibold">₹{item.price} × {item.quantity} = ₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                {/* Status Advancement Action Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-medium">
                    Order Flow: <strong className="text-slate-700">Placed → Preparing → Ready → Completed</strong>
                  </span>

                  {action ? (
                    <button
                      onClick={() => handleUpdateStatus(order.id, action.targetStatus)}
                      disabled={updatingId === order.id}
                      className={`px-5 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 ${action.color} active:scale-95 disabled:opacity-50`}
                    >
                      <ActionIcon className="w-4 h-4" />
                      {updatingId === order.id ? 'Updating...' : action.label}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Order Fully Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
