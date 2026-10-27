import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, ShieldCheck, GraduationCap, Briefcase, Ban, CreditCard } from 'lucide-react';
import { SvkmLogo } from '../components/SvkmLogo';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'customer' vs 'admin'
  const [activeTab, setActiveTab] = useState('customer');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(identifier, password, activeTab);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  const fillDemoSvkmStudent = () => {
    setActiveTab('customer');
    setIdentifier('53013240071');
    setPassword('student123');
  };

  const fillDemoSvkmStaff = () => {
    setActiveTab('customer');
    setIdentifier('53013240099');
    setPassword('staff123');
  };

  const fillDemoNonSvkm = () => {
    setActiveTab('customer');
    setIdentifier('john@otheruniv.edu');
    setPassword('user123');
  };

  const fillDemoAdmin = () => {
    setActiveTab('admin');
    setIdentifier('admin@cafeteria.edu');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 flex flex-col items-center justify-center">
          <SvkmLogo className="h-12 w-auto" showText={true} />
          <p className="text-slate-500 text-xs font-medium">Select your portal to sign in to cafeteria services</p>
        </div>

        {/* 2 Portal Tabs: Customer vs Admin */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('customer');
              setIdentifier('');
              setPassword('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'customer'
                ? 'bg-white text-orange-600 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Customer Portal
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setIdentifier('');
              setPassword('');
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin Portal
          </button>
        </div>

        {/* SVKM Badge for Customer */}
        {activeTab === 'customer' ? (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center text-orange-800 text-xs font-bold flex items-center justify-center gap-2">
            <span>🔒 SVKM Students, Teachers & Staff Access Only</span>
          </div>
        ) : (
          <div className="bg-slate-900 text-amber-300 rounded-2xl p-3 text-center text-xs font-bold flex items-center justify-center gap-2">
            <span>🛡️ Cafeteria Admin & Kitchen Management</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              {activeTab === 'customer' ? "SAP ID or SVKM Email ID" : "Admin Email Address"}
            </label>
            <div className="relative">
              {activeTab === 'customer' ? (
                <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              ) : (
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={activeTab === 'customer' ? "e.g. 53013240071 or name@svkm.ac.in" : "admin@cafeteria.edu"}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-amber-400 hover:bg-slate-800 shadow-slate-900/20'
                : 'bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-700 hover:to-amber-600 shadow-orange-500/25'
            }`}
          >
            {loading ? 'Authenticating...' : `Sign In to ${activeTab === 'admin' ? 'Admin Portal' : 'Customer Portal'}`}
          </button>
        </form>

        {activeTab === 'customer' && (
          <p className="text-center text-xs text-slate-500 pt-1">
            New SVKM Student or Staff?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:underline">
              Register Account with SAP ID
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
