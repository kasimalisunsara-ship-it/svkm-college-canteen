import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, CheckCircle, ShieldAlert, GraduationCap, Briefcase, CreditCard } from 'lucide-react';
import { SvkmLogo } from '../components/SvkmLogo';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [sapId, setSapId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('Student');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isSvkmDomain = (emailStr) => {
    if (!emailStr) return false;
    const lower = emailStr.trim().toLowerCase();
    const validDomains = [
      'svkm.ac.in', 'svkm.edu.in', 'svkm.in', 'svkm.com',
      'nmims.edu', 'nmims.com', 'dwarkadas.ac.in'
    ];
    const domainPart = lower.split('@')[1] || '';
    return validDomains.some(d => domainPart === d || domainPart.endsWith('.' + d))
      || lower.includes('svkm') || lower.includes('nmims');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sapId.trim() || sapId.trim().length < 5) {
      setErrorMsg('Please enter a valid numeric SAP ID (e.g., 53013240071).');
      return;
    }

    if (!isSvkmDomain(email)) {
      setErrorMsg('Please use a valid SVKM email address (e.g. name@svkm.ac.in, name@svkm.com, or name@nmims.edu).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(name, email, sapId, password, confirmPassword, userType);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6">
        
        {/* SVKM Access Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 flex items-center gap-3 text-orange-800 text-xs font-bold">
          <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0" />
          <span>This canteen ordering system is exclusively available to SVKM students and teaching staff.</span>
        </div>

        <div className="text-center space-y-3 flex flex-col items-center justify-center">
          <SvkmLogo className="h-12 w-auto" showText={true} />
          <p className="text-slate-500 text-xs font-medium">Create account with your SAP ID & SVKM Email</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* User Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('Student')}
                className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  userType === 'Student'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-orange-600" /> SVKM Student
              </button>

              <button
                type="button"
                onClick={() => setUserType('Teaching Staff')}
                className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  userType === 'Teaching Staff'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-orange-600" /> SVKM Staff
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Mehta"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              SAP ID (e.g., 53013240071) *
            </label>
            <div className="relative">
              <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={sapId}
                onChange={(e) => setSapId(e.target.value)}
                placeholder="53013240071"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              SVKM Email ID (e.g., @svkm.ac.in or @svkm.com) *
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@svkm.ac.in or name@svkm.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
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
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <CheckCircle className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-sm hover:from-orange-700 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 active:scale-98"
          >
            {loading ? 'Registering Account...' : `Register as ${userType}`}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
