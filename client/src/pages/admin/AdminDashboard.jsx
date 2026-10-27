import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils,
  FolderTree,
  ClipboardList,
  CheckCircle2,
  Clock,
  Flame,
  Bell,
  TrendingUp,
  PlusCircle,
  ChevronRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // Live poll admin metrics
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-semibold">Loading admin statistics...</p>
      </div>
    );
  }

  const { stats, recentOrders } = data || { stats: {}, recentOrders: [] };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Management Portal
          </span>
          <h1 className="text-3xl font-black text-slate-900">Cafeteria Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/foods"
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add Food Item
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Foods</span>
            <Utensils className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalFoodItems || 0}</div>
          <span className="text-[11px] font-semibold text-emerald-600">
            {stats.availableFoodItems || 0} Available
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Categories</span>
            <FolderTree className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalCategories || 0}</div>
          <span className="text-[11px] font-semibold text-slate-400">Dynamic Menu Groups</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
            <ClipboardList className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalOrders || 0}</div>
          <span className="text-[11px] font-semibold text-orange-600">
            {stats.placedOrders + stats.preparingOrders + stats.readyOrders} Active
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Completed Sales</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">₹{stats.totalRevenue || 0}</div>
          <span className="text-[11px] font-semibold text-emerald-600">
            {stats.completedOrders || 0} Delivered Orders
          </span>
        </div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Live Kitchen Order Flow</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <span className="text-2xl font-black text-blue-900 block">{stats.placedOrders || 0}</span>
            <span className="text-xs font-bold text-blue-700 uppercase">Placed</span>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
            <Flame className="w-6 h-6 text-orange-600 mx-auto mb-1 animate-pulse" />
            <span className="text-2xl font-black text-orange-900 block">{stats.preparingOrders || 0}</span>
            <span className="text-xs font-bold text-orange-700 uppercase">Preparing</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <Bell className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <span className="text-2xl font-black text-amber-900 block">{stats.readyOrders || 0}</span>
            <span className="text-xs font-bold text-amber-700 uppercase">Ready for Pickup</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <span className="text-2xl font-black text-emerald-900 block">{stats.completedOrders || 0}</span>
            <span className="text-xs font-bold text-emerald-700 uppercase">Completed</span>
          </div>
        </div>
      </div>

      {/* Recent Incoming Student Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">Recent Student Orders</h2>
          <Link to="/admin/orders" className="text-xs font-bold text-orange-600 hover:underline">
            View All Live Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-bold text-slate-900">{ord.orderId}</td>
                    <td className="py-3 font-semibold text-slate-800">{ord.userName}</td>
                    <td className="py-3 text-slate-600 max-w-xs truncate">
                      {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 font-extrabold text-slate-900">₹{ord.grandTotal}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        ord.status === 'Ready' ? 'bg-amber-100 text-amber-800' :
                        ord.status === 'Preparing' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Earnings Breakdown & Month-End Financial Report */}
      <MonthEndReportSection token={token} />
    </div>
  );
};

