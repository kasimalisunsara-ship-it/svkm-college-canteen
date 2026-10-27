import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SvkmLogo } from './SvkmLogo';
import {
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  LayoutDashboard,
  ChefHat,
  FolderTree,
  ClipboardList,
  LogOut,
  UserCheck,
  Menu as MenuIcon,
  X,
  Sparkles,
  Sparkle
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to={role === 'admin' ? '/admin' : '/'} className="flex items-center gap-3 group">
            <SvkmLogo className="h-9 w-auto" showText={false} />
            <div className="flex flex-col text-left">
              <span className="text-xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-slate-900 bg-clip-text text-transparent leading-tight">
                The Feed Zone
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {role === 'admin' ? 'SVKM Admin Portal' : 'SVKM Canteen'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {role === 'admin' ? (
              // ADMIN NAV
              <>
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive('/admin') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/admin/foods"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive('/admin/foods') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  Manage Food
                </Link>

                <Link
                  to="/admin/categories"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive('/admin/categories') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FolderTree className="w-4 h-4" />
                  Categories
                </Link>

                <Link
                  to="/admin/orders"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive('/admin/orders') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Live Orders
                </Link>
              </>
            ) : (
              // STUDENT NAV
              <>
                <Link
                  to="/"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive('/') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/menu"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive('/menu') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Food Menu
                </Link>

                {user && (
                  <Link
                    to="/orders"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive('/orders') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    My Orders
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Buttons & User Badge */}
          <div className="flex items-center gap-3">
            {role !== 'admin' && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center gap-2"
                title="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline-block text-xs font-semibold">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white font-bold text-xs rounded-full flex items-center justify-center shadow-sm shadow-orange-500/30 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">{user.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{user.userType || user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 rounded-xl shadow-sm shadow-orange-500/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {role === 'admin' ? (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/foods"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Manage Foods
              </Link>
              <Link
                to="/admin/categories"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Manage Categories
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Live Student Orders
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Dashboard
              </Link>
              <Link
                to="/menu"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Food Menu
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
              >
                My Cart ({cartCount})
              </Link>
              {user && (
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  My Order History
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};
