// WhatsApp and Contact Settings
// Número oficial de WhatsApp de SANCTUM: +56 9 8565 8683
// Enlace internacional directo: https://wa.me/56985658683

export const CONTACT_CONFIG = {
  // Número internacional sin símbolos para wa.me
  whatsappNumber: '56985658683',
  whatsappDisplay: '+56 9 8565 8683',
  
  // Mensajes predefinidos codificados contextualmente
  messages: {
    general: 'Hola, quisiera obtener información sobre los servicios de SANCTUM.',
    quotes: 'Hola, quisiera solicitar una cotización para un servicio de SANCTUM.',
    events: 'Hola, quisiera cotizar la producción de un evento con SANCTUM.',
    staff: 'Hola, quisiera cotizar personal y promotoras para mi marca con SANCTUM.',
    campaigns: 'Hola, quisiera cotizar una campaña publicitaria con SANCTUM.',
    navidad: 'Hola, quisiera preparar una campaña navideña o de fin de año con SANCTUM.'
  },

  // Helper para generar el enlace directo con texto predefinido
  getWhatsAppUrl: (message?: string) => {
    const text = message || CONTACT_CONFIG.messages.general;
    return `https://wa.me/56985658683?text=${encodeURIComponent(text)}`;
  },
  
  // Correo de contacto
  contactEmail: 'contacto@sanctum.cl',
  
  // Región de cobertura
  regionName: 'Zona Norte de Chile',
  
  // Slogan & Identidad
  baseline: 'LAS IDEAS NO SE QUEDAN EN IDEAS.',
  brandTagline: 'Convertimos ideas en campañas, marcas en experiencias y eventos en momentos que nadie olvida.'
};
