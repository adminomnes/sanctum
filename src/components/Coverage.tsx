import React, { useState } from 'react';
import { CITIES_COVERAGE, type CityCoverage } from '../data/content';
import { MapPin, Compass, Check, ArrowRight, MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '../config';

interface CoverageProps {
  onSelectCity: (cityName: string) => void;
}

export const Coverage: React.FC<CoverageProps> = ({ onSelectCity }) => {
  const [selectedCity, setSelectedCity] = useState<CityCoverage>(CITIES_COVERAGE[6]); // Default to Antofagasta

  return (
    <section 
      id="cobertura" 
      style={{
        padding: '120px 24px',
        background: '#181818',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Decorative Warm Ambient Gradients (strictly avoiding blue) */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,90,54,0.12) 0%, transparent 70%)',
        filter: 'blur(90px)',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '64px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--orange)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase'
          }}>
            <Compass size={18} />
            <span>DESPLIEGUE OPERATIVO NORTE DE CHILE</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 4.4rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: 'var(--warm-white)',
            margin: 0
          }}>
            LLEVAMOS LAS IDEAS{' '}
            <span style={{
              background: 'linear-gradient(90deg, #FF5A36 0%, #E8FF55 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              MÁS LEJOS.
            </span>
          </h2>

          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.6,
            color: 'rgba(255, 253, 248, 0.8)',
            maxWidth: '680px',
            margin: 0
          }}>
            "Coordinamos campañas, equipos promocionales y eventos en distintas ciudades del norte de Chile, según las necesidades de cada proyecto".
          </p>
        </div>

        {/* Graphical Map Representation (Editorial high-contrast schematic layout) */}
        <div 
          className="coverage-schematic-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '48px',
            alignItems: 'center',
            background: 'var(--carbon)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '40px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Left: Interactive Cities List / Selector */}
          <div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--yellow)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px'
            }}>
              SELECCIONA UNA CIUDAD PARA VER DETALLES LOGÍSTICOS
            </span>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '12px',
              marginBottom: '32px'
            }}>
              {CITIES_COVERAGE.map((city) => {
                const isSelected = selectedCity.name === city.name;
                return (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city)}
                    style={{
                      background: isSelected ? 'var(--magenta)' : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? 'var(--warm-white)' : 'var(--warm-white)',
                      border: isSelected ? '1px solid var(--magenta)' : '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    className="city-button-badge"
                  >
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        fontWeight: 800,
                        letterSpacing: '-0.01em'
                      }}>
                        {city.name}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        opacity: 0.7,
                        textTransform: 'uppercase'
                      }}>
                        {city.region}
                      </div>
                    </div>
                    {isSelected && <Check size={16} color="var(--yellow)" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>

            {/* Selected City Detail Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderLeft: '4px solid var(--yellow)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--yellow)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                <MapPin size={16} />
                <span>CENTRO DE OPERACIONES & LOGÍSTICA</span>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'var(--warm-white)',
                margin: 0
              }}>
                {selectedCity.name} — {selectedCity.region}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255, 253, 248, 0.85)',
                margin: 0
              }}>
                {selectedCity.highlight}. Despliegue de equipos de promotoras, supervisores de campo, anfitrionaje y coordinación de montaje para marcas locales y nacionales.
              </p>
              
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '10px' }} className="coverage-cta-flex">
                <button
                  onClick={() => onSelectCity(selectedCity.name)}
                  style={{
                    background: 'var(--yellow)',
                    color: 'var(--carbon)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    padding: '12px 24px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textTransform: 'uppercase'
                  }}
                  className="btn-consultar-ciudad"
                >
                  <span>COTIZAR EN {selectedCity.name.toUpperCase()}</span>
                  <ArrowRight size={16} strokeWidth={2.8} />
                </button>

                <a
                  href={CONTACT_CONFIG.getWhatsAppUrl(`Hola SANCTUM, quisiera consultar disponibilidad y cobertura para un proyecto en ${selectedCity.name} (${selectedCity.region}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#25D366',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    padding: '12px 20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)'
                  }}
                >
                  <MessageCircle size={16} strokeWidth={2.4} />
                  <span>CONSULTAR POR WHATSAPP</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Graphic Non-Blue Schematic of North Chile Territory */}
          <div style={{
            position: 'relative',
            background: '#111',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '40px 24px',
            minHeight: '520px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            {/* Top Compass Heading */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px dashed rgba(255, 255, 255, 0.15)',
              paddingBottom: '12px'
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                LAT: 18°28' S - 29°54' S
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--magenta)', fontWeight: 800 }}>
                ZONA NORTE CHILE
              </span>
            </div>

            {/* Vertical Stylized Transit Spine connecting North Cities */}
            <div style={{
              position: 'relative',
              margin: '30px auto',
              width: '100%',
              maxWidth: '380px',
              height: '380px'
            }}>
              {/* Central Glowing Highway / Connection Route */}
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: '3px',
                background: 'linear-gradient(to bottom, #F72585 0%, #FF5A36 50%, #E8FF55 100%)',
                transform: 'translateX(-50%)',
                boxShadow: '0 0 12px var(--magenta-glow)'
              }} />

              {/* Schematic City Nodes along the Spine */}
              {CITIES_COVERAGE.map((city, idx) => {
                const isSelected = selectedCity.name === city.name;
                const topPct = (idx / (CITIES_COVERAGE.length - 1)) * 90 + 5;
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={city.name}
                    onClick={() => setSelectedCity(city)}
                    style={{
                      position: 'absolute',
                      top: `${topPct}%`,
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      zIndex: isSelected ? 5 : 2
                    }}
                  >
                    {/* Left label if odd */}
                    {!isEven && (
                      <span style={{
                        position: 'absolute',
                        right: '24px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: isSelected ? '0.9rem' : '0.75rem',
                        fontWeight: isSelected ? 800 : 500,
                        color: isSelected ? 'var(--yellow)' : 'rgba(255,255,255,0.7)',
                        whiteSpace: 'nowrap',
                        textAlign: 'right'
                      }}>
                        {city.name}
                      </span>
                    )}

                    {/* Node Dot */}
                    <div style={{
                      width: isSelected ? '18px' : '10px',
                      height: isSelected ? '18px' : '10px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--yellow)' : (isEven ? 'var(--magenta)' : 'var(--orange)'),
                      border: '2px solid var(--carbon)',
                      boxShadow: isSelected ? '0 0 16px var(--yellow)' : 'none',
                      transition: 'all 0.25s ease'
                    }} />

                    {/* Right label if even */}
                    {isEven && (
                      <span style={{
                        position: 'absolute',
                        left: '24px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: isSelected ? '0.9rem' : '0.75rem',
                        fontWeight: isSelected ? 800 : 500,
                        color: isSelected ? 'var(--yellow)' : 'rgba(255,255,255,0.7)',
                        whiteSpace: 'nowrap'
                      }}>
                        {city.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Disclaimer */}
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'rgba(255, 253, 248, 0.55)',
              textAlign: 'center'
            }}>
              * Zona de atención comercial sujeta a confirmación de disponibilidad técnica y logística por proyecto.
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .coverage-schematic-grid {
            grid-template-columns: 1fr !important;
            padding: 24px !important;
          }
        }
        @media (max-width: 480px) {
          .coverage-schematic-grid {
            padding: 16px !important;
            gap: 24px !important;
          }
          #cobertura {
            padding: 60px 12px !important;
          }
        }
        .city-button-badge:hover {
          background: rgba(255, 90, 54, 0.2) !important;
          border-color: var(--orange) !important;
        }
        .btn-consultar-ciudad:hover {
          background: var(--magenta) !important;
          color: var(--warm-white) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
};
