import React, { useState } from 'react';
import { ArrowUp, MapPin, X, Lock, MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '../config';

interface FooterProps {
  onOpenQuote: () => void;
  onNavigateToAdmin?: () => void;
  siteContent?: Record<string, string>;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQuote, onNavigateToAdmin, siteContent = {} }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);

  const baseline = siteContent['footer_baseline'] || CONTACT_CONFIG.baseline;
  const contactPhone = siteContent['contact_phone'] || '+56 9 8565 8683';
  const contactEmail = siteContent['contact_email'] || 'contacto@sanctum.cl';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      style={{
        background: 'var(--carbon)',
        color: 'var(--warm-white)',
        padding: '100px 24px 40px',
        borderTop: '2px solid rgba(255, 255, 255, 0.08)',
        position: 'relative'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* Main Footer Grid */}
        <div 
          className="footer-grid-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '64px',
            marginBottom: '80px'
          }}
        >
          {/* Brand Column (strictly preserves name as typography text) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: 'var(--warm-white)',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              SANCTUM
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--magenta)',
                marginLeft: '6px',
                boxShadow: '0 0 12px var(--magenta)'
              }} />
            </span>

            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              color: 'var(--yellow)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              MARKETING · PUBLICIDAD · EVENTOS
            </div>

            <p style={{
              color: 'rgba(255, 253, 248, 0.7)',
              fontSize: '1rem',
              lineHeight: 1.6,
              maxWidth: '380px',
              margin: 0
            }}>
              Agencia de alto impacto especializada en activaciones comerciales, contratación de promotoras, campañas navideñas y producción de eventos en toda la zona norte de Chile.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              color: 'var(--orange)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} />
                <span>Arica a Coquimbo, Chile</span>
              </div>
              <div style={{ opacity: 0.8, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                {contactPhone} · {contactEmail}
              </div>
            </div>
          </div>

          {/* Column 2: Servicios */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'var(--magenta)',
              textTransform: 'uppercase'
            }}>
              SERVICIOS
            </span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
              <li><a href="#service-marketing" className="footer-link">Marketing y Publicidad</a></li>
              <li><a href="#service-promotoras" className="footer-link">Promotoras y Promotores</a></li>
              <li><a href="#service-navidad" className="footer-link">Campañas de Navidad</a></li>
              <li><a href="#service-corporativos" className="footer-link">Eventos Corporativos</a></li>
              <li><a href="#service-privados" className="footer-link">Eventos Privados</a></li>
            </ul>
          </div>

          {/* Column 3: Cobertura & Navegación */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'var(--yellow)',
              textTransform: 'uppercase'
            }}>
              ZONA NORTE
            </span>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
              <li><a href="#cobertura" className="footer-link">Antofagasta & Calama</a></li>
              <li><a href="#cobertura" className="footer-link">Iquique & Alto Hospicio</a></li>
              <li><a href="#cobertura" className="footer-link">Arica & Tocopilla</a></li>
              <li><a href="#cobertura" className="footer-link">Copiapó & Vallenar</a></li>
              <li><a href="#cobertura" className="footer-link">La Serena & Coquimbo</a></li>
            </ul>
          </div>

          {/* Column 4: Contacto & Acción */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'var(--orange)',
              textTransform: 'uppercase'
            }}>
              CONTACTO
            </span>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>
              Inicia tu cotización en línea o solicita atención técnica directa.
            </p>
            <button
              onClick={onOpenQuote}
              style={{
                background: 'var(--magenta)',
                color: 'var(--warm-white)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.88rem',
                letterSpacing: '0.04em',
                padding: '14px 20px',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                textTransform: 'uppercase',
                transition: 'all 0.25s ease'
              }}
              className="footer-btn-quote"
            >
              COTIZAR PROYECTO
            </button>

            <a
              href={CONTACT_CONFIG.getWhatsAppUrl(CONTACT_CONFIG.messages.quotes)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                padding: '12px 20px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'all 0.25s ease'
              }}
              className="footer-btn-whatsapp"
            >
              <MessageCircle size={16} />
              WHATSAPP: +56 9 8565 8683
            </a>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={() => setShowPrivacy(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 253, 248, 0.5)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Política de Privacidad
              </button>

              {onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 253, 248, 0.4)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                    marginTop: '4px'
                  }}
                  title="Acceso Privado Administrador"
                >
                  <Lock size={12} />
                  <span>Acceso Panel Privado (/admin)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Big Agency Baseline Closing Statement */}
        <div style={{
          padding: '48px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          margin: '40px 0'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5.5vw, 4.8rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: 'var(--warm-white)',
            margin: 0
          }}>
            {baseline}
          </h2>
        </div>

        {/* Bottom Bar: Copyright & Scroll to top */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          paddingTop: '20px',
          color: 'rgba(255, 253, 248, 0.5)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem'
        }}>
          <div>
            © {new Date().getFullYear()} SANCTUM. Todos los derechos reservados. Producción y marketing para la zona norte de Chile.
          </div>

          <button
            onClick={scrollToTop}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--warm-white)',
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem'
            }}
            className="scroll-top-btn"
          >
            <span>SUBIR AL INICIO</span>
            <ArrowUp size={14} />
          </button>
        </div>

      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div 
          onClick={() => setShowPrivacy(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              background: 'var(--carbon)',
              border: '2px solid var(--magenta)',
              padding: '36px',
              color: 'var(--warm-white)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowPrivacy(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--warm-white)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '16px' }}>
              POLÍTICA DE PRIVACIDAD
            </h3>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              En SANCTUM tratamos la información ingresada a través de nuestros canales y formularios de cotización con estricta confidencialidad. Los datos de contacto, requerimientos de campaña y presupuestos referenciales son utilizados única y exclusivamente con el fin de coordinar y evaluar técnica y comercialmente los proyectos en la zona norte de Chile. No compartimos ni vendemos datos a terceros.
            </p>
          </div>
        </div>
      )}

      <style>{`
        .footer-link {
          color: rgba(255, 253, 248, 0.7);
          font-size: 0.92rem;
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-block;
        }
        .footer-link:hover {
          color: var(--yellow);
          transform: translateX(4px);
        }
        .footer-btn-quote:hover {
          background: var(--yellow) !important;
          color: var(--carbon) !important;
        }
        .footer-btn-whatsapp:hover {
          opacity: 0.88;
        }
        .scroll-top-btn:hover {
          background: var(--magenta) !important;
          border-color: var(--magenta) !important;
        }
        @media (max-width: 900px) {
          .footer-grid-layout {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
};
