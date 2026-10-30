import React from 'react';
import { ArrowUpRight, Sparkles, MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '../config';

interface ConversionProps {
  onOpenQuote: () => void;
  siteContent?: Record<string, string>;
}

export const Conversion: React.FC<ConversionProps> = ({ onOpenQuote, siteContent = {} }) => {
  const title = siteContent['conversion_title'] || '¿QUÉ ESTÁS IMAGINANDO?';
  const text = siteContent['conversion_text'] || 'Cuéntanos qué necesitas. Nosotros te ayudamos a convertirlo en una campaña, una experiencia o un evento.';
  const cta = siteContent['conversion_cta'] || 'HABLEMOS DE TU PROYECTO';

  return (
    <section 
      className="conversion-section"
      style={{
        position: 'relative',
        background: 'var(--magenta)',
        color: 'var(--carbon)',
        padding: '120px 24px',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Graphic Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'var(--orange)',
        opacity: 0.35,
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'var(--yellow)',
        opacity: 0.3,
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px'
      }}>
        {/* Micro-label */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--carbon)',
          color: 'var(--yellow)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: '0.82rem',
          letterSpacing: '0.14em',
          padding: '8px 18px',
          textTransform: 'uppercase'
        }}>
          <Sparkles size={16} />
          <span>INICIA TU CAMPAÑA HOY</span>
        </div>

        {/* Giant Expressive Question */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 7.8vw, 6.8rem)',
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          color: 'var(--carbon)',
          margin: 0
        }}>
          {title}
        </h2>

        {/* Complementary Text */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(1.2rem, 1.8vw, 1.55rem)',
          fontWeight: 600,
          lineHeight: 1.45,
          color: 'rgba(23, 23, 23, 0.92)',
          maxWidth: '720px',
          margin: 0
        }}>
          "{text}"
        </p>

        {/* Main Conversion Buttons (Formulario + WhatsApp) */}
        <div className="conversion-btn-group" style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={onOpenQuote}
            className="btn-conversion-giant"
            style={{
              background: 'var(--carbon)',
              color: 'var(--warm-white)',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              fontWeight: 900,
              letterSpacing: '0.04em',
              padding: '24px 44px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              textTransform: 'uppercase',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span>{cta}</span>
            <ArrowUpRight size={26} strokeWidth={2.8} />
          </button>

          <a
            href={CONTACT_CONFIG.getWhatsAppUrl(CONTACT_CONFIG.messages.quotes)}
            target="_blank"
            rel="noopener noreferrer"
            title="Iniciar conversación directa en WhatsApp"
            style={{
              background: '#25D366',
              color: '#FFFFFF',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              fontWeight: 900,
              letterSpacing: '0.04em',
              padding: '24px 40px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.3s ease'
            }}
          >
            <MessageCircle size={26} strokeWidth={2.6} />
            <span>CHATEAR POR WHATSAPP</span>
          </a>
        </div>

        {/* Reassurance Subtext */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px',
          color: 'var(--carbon)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          fontWeight: 700,
          opacity: 0.85,
          marginTop: '8px'
        }}>
          <span>✓ Cotizaciones detalladas</span>
          <span>✓ Cobertura en toda la zona norte</span>
          <span>✓ Respuesta ejecutiva ágil</span>
        </div>
      </div>

      <style>{`
        .btn-conversion-giant:hover {
          background: var(--yellow) !important;
          color: var(--carbon) !important;
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5) !important;
        }
      `}</style>
    </section>
  );
};