// Component for Daily Earnings & Month-End Financial Statement
const MonthEndReportSection = ({ token }) => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/reports?month=${selectedMonth}&year=${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        }
      } catch (err) {
        console.error('Failed to load monthly report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token, selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  const monthSummary = report?.monthSummary || {
    totalRevenue: 0,
    completedOrdersCount: 0,
    totalItemsSold: 0,
    averageOrderValue: 0,
    paymentBreakdown: { cashTotal: 0, upiTotal: 0, campusCardTotal: 0 },
    topSellingDishes: []
  };

  const dailyEarnings = report?.dailyEarnings || [];
  const monthInfo = report?.monthInfo || { monthName: 'September', year: 2026 };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg space-y-6 print:border-none print:shadow-none print:p-0">
      
      {/* Section Header & Month Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
            Financial Accounting & Revenue
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            Daily Earnings & Month-End Financial Report
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive daily sales ledger & monthly revenue breakdown for cafeteria auditing
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {[
              { id: 1, name: 'January' },
              { id: 2, name: 'February' },
              { id: 3, name: 'March' },
              { id: 4, name: 'April' },
              { id: 5, name: 'May' },
              { id: 6, name: 'June' },
              { id: 7, name: 'July' },
              { id: 8, name: 'August' },
              { id: 9, name: 'September' },
              { id: 10, name: 'October' },
              { id: 11, name: 'November' },
              { id: 12, name: 'December' }
            ].map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          {/* Print/Export Button */}
          <button
            onClick={handlePrint}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-colors flex items-center gap-1.5"
          >
            🖨️ Export PDF / Print Statement
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs mt-2 font-semibold">Generating Month-End Financial Report...</p>
        </div>
      ) : (
        <>
          {/* Month-End Financial Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                {monthInfo.monthName} {monthInfo.year} Revenue
              </span>
              <div className="text-3xl font-black text-white">₹{monthSummary.totalRevenue}</div>
              <span className="text-[11px] text-slate-300 font-semibold block pt-1">
                From {monthSummary.completedOrdersCount} Completed Orders
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                💵 Cash Received
              </span>
              <div className="text-2xl font-black text-emerald-900">₹{monthSummary.paymentBreakdown.cashTotal}</div>
              <span className="text-[11px] font-semibold text-emerald-700 block">Verified at Counter</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest block">
                📱 Online UPI Received
              </span>
              <div className="text-2xl font-black text-blue-900">₹{monthSummary.paymentBreakdown.upiTotal}</div>
              <span className="text-[11px] font-semibold text-blue-700 block">Instant Gateway Verification</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">
                Average Order Value
              </span>
              <div className="text-2xl font-black text-amber-900">₹{monthSummary.averageOrderValue}</div>
              <span className="text-[11px] font-semibold text-amber-700 block">{monthSummary.totalItemsSold} Items Sold Total</span>
            </div>
          </div>

          {/* Top Selling Dishes of the Month */}
          {monthSummary.topSellingDishes.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                🔥 Top 5 Best-Selling Dishes ({monthInfo.monthName} {monthInfo.year})
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {monthSummary.topSellingDishes.map((dish, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-slate-800 shadow-2xs">
                    #{idx + 1} {dish.name} — <strong className="text-orange-600">{dish.quantity} sold</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Daily Earnings Breakdown Table (Day 1 to Month-End) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Daily Sales Ledger ({monthInfo.monthName} 1 – {monthInfo.totalDays}, {monthInfo.year})
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                Daily breakdown of every day of the month
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Day / Date</th>
                    <th className="py-3 px-4">Day of Week</th>
                    <th className="py-3 px-4 text-center">Completed Orders</th>
                    <th className="py-3 px-4 text-right">Cash Collected</th>
                    <th className="py-3 px-4 text-right">Online UPI</th>
                    <th className="py-3 px-4 text-right">Campus Card</th>
                    <th className="py-3 px-4 text-right">Total Daily Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dailyEarnings.map(day => {
                    // day.date is already in YYYY-MM-DD format from the API
                    const isoDate = day.date; // e.g. "2026-09-02"
                    const hasOrders = day.completedOrdersCount > 0;
                    // Format: "02 Sep"
                    const displayDate = new Date(isoDate + 'T12:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                    return (
                    <tr
                      key={day.dayNumber}
                      onClick={() => hasOrders && navigate(`/admin/orders?date=${isoDate}`)}
                      title={hasOrders ? `Click to view all orders on ${day.dayOfWeek}, ${day.date}` : ''}
                      className={`transition-colors ${
                        hasOrders
                          ? 'bg-orange-50/30 font-bold cursor-pointer hover:bg-orange-100/60 hover:shadow-sm'
                          : 'hover:bg-slate-50 text-slate-400'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        Day {day.dayNumber} <span className="text-slate-400 font-normal">({displayDate})</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{day.dayOfWeek}</td>
                      <td className="py-3 px-4 text-center">
                        {hasOrders ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold underline decoration-dotted cursor-pointer">
                            {day.completedOrdersCount} orders ↗
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-700">
                        {day.cashRevenue > 0 ? `₹${day.cashRevenue}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-blue-700">
                        {day.upiRevenue > 0 ? `₹${day.upiRevenue}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-amber-700">
                        {day.campusCardRevenue > 0 ? `₹${day.campusCardRevenue}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                        {day.revenue > 0 ? (
                          <span className="text-orange-600">₹{day.revenue}</span>
                        ) : (
                          <span className="text-slate-300 font-normal">₹0.00</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}

                  {/* TOTAL MONTH-END SUMMARY ROW */}
                  <tr className="bg-slate-900 text-white font-black text-sm">
                    <td colSpan={2} className="py-4 px-4 uppercase tracking-widest text-amber-400">
                      TOTAL MONTH-END SUMMARY ({monthInfo.monthName} {monthInfo.year})
                    </td>
                    <td className="py-4 px-4 text-center text-amber-300">
                      {monthSummary.completedOrdersCount} Orders Total
                    </td>
                    <td className="py-4 px-4 text-right text-emerald-300">
                      ₹{monthSummary.paymentBreakdown.cashTotal}
                    </td>
                    <td className="py-4 px-4 text-right text-blue-300">
                      ₹{monthSummary.paymentBreakdown.upiTotal}
                    </td>
                    <td className="py-4 px-4 text-right text-amber-300">
                      ₹{monthSummary.paymentBreakdown.campusCardTotal}
                    </td>
                    <td className="py-4 px-4 text-right text-amber-400 text-base">
                      ₹{monthSummary.totalRevenue}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
