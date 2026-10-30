import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import type { User } from './types';

interface AdminRootProps {
  onBackToSite: () => void;
}

export const AdminRoot: React.FC<AdminRootProps> = ({ onBackToSite }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('sanctum_admin_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sanctum_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await apiFetch('/api/admin/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Sesión expirada.');
        }

        const data = await res.json();
        setUser(data.user);
      } catch {
        localStorage.removeItem('sanctum_admin_token');
        localStorage.removeItem('sanctum_admin_user');
        setToken(null);
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleLoginSuccess = (newToken: string, loggedUser: User) => {
    setToken(newToken);
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('sanctum_admin_token');
    localStorage.removeItem('sanctum_admin_user');
    setToken(null);
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--carbon)',
        color: 'var(--warm-white)',
        fontFamily: 'var(--font-mono)'
      }}>
        Verificando sesión administrativa...
      </div>
    );
  }

  if (!token || !user) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToSite={onBackToSite}
      />
    );
  }

  return (
    <AdminDashboard
      user={user}
      token={token}
      onLogout={handleLogout}
      onGoToSite={onBackToSite}
    />
  );
};

