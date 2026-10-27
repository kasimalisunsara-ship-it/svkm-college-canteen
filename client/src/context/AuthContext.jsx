import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campus_token') || null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('campus_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (identifier, password, portalType = 'customer') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, portalType })
      });

      const data = await res.json();

      if (!res.ok) {
        addToast(data.message || 'Login failed. Please check your credentials.', 'error');
        return { success: false, message: data.message };
      }

      localStorage.setItem('campus_token', data.token);
      setToken(data.token);
      setUser(data.user);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true, user: data.user };
    } catch (err) {
      addToast('Network error connecting to cafeteria server.', 'error');
      return { success: false, message: 'Network error.' };
    }
  };

  const register = async (name, email, sapId, password, confirmPassword, userType) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, sapId, password, confirmPassword, userType })
      });

      const data = await res.json();

      if (!res.ok) {
        addToast(data.message || 'Registration failed.', 'error');
        return { success: false, message: data.message };
      }

      localStorage.setItem('campus_token', data.token);
      setToken(data.token);
      setUser(data.user);
      addToast('Account created successfully! Welcome to SVKM Canteen.', 'success');
      return { success: true, user: data.user };
    } catch (err) {
      addToast('Network error during registration.', 'error');
      return { success: false, message: 'Network error.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('campus_token');
    setToken(null);
    setUser(null);
    addToast('You have been logged out.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role, userType: user?.userType, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
