import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { AiChatbot } from './components/AiChatbot';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { Menu } from './pages/Menu';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderHistory } from './pages/OrderHistory';
import { OrderTracking } from './pages/OrderTracking';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminFoodManagement } from './pages/admin/AdminFoodManagement';
import { AdminCategoryManagement } from './pages/admin/AdminCategoryManagement';
import { AdminOrderManagement } from './pages/admin/AdminOrderManagement';

// Protected Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Home Container (Renders Student Dashboard if logged in, or Home if guest)
const HomeOrDashboard = () => {
  const { user, role } = useAuth();
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (user) return <StudentDashboard />;
  return <Home />;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Public & Student Routes */}
          <Route path="/" element={<HomeOrDashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/foods"
            element={
              <AdminRoute>
                <AdminFoodManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategoryManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrderManagement />
              </AdminRoute>
            }
          />

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global AI Assistant Floating Chatbot */}
      <AiChatbot />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">The Feed Zone — SVKM Cafeteria Platform</p>
        <p className="mt-1 text-slate-400">Powered by BiteBot AI • Exclusively for SVKM Students & Staff</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
