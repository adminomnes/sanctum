import React, { useState } from 'react';
import { GALLERY_PROJECTS, type GalleryProject } from '../data/content';
import { Sparkles, X, MapPin, Tag, ZoomIn, MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '../config';

const CATEGORIES = [
  'Todos',
  'Activaciones de marca',
  'Campañas promocionales',
  'Promotoras',
  'Eventos corporativos',
  'Navidad',
  'Eventos privados'
] as const;

export const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [lightboxProject, setLightboxProject] = useState<GalleryProject | null>(null);

  const filteredProjects = activeCategory === 'Todos'
    ? GALLERY_PROJECTS
    : GALLERY_PROJECTS.filter(p => p.category === activeCategory);

  return (
    <section
      id="galeria"
      style={{
        padding: '120px 24px',
        background: '#141414',
        position: 'relative'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '56px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--yellow)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={16} />
            <span>PORTAFOLIO FOTOGRÁFICO DE REFERENCIA</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: 'var(--warm-white)',
            margin: 0
          }}>
            NO TE LO CONTAMOS.{' '}
            <span style={{ color: 'var(--magenta)' }}>
              TE LO MOSTRAMOS.
            </span>
          </h2>

          <p style={{
            color: 'rgba(255, 253, 248, 0.7)',
            fontSize: '1.05rem',
            maxWidth: '680px',
            lineHeight: 1.5,
            margin: 0
          }}>
            Galería visual inspirada en agencias globales de marketing de experiencias y producciones BTL. Imágenes de alta dirección de arte para conceptualizar la escala y calidad de cada ejecución en el norte de Chile.
          </p>
        </div>

        {/* Filter Buttons Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '48px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: isActive ? 'var(--yellow)' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? 'var(--carbon)' : 'var(--warm-white)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '10px 18px',
                  border: isActive ? '1px solid var(--yellow)' : '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  textTransform: 'uppercase'
                }}
                className="filter-btn-tab"
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Asymmetric Editorial Portfolio Grid */}
        <div
          className="editorial-gallery-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))',
            gap: '28px',
            alignItems: 'start'
          }}
        >
          {filteredProjects.map((project) => {
            const height = project.aspect === 'tall' ? '480px' : (project.aspect === 'wide' ? '320px' : '380px');
            return (
              <div
                key={project.id}
                onClick={() => setLightboxProject(project)}
                className="gallery-card-item"
                style={{
                  position: 'relative',
                  height: height,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: '#1F1F1F'
                }}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    filter: 'contrast(1.05) brightness(0.92)'
                  }}
                  className="gallery-img"
                />

                {/* Always-visible quick badge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(23, 23, 23, 0.85)',
                  backdropFilter: 'blur(6px)',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--yellow)',
                  fontWeight: 700
                }}>
                  <Tag size={12} />
                  <span>{project.tag}</span>
                </div>

                {/* Hover Reveal Overlay */}
                <div
                  className="gallery-hover-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(23, 23, 23, 0.95) 0%, rgba(23, 23, 23, 0.4) 60%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '24px',
                    transition: 'opacity 0.3s ease',
                    opacity: 0
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--orange)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginBottom: '6px'
                  }}>
                    <MapPin size={14} />
                    <span>{project.location}</span>
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--warm-white)',
                    lineHeight: 1.2,
                    margin: '0 0 12px'
                  }}>
                    {project.title}
                  </h3>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--yellow)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700
                  }}>
                    <ZoomIn size={14} />
                    <span>AMPLIAR FOTOGRAFÍA</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Editorial Subnote */}
        <div style={{
          marginTop: '36px',
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderLeft: '3px solid var(--magenta)',
          color: 'rgba(255, 253, 248, 0.65)',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-mono)'
        }}>
          * Fotografías curatoriales con fines ilustrativos y de dirección de arte. SANCTUM renueva periódicamente su material con producciones y despliegues en vivo en el norte del país.
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxProject && (
        <div
          onClick={() => setLightboxProject(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(12px)',
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
              position: 'relative',
              maxWidth: '900px',
              width: '100%',
              background: 'var(--carbon)',
              border: '2px solid var(--magenta)',
              boxShadow: '0 25px 60px rgba(247, 37, 133, 0.35)',
              overflow: 'hidden',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxProject(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--magenta)',
                color: 'var(--warm-white)',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Cerrar vista ampliada"
            >
              <X size={20} />
            </button>

            <img
              src={lightboxProject.image}
              alt={lightboxProject.title}
              style={{
                width: '100%',
                maxHeight: '65vh',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            <div style={{ padding: '20px', background: 'var(--carbon)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>{lightboxProject.category}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                  <span style={{ color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} />
                    {lightboxProject.location}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--warm-white)',
                  margin: 0
                }}>
                  {lightboxProject.title}
                </h3>
              </div>

              <a
                href={CONTACT_CONFIG.getWhatsAppUrl(`Hola SANCTUM, vi el proyecto "${lightboxProject.title}" en ${lightboxProject.location} y me gustaría cotizar una producción similar.`)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  padding: '12px 20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)'
                }}
              >
                <MessageCircle size={18} strokeWidth={2.4} />
                <span>COTIZAR ESTA PRODUCCIÓN</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-btn-tab:hover {
          background: rgba(232, 255, 85, 0.15) !important;
          color: var(--yellow) !important;
        }
        .gallery-card-item:hover .gallery-img {
          transform: scale(1.06);
        }
        .gallery-card-item:hover .gallery-hover-overlay {
          opacity: 1 !important;
        }
        /* On touch devices: always show overlay (no hover) */
        @media (hover: none) {
          .gallery-hover-overlay {
            opacity: 0.85 !important;
          }
        }
        @media (max-width: 600px) {
          .editorial-gallery-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .gallery-card-item {
            height: 200px !important;
          }
          #galeria {
            padding: 60px 12px !important;
          }
        }
        @media (max-width: 400px) {
          .editorial-gallery-grid {
            grid-template-columns: 1fr !important;
          }
          .gallery-card-item {
            height: 240px !important;
          }
        }
      `}</style>
    </section>
  );
};
