import React from 'react';
import { ArrowDownRight, Sparkles, MapPin, MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '../config';

interface HeroProps {
  onOpenQuote: () => void;
  siteContent?: Record<string, string>;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote, siteContent = {} }) => {
  const badge = siteContent['hero_badge'] || 'MARKETING · BRAND ACTIVATIONS · EVENTS';
  const titleLine1 = siteContent['hero_title_line1'] || 'NO HACEMOS RUIDO.';
  const titleLine2 = siteContent['hero_title_line2'] || 'CREAMOS IMPACTO.';
  const quote = siteContent['hero_quote'] || '"Convertimos ideas en campañas, marcas en experiencias y eventos en momentos que nadie olvida".';
  const subquote = siteContent['hero_subquote'] || 'Publicidad, equipos promocionales y experiencias en toda la zona norte de Chile.';
  const mainImage = siteContent['hero_image_main'] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85';
  const floatingImage = siteContent['hero_image_floating'] || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80';

  return (
    <section 
      id="hero" 
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '120px 24px 48px',
        background: 'radial-gradient(circle at 80% 20%, rgba(247, 37, 133, 0.18) 0%, rgba(255, 90, 54, 0.1) 40%, rgba(23, 23, 23, 1) 80%)',
        overflow: 'hidden'
      }}
    >
      {/* Editorial Ambient Gradient Glows (No Blue!) */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,37,133,0.22) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,255,85,0.12) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '40px',
        alignItems: 'center',
        flex: 1
      }}
      className="hero-grid-layout"
      >
        {/* Left Column: Expressive Giant Typography */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Micro-badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '8px 16px',
            width: 'fit-content'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--yellow)',
              borderRadius: '50%',
              display: 'inline-block'
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              letterSpacing: '0.14em',
              fontWeight: 700,
              color: 'var(--warm-white)',
              textTransform: 'uppercase'
            }}>
              {badge}
            </span>
          </div>

          {/* Giant Expressive Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 6.2vw, 5.8rem)',
            fontWeight: 900,
            lineHeight: 0.94,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: 'var(--warm-white)',
            margin: 0
          }}>
            {titleLine1}{' '}
            <span style={{
              display: 'block',
              background: 'linear-gradient(90deg, #F72585 0%, #FF5A36 60%, #E8FF55 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 40px rgba(247, 37, 133, 0.3)'
            }}>
              {titleLine2}
            </span>
          </h1>

          {/* Complementary & Secondary Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '580px' }}>
            <p style={{
              fontSize: 'clamp(1.1rem, 1.4vw, 1.35rem)',
              fontWeight: 400,
              lineHeight: 1.5,
              color: 'rgba(255, 253, 248, 0.9)',
              margin: 0
            }}>
              {quote}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--yellow)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.92rem',
              fontWeight: 600,
              letterSpacing: '0.04em'
            }}>
              <MapPin size={18} style={{ color: 'var(--orange)', flexShrink: 0 }} />
              <span>{subquote}</span>
            </div>
          </div>

          {/* Hero CTAs */}
          <div
            className="hero-cta-group"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              marginTop: '12px'
            }}
          >
            <button
              onClick={onOpenQuote}
              className="hero-btn-primary"
              style={{
                background: 'var(--magenta)',
                color: 'var(--warm-white)',
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                padding: '18px 32px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                textTransform: 'uppercase',
                boxShadow: '0 8px 32px var(--magenta-glow)'
              }}
            >
              <span>COTIZAR MI PROYECTO</span>
              <Sparkles size={18} />
            </button>

            <a
              href={CONTACT_CONFIG.getWhatsAppUrl(CONTACT_CONFIG.messages.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn-whatsapp"
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                padding: '18px 28px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)'
              }}
            >
              <MessageCircle size={20} strokeWidth={2.4} />
              <span>WHATSAPP DIRECTO</span>
            </a>

            <a
              href="#servicios"
              className="hero-btn-secondary"
              style={{
                background: 'transparent',
                color: 'var(--warm-white)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '18px 26px',
                border: '2px solid rgba(255, 253, 248, 0.3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase'
              }}
            >
              <span>VER SERVICIOS</span>
              <ArrowDownRight size={18} />
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '560px'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--yellow)' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presencia Norte</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--orange)' }}>STAFF</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Promotoras & BTL</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--soft-pink)' }}>360°</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Producción Integral</div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Editorial Asymmetric Photographic Composition */}
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '520px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Main Hero Photographic Canvas */}
          <div 
            className="hero-image-main-wrap"
            style={{
              position: 'relative',
              width: '88%',
              height: '480px',
              overflow: 'hidden',
              boxShadow: '-20px 20px 60px rgba(0, 0, 0, 0.8)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              background: '#202020'
            }}
          >
            <img 
              src={mainImage}
              alt="Gran activación comercial y evento experiencial SANCTUM"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.08) brightness(0.95)',
                transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="hero-img-zoom"
            />
            {/* Editorial overlay badge */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              background: 'rgba(23, 23, 23, 0.88)',
              backdropFilter: 'blur(8px)',
              padding: '12px 18px',
              borderLeft: '4px solid var(--magenta)',
              maxWidth: '300px'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--yellow)',
                letterSpacing: '0.12em',
                display: 'block',
                textTransform: 'uppercase'
              }}>
                ALTO IMPACTO SENSORIAL
              </span>
              <strong style={{
                fontSize: '0.9rem',
                color: 'var(--warm-white)',
                fontWeight: 700
              }}>
                Activaciones BTL & Producción Escénica
              </strong>
            </div>
          </div>

          {/* Overlapping Floating Secondary Image (Promoters / Staff Adult Photo) */}
          <div 
            className="hero-floating-card"
            style={{
              position: 'absolute',
              top: '8%',
              left: '-8%',
              width: '240px',
              height: '280px',
              overflow: 'hidden',
              border: '2px solid var(--yellow)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              zIndex: 3,
              background: 'var(--carbon)'
            }}
          >
            <img 
              src={floatingImage}
              alt="Promotora y anfitriona profesional para eventos"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.05)'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'var(--orange)',
              color: 'var(--warm-white)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '4px 8px',
              textTransform: 'uppercase'
            }}>
              STAFF PROFESIONAL
            </div>
          </div>

          {/* Overlapping Floating Badge: North Chile */}
          <div 
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '-10px',
              background: 'var(--magenta)',
              color: 'var(--warm-white)',
              padding: '16px 20px',
              boxShadow: '0 12px 30px var(--magenta-glow)',
              zIndex: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxWidth: '220px'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.9 }}>
              COBERTURA TOTAL
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.1 }}>
              ARICA HASTA LA SERENA
            </span>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .hero-floating-card {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .hero-image-main-wrap {
            height: 240px !important;
          }
          .hero-cta-group {
            flex-direction: column !important;
          }
          .hero-cta-group > * {
            width: 100% !important;
            justify-content: center !important;
            padding: 15px 20px !important;
            font-size: 0.9rem !important;
            text-align: center !important;
          }
        }
        .hero-btn-primary:hover {
          background: var(--yellow) !important;
          color: var(--carbon) !important;
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 36px var(--yellow-glow) !important;
        }
        .hero-btn-secondary:hover {
          border-color: var(--warm-white) !important;
          background: rgba(255, 253, 248, 0.1) !important;
          transform: translateY(-2px);
        }
        .hero-image-main-wrap:hover .hero-img-zoom {
          transform: scale(1.04);
        }
      `}</style>
    </section>
  );
};
