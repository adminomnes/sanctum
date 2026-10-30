import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X, Sparkles, MessageCircle, Lock } from 'lucide-react';
import { CONTACT_CONFIG } from '../config';

interface HeaderProps {
  onOpenQuote: (service?: string) => void;
  onNavigateToAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuote, onNavigateToAdmin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#hero' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Campañas', href: '#galeria' },
    { label: 'Eventos', href: '#eventos' },
    { label: 'Cobertura', href: '#cobertura' },
    { label: 'Contacto', href: '#cotizacion' },
  ];

  const headerWhatsappUrl = CONTACT_CONFIG.getWhatsAppUrl(CONTACT_CONFIG.messages.quotes);

  return (
    <header 
      className={`header-nav ${isScrolled ? 'is-compact' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: isScrolled ? '12px 24px' : '24px 32px',
        background: isScrolled ? 'rgba(23, 23, 23, 0.94)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent'
      }}
    >
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Provisional Brand Typography (strictly preserved as text) */}
        <a 
          href="#hero" 
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            textDecoration: 'none'
          }}
          aria-label="SANCTUM Inicio"
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: isScrolled ? '1.75rem' : '2.1rem',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: 'var(--warm-white)',
            transition: 'font-size 0.3s ease',
            textTransform: 'uppercase',
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
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: 'rgba(255, 253, 248, 0.5)',
            textTransform: 'uppercase',
            display: isScrolled ? 'none' : 'inline-block'
          }}>
            Norte de Chile
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav 
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '32px'
          }}
          className="desktop-nav-links"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--warm-white)',
                letterSpacing: '0.02em',
                position: 'relative',
                padding: '6px 0',
                transition: 'color 0.2s ease',
                opacity: 0.88
              }}
              className="nav-link-hover"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Button & Header WhatsApp & Admin Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Header Direct WhatsApp Button */}
          <a
            href={headerWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat directo con SANCTUM (+56 9 8565 8683)"
            className="btn-whatsapp-header"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#25D366',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '0.04em',
              padding: isScrolled ? '10px 14px' : '11px 16px',
              border: 'none',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
            }}
          >
            <MessageCircle size={15} strokeWidth={2.6} />
            <span className="whatsapp-header-text">WHATSAPP</span>
          </a>

          {/* Cotizar Proyecto CTA Button */}
          <button
            onClick={() => onOpenQuote()}
            className="btn-cotizar-header"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--yellow)',
              color: 'var(--carbon)',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.04em',
              padding: isScrolled ? '10px 18px' : '12px 22px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              textTransform: 'uppercase',
              boxShadow: '0 4px 20px rgba(232, 255, 85, 0.25)'
            }}
          >
            <span>COTIZAR PROYECTO</span>
            <ArrowUpRight size={16} strokeWidth={2.8} />
          </button>

          {/* Admin Direct Button (Always visible on page) */}
          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              title="Panel de Administración Privado (/admin)"
              className="btn-admin-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--warm-white)',
                padding: isScrolled ? '9px 12px' : '11px 14px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase'
              }}
            >
              <Lock size={13} color="var(--yellow)" />
              <span className="admin-btn-text">ADMIN</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle-btn"
            style={{
              display: 'none',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--warm-white)',
              padding: '8px',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          background: 'var(--carbon)',
          borderBottom: '2px solid var(--magenta)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--warm-white)',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              {link.label}
            </a>
          ))}
          
          {/* Mobile WhatsApp Link */}
          <a
            href={headerWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: '#25D366',
              color: '#FFFFFF',
              fontWeight: 800,
              padding: '16px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <MessageCircle size={18} />
            HABLAR POR WHATSAPP (+56 9 8565 8683)
          </a>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenQuote();
            }}
            style={{
              background: 'var(--magenta)',
              color: 'var(--warm-white)',
              fontWeight: 800,
              padding: '16px',
              border: 'none',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={18} />
            COTIZAR MI PROYECTO
          </button>

          {onNavigateToAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToAdmin();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--yellow)',
                fontWeight: 700,
                padding: '12px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <Lock size={15} />
              PANEL ADMINISTRATIVO PRIVADO (/ADMIN)
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }
        @media (max-width: 859px) {
          .mobile-toggle-btn {
            display: flex !important;
          }
          .whatsapp-header-text, .admin-btn-text {
            display: none;
          }
        }
        .nav-link-hover:hover {
          color: var(--yellow) !important;
          opacity: 1 !important;
        }
        .btn-cotizar-header:hover {
          background: var(--magenta) !important;
          color: var(--warm-white) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(247, 37, 133, 0.45) !important;
        }
        .btn-whatsapp-header:hover {
          background: #1EBE5D !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.5) !important;
        }
        .btn-admin-pill:hover {
          background: rgba(255, 255, 255, 0.18) !important;
          border-color: var(--yellow) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </header>
  );
};
