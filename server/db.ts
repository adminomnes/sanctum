import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB_PATH env var allows Render Disk or any host to set a persistent path
// Default: ./data/sanctum.db relative to project root
const dbPath = process.env.DB_PATH
  ? process.env.DB_PATH
  : path.join(__dirname, '..', 'data', 'sanctum.db');

// Ensure parent directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
console.log('[SANCTUM DB] Using database at: ' + dbPath);

// Enable foreign keys and WAL mode
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // 1. Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'editor', 'commercial'
      status TEXT NOT NULL DEFAULT 'active',
      recovery_token TEXT,
      recovery_expires DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Web Content & Settings (Key-Value and Section content)
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      section TEXT NOT NULL,
      label TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text', -- 'text', 'textarea', 'image', 'json'
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      services_list TEXT NOT NULL, -- JSON array of strings
      cta_text TEXT NOT NULL,
      theme TEXT NOT NULL DEFAULT 'dark',
      accent_color TEXT NOT NULL DEFAULT '#F72585',
      image TEXT NOT NULL,
      image_alt TEXT NOT NULL,
      badge TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      base_price REAL DEFAULT 0,
      unit TEXT DEFAULT 'servicio',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Rate Card / Pricing Items (Tarifario)
  db.exec(`
    CREATE TABLE IF NOT EXISTS rate_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT,
      category TEXT NOT NULL, -- 'BTL', 'Staff', 'Eventos', 'Producción', 'Logística'
      name TEXT NOT NULL,
      description TEXT,
      unit TEXT NOT NULL DEFAULT 'jornada', -- 'jornada', 'hora', 'persona', 'evento', 'm2'
      price REAL NOT NULL,
      iva_applicable INTEGER NOT NULL DEFAULT 1,
      active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Clients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      city TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Quotes / Cotizaciones
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      client_id INTEGER,
      client_name TEXT NOT NULL,
      company TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      city TEXT NOT NULL,
      service_type TEXT NOT NULL,
      event_date TEXT,
      budget_reference TEXT,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'en_revision', 'enviada', 'aprobada', 'rechazada'
      subtotal REAL DEFAULT 0,
      iva_rate REAL DEFAULT 0.19,
      iva_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    );
  `);

  // 7. Quote Items (Detalle de cotización para cálculo de presupuestos)
  db.exec(`
    CREATE TABLE IF NOT EXISTS quote_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0,
      total_price REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );
  `);

  // 8. Campaigns & Events (Campañas y Eventos planificados)
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL, -- 'campaña', 'evento_corporativo', 'evento_privado', 'activacion'
      client_name TEXT,
      city TEXT NOT NULL,
      venue TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      status TEXT NOT NULL DEFAULT 'planificacion', -- 'planificacion', 'confirmado', 'en_progreso', 'finalizado', 'cancelado'
      budget REAL DEFAULT 0,
      staff_assigned TEXT, -- JSON array of assigned people/roles
      requirements TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Gallery / Portfolio projects
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      image TEXT NOT NULL,
      aspect TEXT NOT NULL DEFAULT 'square',
      tag TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin user if none exists
  const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (!existingUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Sanctum2026!', salt);
    db.prepare(`
      INSERT INTO users (email, password_hash, name, role, status)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin@sanctum.cl', hash, 'Administrador SANCTUM', 'admin', 'active');
    console.log('[DB] Admin user created: admin@sanctum.cl / Sanctum2026!');
  }

  // Seed default content if none exists
  const existingContent = db.prepare('SELECT key FROM site_content LIMIT 1').get();
  if (!existingContent) {
    const insertContent = db.prepare(`
      INSERT INTO site_content (key, value, section, label, type)
      VALUES (?, ?, ?, ?, ?)
    `);

    const defaults = [
      ['hero_badge', 'MARKETING · BRAND ACTIVATIONS · EVENTS', 'hero', 'Badge Superior Hero', 'text'],
      ['hero_title_line1', 'NO HACEMOS RUIDO.', 'hero', 'Título Hero Línea 1', 'text'],
      ['hero_title_line2', 'CREAMOS IMPACTO.', 'hero', 'Título Hero Línea 2 (Gradiente)', 'text'],
      ['hero_quote', '"Convertimos ideas en campañas, marcas en experiencias y eventos en momentos que nadie olvida".', 'hero', 'Cita Hero', 'textarea'],
      ['hero_subquote', 'Publicidad, equipos promocionales y experiencias en toda la zona norte de Chile.', 'hero', 'Frase Secundaria Cobertura', 'text'],
      ['hero_image_main', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85', 'hero', 'Imagen Principal Hero', 'image'],
      ['hero_image_floating', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', 'hero', 'Imagen Flotante Hero (Staff)', 'image'],
      ['marquee_words', 'CREATIVIDAD,EXPERIENCIAS,CAMPAÑAS,PERSONAS,EVENTOS,IMPACTO,BTL & ACTIVACIONES,PROMOTORAS,NORTE DE CHILE', 'marquee', 'Palabras del Ticker (separadas por coma)', 'text'],
      ['services_tagline', 'PORTAFOLIO DE CAPACIDADES Y PRODUCCIÓN', 'services', 'Etiqueta Sección Servicios', 'text'],
      ['services_title_1', 'IDEAS QUE SE VEN.', 'services', 'Título Servicios Línea 1', 'text'],
      ['services_title_2', 'EXPERIENCIAS QUE SE VIVEN.', 'services', 'Título Servicios Línea 2', 'text'],
      ['services_description', 'Cero plantillas repetitivas. Cada área de producción cuenta con personalidad cromática, dirección de arte especializada y equipos humanos dedicados en todo el norte chileno.', 'services', 'Descripción Servicios', 'textarea'],
      ['conversion_title', '¿QUÉ ESTÁS IMAGINANDO?', 'conversion', 'Título Bloque Conversión', 'text'],
      ['conversion_text', 'Cuéntanos qué necesitas. Nosotros te ayudamos a convertirlo en una campaña, una experiencia o un evento.', 'conversion', 'Texto Bloque Conversión', 'textarea'],
      ['conversion_cta', 'HABLEMOS DE TU PROYECTO', 'conversion', 'Texto Botón Conversión', 'text'],
      ['contact_phone', '+56 9 8565 8683', 'contact', 'Teléfono / WhatsApp', 'text'],
      ['contact_email', 'contacto@sanctum.cl', 'contact', 'Correo Electrónico de Contacto', 'text'],
      ['social_instagram', 'https://instagram.com/sanctum_chile', 'contact', 'Enlace Instagram', 'text'],
      ['social_linkedin', 'https://linkedin.com/company/sanctum-chile', 'contact', 'Enlace LinkedIn', 'text'],
      ['footer_baseline', 'LAS IDEAS NO SE QUEDAN EN IDEAS.', 'footer', 'Frase de Cierre Footer', 'text'],
      ['iva_rate', '0.19', 'pricing', 'Tasa de IVA aplicada (0.19)', 'text']
    ];

    for (const [key, val, sec, lbl, typ] of defaults) {
      insertContent.run(key, val, sec, lbl, typ);
    }
  }

  // Seed default services if none exists
  const existingServices = db.prepare('SELECT id FROM services LIMIT 1').get();
  if (!existingServices) {
    const insertService = db.prepare(`
      INSERT INTO services (id, title, tagline, description, services_list, cta_text, theme, accent_color, image, image_alt, badge, sort_order, base_price, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const services = [
      [
        'marketing',
        'MARKETING Y PUBLICIDAD',
        'IDEAS QUE SE VEN. EXPERIENCIAS QUE SE VIVEN.',
        'Diseñamos campañas que conectan marcas con personas y transforman la atención en experiencias memorables.',
        JSON.stringify([
          'Campañas publicitarias',
          'Activaciones de marca',
          'Promociones comerciales',
          'Lanzamientos de productos',
          'Publicidad en puntos de venta',
          'Campañas BTL',
          'Experiencias de marca'
        ]),
        'ACTIVAR MI MARCA',
        'dark',
        '#F72585',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        'Activación de marca masiva e interactiva con luces y público',
        'ESTRATEGIA & IMPACTO',
        1,
        1500000,
        'campaña'
      ],
      [
        'promotoras',
        'PROMOTORAS Y PROMOTORES',
        'EL EQUIPO CORRECTO CAMBIA TODO.',
        'Personas que representan tu marca, conectan con tus clientes y hacen que cada interacción cuente.',
        JSON.stringify([
          'Promotoras y promotores',
          'Anfitriones y anfitrionas',
          'Personal para ferias',
          'Apoyo en puntos de venta',
          'Lanzamientos comerciales',
          'Equipos promocionales',
          'Apoyo operativo para eventos'
        ]),
        'NECESITO UN EQUIPO',
        'soft-pink',
        '#FF5A36',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
        'Personal y anfitriones profesionales en activación comercial',
        'STAFF PROFESIONAL',
        2,
        65000,
        'jornada/persona'
      ],
      [
        'navidad',
        'CAMPAÑAS DE NAVIDAD',
        'LA TEMPORADA MÁS IMPORTANTE MERECE UNA GRAN CAMPAÑA.',
        'Activamos tu marca durante Navidad y fin de año con equipos promocionales, experiencias temáticas y apoyo para tus acciones comerciales.',
        JSON.stringify([
          'Promotoras para Navidad',
          'Campañas en puntos de venta',
          'Activaciones comerciales',
          'Apoyo para actividades empresariales',
          'Personal para eventos de fin de año',
          'Coordinación de campañas especiales'
        ]),
        'PREPARAR MI CAMPAÑA',
        'seasonal-coral',
        '#FF6F59',
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
        'Campañas comerciales elegantes de temporada festiva y celebración corporativa',
        'EDICIÓN ESPECIAL FIN DE AÑO',
        3,
        1850000,
        'campaña de temporada'
      ],
      [
        'corporativos',
        'EVENTOS CORPORATIVOS',
        'TU EVENTO. TU MARCA. TU MOMENTO.',
        'Coordinamos experiencias corporativas pensadas para conectar personas, comunicar ideas y generar impacto.',
        JSON.stringify([
          'Eventos empresariales',
          'Inauguraciones',
          'Lanzamientos',
          'Ferias y exposiciones',
          'Actividades corporativas',
          'Celebraciones empresariales',
          'Coordinación de personal y apoyo operativo'
        ]),
        'COTIZAR EVENTO',
        'dark',
        '#E8FF55',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        'Escenario de convención corporativa con iluminación de alta tecnología',
        'PRODUCCIÓN B2B',
        4,
        2500000,
        'producción integral'
      ],
      [
        'privados',
        'EVENTOS PRIVADOS',
        'LAS GRANDES HISTORIAS TAMBIÉN SE CELEBRAN.',
        'Celebraciones creadas alrededor de tus ideas, tu estilo y esos momentos que merecen ser especiales.',
        JSON.stringify([
          'Cumpleaños',
          'Aniversarios',
          'Fiestas privadas',
          'Celebraciones familiares',
          'Eventos sociales',
          'Celebraciones especiales'
        ]),
        'CREAR MI EVENTO',
        'warm-white',
        '#F72585',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        'Fiesta privada elegante con iluminación cálida y ambiente vibrante',
        'CELEBRACIONES DE AUTOR',
        5,
        1200000,
        'evento'
      ]
    ];

    for (const s of services) {
      insertService.run(...s);
    }
  }

  // Seed default rate items (Tarifario)
  const existingRates = db.prepare('SELECT id FROM rate_items LIMIT 1').get();
  if (!existingRates) {
    const insertRate = db.prepare(`
      INSERT INTO rate_items (service_id, category, name, description, unit, price, iva_applicable, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const rates = [
      ['promotoras', 'Staff', 'Promotora / Promotor A (Jornada 4 hrs)', 'Personal seleccionado con uniforme corporativo y supervisión.', 'jornada 4h', 45000, 1, 1],
      ['promotoras', 'Staff', 'Promotora / Promotor Pro (Jornada Completa 8 hrs)', 'Staff con experiencia en retail, ferias y lanzamientos.', 'jornada 8h', 75000, 1, 1],
      ['promotoras', 'Staff', 'Anfitriona / Anfitrión Bilingüe para Ferias', 'Personal para recepciones VIP, congresos y ferias mineras.', 'jornada 8h', 110000, 1, 1],
      ['marketing', 'BTL', 'Activación BTL Punto de Venta (Fin de semana)', 'Equipo de 2 promotoras + supervisor + tótem gráfico + sampling.', 'fin de semana', 850000, 1, 1],
      ['marketing', 'BTL', 'Carpa Promocional & Stand Desarmable', 'Mobiliario publicitario personalizado para ferias y vía pública.', 'unidad', 350000, 1, 1],
      ['corporativos', 'Producción', 'Iluminación Escénica & Sistema de Sonido Pro', 'Consola, 2 micrófonos inalámbricos, 4 focos LED par y técnico de audio.', 'jornada', 550000, 1, 1],
      ['corporativos', 'Producción', 'Pantalla LED Gigante P3.9 con Operador', 'Módulo de 3x2m de alta definición para eventos y conferencias.', 'jornada', 950000, 1, 1],
      ['corporativos', 'Eventos', 'Coordinador General de Producción B2B', 'Supervisión integral de montaje, cronograma y personal en terreno.', 'evento', 400000, 1, 1],
      ['navidad', 'Navidad', 'Campaña Navideña Integral Punto de Venta', '4 promotoras vestidas ad hoc, supervisión y reporte fotográfico diario.', 'semana', 2100000, 1, 1],
      ['logistica', 'Logística', 'Viático y Traslado Interurbano Norte Grande', 'Movilización entre ciudades (Antofagasta, Calama, Iquique, Copiapó).', 'trayecto', 180000, 1, 1]
    ];

    for (const r of rates) {
      insertRate.run(...r);
    }
  }

  // Seed default gallery projects
  const existingGallery = db.prepare('SELECT id FROM gallery_projects LIMIT 1').get();
  if (!existingGallery) {
    const insertGallery = db.prepare(`
      INSERT INTO gallery_projects (id, title, category, location, image, aspect, tag, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const gallery = [
      ['p1', 'Lanzamiento Vehicular & Show de Luces', 'Activaciones de marca', 'Antofagasta', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80', 'tall', 'BTL & Experiencia', 1],
      ['p2', 'Staff de Anfitriones y Promotoras Expo Minería', 'Promotoras', 'Calama', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80', 'square', 'Staff de Marca', 2],
      ['p3', 'Gala Corporativa de Fin de Año', 'Eventos corporativos', 'Iquique', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80', 'wide', 'Producción Integral', 3],
      ['p4', 'Activación Navideña en Mall & Puntos de Venta', 'Navidad', 'La Serena', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80', 'square', 'Campaña Estacional', 4],
      ['p5', 'Celebración Aniversario Privada', 'Eventos privados', 'Arica', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1000&q=80', 'tall', 'Diseño de Ambiente', 5],
      ['p6', 'Sampling y Degustación Masiva en Playa', 'Campañas promocionales', 'Mejillones', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80', 'wide', 'Trade Marketing', 6],
      ['p7', 'Feria Gastronómica & Promotores de Campo', 'Promotoras', 'Copiapó', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80', 'square', 'Conexión Directa', 7],
      ['p8', 'Convención Anual & Reconocimientos', 'Eventos corporativos', 'Coquimbo', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80', 'wide', 'Escenarios & Sonido', 8]
    ];

    for (const g of gallery) {
      insertGallery.run(...g);
    }
  }

  console.log('[DB] Database initialized and verified.');
}

