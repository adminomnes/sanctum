import { apiFetch } from '../api';
import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recovery modal state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiFetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales inválidas.');
      }

      localStorage.setItem('sanctum_admin_token', data.token);
      localStorage.setItem('sanctum_admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/admin/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail })
      });
      const data = await res.json();
      setRecoveryMsg(data.message);
      if (data.recoveryCode) {
        setRecoveryCode(data.recoveryCode);
      }
      setRecoveryStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail,
          code: recoveryCode,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al restablecer contraseña.');
      setRecoveryMsg('Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
      setTimeout(() => {
        setShowRecovery(false);
        setRecoveryStep(1);
        setRecoveryMsg(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, rgba(247, 37, 133, 0.15) 0%, rgba(23, 23, 23, 1) 75%)',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Top back button */}
      <button
        onClick={onBackToSite}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'var(--warm-white)',
          padding: '10px 18px',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← VOLVER A LA WEB PÚBLICA
      </button>

      {/* Login Box */}
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'var(--carbon)',
        border: '2px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        padding: '40px',
        position: 'relative'
      }}>
        {/* Decorative Top Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #F72585 0%, #FF5A36 50%, #E8FF55 100%)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: 'var(--warm-white)',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            SANCTUM
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--magenta)',
              marginLeft: '4px',
              boxShadow: '0 0 10px var(--magenta)'
            }} />
          </span>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--yellow)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            marginTop: '4px',
            textTransform: 'uppercase'
          }}>
            PANEL DE CONTROL COMERCIAL & OPERATIVO
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 90, 54, 0.15)',
            borderLeft: '4px solid var(--orange)',
            padding: '12px',
            color: 'var(--warm-white)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="var(--orange)" />
            <span>{error}</span>
          </div>
        )}

        {!showRecovery ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--warm-white)',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                CORREO ELECTRÓNICO
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', top: '15px', left: '14px', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sanctum.cl"
                  style={{
                    width: '100%',
                    background: '#111',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '12px 14px 12px 40px',
                    color: 'var(--warm-white)',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--warm-white)',
                  textTransform: 'uppercase'
                }}>
                  CONTRASEÑA
                </label>
                <button
                  type="button"
                  onClick={() => { setShowRecovery(true); setError(null); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--yellow)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', top: '15px', left: '14px', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    background: '#111',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '12px 14px 12px 40px',
                    color: 'var(--warm-white)',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '10px',
                background: 'var(--magenta)',
                color: 'var(--warm-white)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                padding: '16px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textTransform: 'uppercase',
                boxShadow: '0 8px 25px var(--magenta-glow)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{isLoading ? 'VERIFICANDO...' : 'INGRESAR AL PANEL'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Password Recovery Flow */
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--warm-white)',
              marginBottom: '12px',
              textTransform: 'uppercase'
            }}>
              RECUPERAR CONTRASEÑA
            </h3>

            {recoveryMsg && (
              <div style={{
                background: 'rgba(232, 255, 85, 0.1)',
                borderLeft: '4px solid var(--yellow)',
                padding: '10px',
                color: 'var(--warm-white)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                marginBottom: '16px'
              }}>
                {recoveryMsg}
              </div>
            )}

            {recoveryStep === 1 ? (
              <form onSubmit={handleRequestRecovery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  Ingresa tu correo para generar un código administrativo de restablecimiento.
                </p>
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="admin@sanctum.cl"
                  style={{
                    width: '100%',
                    background: '#111',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '12px',
                    color: 'var(--warm-white)',
                    fontSize: '0.92rem'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowRecovery(false); setError(null); }}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'var(--warm-white)',
                      padding: '12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem'
                    }}
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      background: 'var(--yellow)',
                      color: 'var(--carbon)',
                      border: 'none',
                      padding: '12px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}
                  >
                    SOLICITAR
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--warm-white)', marginBottom: '4px' }}>
                    CÓDIGO DE RECUPERACIÓN
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    placeholder="Ej. ABCD1234"
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '12px',
                      color: 'var(--yellow)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      fontWeight: 700
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--warm-white)', marginBottom: '4px' }}>
                    NUEVA CONTRASEÑA
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '12px',
                      color: 'var(--warm-white)',
                      fontSize: '0.92rem'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: 'var(--magenta)',
                    color: 'var(--warm-white)',
                    border: 'none',
                    padding: '14px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900
                  }}
                >
                  ACTUALIZAR CONTRASEÑA
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
