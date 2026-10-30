import React from 'react';
import { CONTACT_CONFIG } from '../config';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatProps {
  onOpenQuote?: () => void;
  siteContent?: Record<string, string>;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = () => {
  const whatsappUrl = CONTACT_CONFIG.getWhatsAppUrl(CONTACT_CONFIG.messages.general);

  return (
    <div style={{
      position: 'fixed',
      bottom: '28px',
      right: '28px',
      zIndex: 900,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '12px'
    }}>
      {/* Main Floating WhatsApp Bubble */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-trigger"
        aria-label="Contactar a SANCTUM vía WhatsApp (+56 9 8565 8683)"
        title="Chatear por WhatsApp con SANCTUM (+56 9 8565 8683)"
        style={{
          width: '60px',
          height: '60px',
          background: '#25D366', // Modern official WhatsApp green
          color: '#FFFFFF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(37, 211, 102, 0.45)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          textDecoration: 'none'
        }}
      >
        <MessageCircle size={30} strokeWidth={2.4} />

        {/* Pulse beacon */}
        <span style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: 'var(--yellow)',
          border: '2px solid var(--carbon)'
        }} />
      </a>

      <style>{`
        .whatsapp-float-trigger:hover {
          transform: scale(1.1) translateY(-3px);
          box-shadow: 0 14px 35px rgba(37, 211, 102, 0.6) !important;
        }
      `}</style>
    </div>
  );
};
