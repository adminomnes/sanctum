// SANCTUM Content & High-Impact Assets
// Curated high-resolution Unsplash editorial photos representing adult promotional staff, massive brand activations, corporate galas, and authentic celebrations.

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  servicesList: string[];
  ctaText: string;
  theme: 'dark' | 'soft-pink' | 'warm-white' | 'seasonal-coral' | 'carbon-glow';
  accentColor: string;
  image: string;
  imageAlt: string;
  stats?: { number: string; label: string };
  badge?: string;
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'marketing',
    title: 'MARKETING Y PUBLICIDAD',
    tagline: 'IDEAS QUE SE VEN. EXPERIENCIAS QUE SE VIVEN.',
    description: 'Diseñamos campañas que conectan marcas con personas y transforman la atención en experiencias memorables.',
    servicesList: [
      'Campañas publicitarias',
      'Activaciones de marca',
      'Promociones comerciales',
      'Lanzamientos de productos',
      'Publicidad en puntos de venta',
      'Campañas BTL',
      'Experiencias de marca'
    ],
    ctaText: 'ACTIVAR MI MARCA',
    theme: 'dark',
    accentColor: 'var(--magenta)',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Activación de marca masiva e interactiva con luces y público',
    badge: 'ESTRATEGIA & IMPACTO'
  },
  {
    id: 'promotoras',
    title: 'PROMOTORAS Y PROMOTORES',
    tagline: 'EL EQUIPO CORRECTO CAMBIA TODO.',
    description: 'Personas que representan tu marca, conectan con tus clientes y hacen que cada interacción cuente.',
    servicesList: [
      'Promotoras y promotores',
      'Anfitriones y anfitrionas',
      'Personal para ferias',
      'Apoyo en puntos de venta',
      'Lanzamientos comerciales',
      'Equipos promocionales',
      'Apoyo operativo para eventos'
    ],
    ctaText: 'NECESITO UN EQUIPO',
    theme: 'soft-pink',
    accentColor: 'var(--orange)',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Personal y anfitriones profesionales en activación comercial',
    badge: 'STAFF PROFESIONAL'
  },
  {
    id: 'navidad',
    title: 'CAMPAÑAS DE NAVIDAD',
    tagline: 'LA TEMPORADA MÁS IMPORTANTE MERECE UNA GRAN CAMPAÑA.',
    description: 'Activamos tu marca durante Navidad y fin de año con equipos promocionales, experiencias temáticas y apoyo para tus acciones comerciales.',
    servicesList: [
      'Promotoras para Navidad',
      'Campañas en puntos de venta',
      'Activaciones comerciales',
      'Apoyo para actividades empresariales',
      'Personal para eventos de fin de año',
      'Coordinación de campañas especiales'
    ],
    ctaText: 'PREPARAR MI CAMPAÑA',
    theme: 'seasonal-coral',
    accentColor: '#FF6F59',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Campañas comerciales elegantes de temporada festiva y celebración corporativa',
    badge: 'EDICIÓN ESPECIAL FIN DE AÑO'
  },
  {
    id: 'corporativos',
    title: 'EVENTOS CORPORATIVOS',
    tagline: 'TU EVENTO. TU MARCA. TU MOMENTO.',
    description: 'Coordinamos experiencias corporativas pensadas para conectar personas, comunicar ideas y generar impacto.',
    servicesList: [
      'Eventos empresariales',
      'Inauguraciones',
      'Lanzamientos',
      'Ferias y exposiciones',
      'Actividades corporativas',
      'Celebraciones empresariales',
      'Coordinación de personal y apoyo operativo'
    ],
    ctaText: 'COTIZAR EVENTO',
    theme: 'dark',
    accentColor: 'var(--yellow)',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Escenario de convención corporativa con iluminación de alta tecnología',
    badge: 'PRODUCCIÓN B2B'
  },
  {
    id: 'privados',
    title: 'EVENTOS PRIVADOS',
    tagline: 'LAS GRANDES HISTORIAS TAMBIÉN SE CELEBRAN.',
    description: 'Celebraciones creadas alrededor de tus ideas, tu estilo y esos momentos que merecen ser especiales.',
    servicesList: [
      'Cumpleaños',
      'Aniversarios',
      'Fiestas privadas',
      'Celebraciones familiares',
      'Eventos sociales',
      'Celebraciones especiales'
    ],
    ctaText: 'CREAR MI EVENTO',
    theme: 'warm-white',
    accentColor: 'var(--magenta)',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Fiesta privada elegante con iluminación cálida y ambiente vibrante',
    badge: 'CELEBRACIONES DE AUTOR'
  }
];

