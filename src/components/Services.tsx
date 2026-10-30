import React, { useState, useEffect } from 'react';
import { SERVICES_DATA } from '../data/content';
import { ArrowUpRight, CheckCircle2, Sparkles, MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '../config';
import { apiFetch } from '../api';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
  siteContent?: Record<string, string>;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService, siteContent = {} }) => {
  const [servicesList, setServicesList] = useState<any[]>(SERVICES_DATA);

  useEffect(() => {
    // Fetch live services from backend database
    apiFetch('/api/public/services')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setServicesList(data);
        }
      })
      .catch(() => {
        // Safe fallback to preset SERVICES_DATA
      });
  }, []);

  const tagline = siteContent['services_tagline'] || 'PORTAFOLIO DE CAPACIDADES Y PRODUCCIÓN';
  const title1 = siteContent['services_title_1'] || 'IDEAS QUE SE VEN.';
  const title2 = siteContent['services_title_2'] || 'EXPERIENCIAS QUE SE VIVEN.';
  const description = siteContent['services_description'] || 'Cero plantillas repetitivas. Cada área de producción cuenta con personalidad cromática, dirección de arte especializada y equipos humanos dedicados en todo el norte chileno.';

  return (
    <section 
      id="servicios" 
      style={{
        padding: '120px 24px',
        background: 'var(--carbon)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Section Header */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--magenta)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase'
        }}>
          <Sparkles size={18} />
          <span>{tagline}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '40px',
          alignItems: 'flex-end'
        }}
        className="services-header-grid"
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5.2vw, 4.6rem)',
            fontWeight: 900,
            lineHeight: 0.98,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: 'var(--warm-white)',
            margin: 0
          }}>
            {title1}{' '}
            <span style={{
              display: 'block',
              color: 'var(--yellow)',
              textShadow: '0 4px 30px rgba(232,255,85,0.25)'
            }}>
              {title2}
            </span>
          </h2>

          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.6,
            color: 'rgba(255, 253, 248, 0.75)',
            margin: 0
          }}>
            {description}
          </p>
        </div>
      </div>

      {/* Services Editorial Layout: Distinct Sizes & Themes */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '64px'
      }}>
        {servicesList.map((item, index) => {
          // Dynamic theme configuration based on service persona
          let bg = '#1E1E1E';
          let textColor = 'var(--warm-white)';
          let borderColor = 'rgba(255, 255, 255, 0.12)';
          let isReversed = index % 2 === 1;

          if (item.theme === 'soft-pink') {
            bg = 'var(--soft-pink)';
            textColor = 'var(--carbon)';
            borderColor = 'rgba(23, 23, 23, 0.15)';
          } else if (item.theme === 'seasonal-coral') {
            bg = 'linear-gradient(135deg, #2D1418 0%, #1A0D10 100%)';
            textColor = 'var(--warm-white)';
            borderColor = '#FF5A36';
          } else if (item.theme === 'warm-white') {
            bg = 'var(--warm-white)';
            textColor = 'var(--carbon)';
            borderColor = 'rgba(23, 23, 23, 0.12)';
          }

          return (
            <div 
              key={item.id}
              id={`service-${item.id}`}
              className="service-block-item"
              style={{
                background: bg,
                color: textColor,
                border: `1px solid ${borderColor}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease'
              }}
            >
              <div 
                className={`service-grid-content ${isReversed ? 'grid-reversed' : ''}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isReversed ? '1.1fr 1fr' : '1fr 1.1fr',
                  gap: '0',
                  minHeight: '480px'
                }}
              >
                {/* Content Side */}
                <div style={{
                  padding: '48px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '32px',
                  order: isReversed ? 2 : 1
                }}
                className="service-text-container"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        padding: '6px 12px',
                        background: item.theme === 'soft-pink' || item.theme === 'warm-white' ? 'var(--carbon)' : item.accentColor,
                        color: item.theme === 'soft-pink' || item.theme === 'warm-white' ? 'var(--warm-white)' : 'var(--carbon)',
                        textTransform: 'uppercase'
                      }}>
                        {item.badge || 'PRODUCCIÓN SANCTUM'}
                      </span>
                    </div>

                    {/* Headline & Tagline */}
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.9rem, 3.4vw, 3rem)',
                        fontWeight: 900,
                        lineHeight: 1.05,
                        letterSpacing: '-0.03em',
                        textTransform: 'uppercase',
                        margin: '0 0 10px',
                        color: textColor
                      }}>
                        {item.tagline}
                      </h3>
                      <h4 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        color: item.accentColor === 'var(--yellow)' ? '#E8FF55' : (item.accentColor === 'var(--magenta)' ? '#F72585' : item.accentColor),
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        margin: 0
                      }}>
                        {item.title}
                      </h4>
                    </div>

                    <p style={{
                      fontSize: '1.05rem',
                      lineHeight: 1.55,
                      opacity: 0.9,
                      maxWidth: '520px',
                      margin: '8px 0 0'
                    }}>
                      {item.description}
                    </p>

                    {/* Bullet Points Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px 16px',
                      marginTop: '16px',
                      paddingTop: '20px',
                      borderTop: `1px solid ${item.theme === 'soft-pink' || item.theme === 'warm-white' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`
                    }}>
                      {(item.servicesList || []).map((svc: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 600 }}>
                          <CheckCircle2 size={16} style={{ color: item.accentColor, flexShrink: 0 }} />
                          <span>{svc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Service CTA Buttons (Cotizar + WhatsApp Directo) */}
                  <div className="service-cta-flex" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <button
                      onClick={() => onSelectService(item.title)}
                      className="service-cta-btn"
                      style={{
                        background: item.theme === 'soft-pink' || item.theme === 'warm-white' ? 'var(--carbon)' : item.accentColor,
                        color: item.theme === 'soft-pink' || item.theme === 'warm-white' ? 'var(--warm-white)' : 'var(--carbon)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.92rem',
                        fontWeight: 900,
                        letterSpacing: '0.06em',
                        padding: '16px 28px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      <span>{item.ctaText}</span>
                      <ArrowUpRight size={18} strokeWidth={2.6} />
                    </button>

                    <a
                      href={CONTACT_CONFIG.getWhatsAppUrl(`Hola SANCTUM, me gustaría cotizar el servicio de ${item.title}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Hablar por WhatsApp sobre ${item.title}`}
                      style={{
                        background: '#25D366',
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.92rem',
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                        padding: '16px 22px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        boxShadow: '0 4px 18px rgba(37, 211, 102, 0.35)',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <MessageCircle size={18} strokeWidth={2.4} />
                      <span>WHATSAPP</span>
                    </a>
                  </div>
                </div>

                {/* Imagery Side: Full Bleed Photo with Editorial Overlay */}
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '380px',
                  order: isReversed ? 1 : 2
                }}
                className="service-img-container"
                >
                  <img 
                    src={item.image} 
                    alt={item.imageAlt || item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className="service-zoom-img"
                  />
                  {/* Visual gradient ramp */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: item.theme === 'dark' 
                      ? 'linear-gradient(to right, rgba(30,30,30,0.6) 0%, transparent 60%)' 
                      : (item.theme === 'seasonal-coral' ? 'linear-gradient(to right, rgba(45,20,24,0.7) 0%, transparent 60%)' : 'none'),
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .services-header-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .service-grid-content {
            grid-template-columns: 1fr !important;
          }
          .service-img-container {
            order: -1 !important;
            height: 300px !important;
          }
          .service-text-container {
            padding: 32px 24px !important;
          }
        }
        .service-block-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
        }
        .service-block-item:hover .service-zoom-img {
          transform: scale(1.05);
        }
        .service-cta-btn:hover {
          transform: scale(1.04);
          filter: brightness(1.1);
        }
      `}</style>
    </section>
  );
};
