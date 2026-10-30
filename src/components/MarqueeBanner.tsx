import React from 'react';

interface MarqueeBannerProps {
  inverted?: boolean;
  siteContent?: Record<string, string>;
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({ inverted = false, siteContent = {} }) => {
  const customWordsStr = siteContent['marquee_words'];
  const words = customWordsStr
    ? customWordsStr.split(',').map(w => w.trim()).filter(Boolean)
    : [
        'CREATIVIDAD',
        'EXPERIENCIAS',
        'CAMPAÑAS',
        'PERSONAS',
        'EVENTOS',
        'IMPACTO',
        'BTL & ACTIVACIONES',
        'PROMOTORAS',
        'NORTE DE CHILE'
      ];

  return (
    <div 
      style={{
        width: '100%',
        overflow: 'hidden',
        background: inverted ? 'var(--magenta)' : 'var(--yellow)',
        color: 'var(--carbon)',
        padding: '22px 0',
        borderTop: '2px solid var(--carbon)',
        borderBottom: '2px solid var(--carbon)',
        position: 'relative',
        zIndex: 10,
        userSelect: 'none'
      }}
    >
      <div 
        className="animate-marquee" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          whiteSpace: 'nowrap'
        }}
      >
        {/* Render twice for continuous seamless infinite loop */}
        {[...words, ...words].map((word, idx) => (
          <div 
            key={idx} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '28px'
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.8rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              lineHeight: 1
            }}>
              {word}
            </span>
            <span style={{
              fontSize: '1.4rem',
              color: inverted ? 'var(--yellow)' : 'var(--magenta)',
              display: 'inline-block'
            }}>
              ✳
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