export interface GalleryProject {
  id: string;
  title: string;
  category: 'Activaciones de marca' | 'Campañas promocionales' | 'Promotoras' | 'Eventos corporativos' | 'Navidad' | 'Eventos privados';
  location: string;
  image: string;
  aspect: 'tall' | 'wide' | 'square';
  tag: string;
}

export const GALLERY_PROJECTS: GalleryProject[] = [
  {
    id: 'p1',
    title: 'Lanzamiento Vehicular & Show de Luces',
    category: 'Activaciones de marca',
    location: 'Antofagasta',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    aspect: 'tall',
    tag: 'BTL & Experiencia'
  },
  {
    id: 'p2',
    title: 'Staff de Anfitriones y Promotoras Expo Minería',
    category: 'Promotoras',
    location: 'Calama',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
    aspect: 'square',
    tag: 'Staff de Marca'
  },
  {
    id: 'p3',
    title: 'Gala Corporativa de Fin de Año',
    category: 'Eventos corporativos',
    location: 'Iquique',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    aspect: 'wide',
    tag: 'Producción Integral'
  },
  {
    id: 'p4',
    title: 'Activación Navideña en Mall & Puntos de Venta',
    category: 'Navidad',
    location: 'La Serena',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
    aspect: 'square',
    tag: 'Campaña Estacional'
  },
  {
    id: 'p5',
    title: 'Celebración Aniversario Privada',
    category: 'Eventos privados',
    location: 'Arica',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1000&q=80',
    aspect: 'tall',
    tag: 'Diseño de Ambiente'
  },
  {
    id: 'p6',
    title: 'Sampling y Degustación Masiva en Playa',
    category: 'Campañas promocionales',
    location: 'Mejillones',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    aspect: 'wide',
    tag: 'Trade Marketing'
  },
  {
    id: 'p7',
    title: 'Feria Gastronómica & Promotores de Campo',
    category: 'Promotoras',
    location: 'Copiapó',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80',
    aspect: 'square',
    tag: 'Conexión Directa'
  },
  {
    id: 'p8',
    title: 'Convención Anual & Reconocimientos',
    category: 'Eventos corporativos',
    location: 'Coquimbo',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80',
    aspect: 'wide',
    tag: 'Escenarios & Sonido'
  }
];

export interface CityCoverage {
  name: string;
  region: string;
  highlight: string;
  x: number; // percentage in stylized North Chile map
  y: number;
}

export const CITIES_COVERAGE: CityCoverage[] = [
  { name: 'Arica', region: 'XV Región', highlight: 'Punto extremo norte & eventos costeros', x: 48, y: 8 },
  { name: 'Iquique', region: 'I Región', highlight: 'Plataforma comercial & lanzamientos BTL', x: 44, y: 22 },
  { name: 'Alto Hospicio', region: 'I Región', highlight: 'Campañas masivas y activaciones trade', x: 50, y: 26 },
  { name: 'Tocopilla', region: 'II Región', highlight: 'Eventos comunitarios y corporativos', x: 42, y: 40 },
  { name: 'Calama', region: 'II Región', highlight: 'Staff industrial, minero y empresarial', x: 58, y: 45 },
  { name: 'Mejillones', region: 'II Región', highlight: 'Producción de eventos logísticos e industriales', x: 40, y: 53 },
  { name: 'Antofagasta', region: 'II Región', highlight: 'Hub principal: grandes eventos y marketing', x: 46, y: 58 },
  { name: 'Copiapó', region: 'III Región', highlight: 'Lanzamientos y activaciones en retail', x: 52, y: 72 },
  { name: 'Vallenar', region: 'III Región', highlight: 'Eventos privados y promociones locales', x: 50, y: 80 },
  { name: 'La Serena', region: 'IV Región', highlight: 'Turismo, festivales y activaciones de verano', x: 45, y: 90 },
  { name: 'Coquimbo', region: 'IV Región', highlight: 'Ferias, congresos y celebraciones', x: 43, y: 95 }
];
