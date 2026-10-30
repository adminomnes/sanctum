import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sanctum_jwt_secret_key_2026_super_secure';

// Initialize DB schema & seeds
initDatabase();

export const app = express();

// CORS — allow Cloudflare Pages frontend and local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://sanctum-bfi.pages.dev',
  'https://sanctum.servex.com',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));
app.use(express.json());

// Health Check & Root
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sanctum-api', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    service: 'SANCTUM Backend API',
    endpoints: {
      health: '/health',
      public_content: '/api/public/content',
      public_services: '/api/public/services',
      admin_login: '/api/admin/auth/login'
    }
  });
});

// Auth Middleware
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso no proporcionado.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    req.user = user;
    next();
  });
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Se requieren permisos de administrador.' });
  }
  next();
}

// -------------------------------------------------------------
// PUBLIC API (Reflected immediately on public frontend)
// -------------------------------------------------------------

// 1. Get site content / texts / banners
app.get('/api/public/content', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value, section, label, type FROM site_content').all();
    const contentMap: Record<string, string> = {};
    for (const r of rows as any[]) {
      contentMap[r.key] = r.value;
    }
    res.json({ content: contentMap, list: rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get active services
app.get('/api/public/services', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY sort_order ASC').all();
    const formatted = rows.map((r: any) => ({
      ...r,
      servicesList: JSON.parse(r.services_list || '[]'),
      accentColor: r.accent_color,
      ctaText: r.cta_text,
      imageAlt: r.image_alt,
      basePrice: r.base_price
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get rate items (tarifario para cotizador público)
app.get('/api/public/rates', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM rate_items WHERE active = 1 ORDER BY category ASC, price ASC').all();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get gallery items
app.get('/api/public/gallery', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM gallery_projects WHERE active = 1 ORDER BY sort_order ASC').all();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Submit quote from public web
app.post('/api/public/quotes', (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      city,
      service,
      date,
      budget,
      description,
      items // optional array of selected rate card items { name, quantity, unit_price }
    } = req.body;

    if (!name || !email || !phone || !description) {
      return res.status(400).json({ error: 'Nombre, email, teléfono y descripción son obligatorios.' });
    }

    const quoteId = `SANCTUM-${Date.now()}`;

    // Upsert or find client
    let clientId = null;
    const existingClient = db.prepare('SELECT id FROM clients WHERE email = ?').get(email) as any;
    if (existingClient) {
      clientId = existingClient.id;
      db.prepare(`
        UPDATE clients SET name = ?, company = coalesce(?, company), phone = coalesce(?, phone), city = coalesce(?, city), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name, company || null, phone || null, city || null, clientId);
    } else {
      const clientInsert = db.prepare(`
        INSERT INTO clients (name, company, email, phone, city)
        VALUES (?, ?, ?, ?, ?)
      `).run(name, company || null, email, phone, city);
      clientId = clientInsert.lastInsertRowid;
    }

    // Calculate totals if items are provided
    let subtotal = 0;
    const calculatedItems: any[] = [];
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unit_price) || 0;
        const total = qty * price;
        subtotal += total;
        calculatedItems.push({
          description: item.name || item.description,
          quantity: qty,
          unit_price: price,
          total_price: total
        });
      }
    }

    const ivaRate = 0.19;
    const ivaAmount = subtotal * ivaRate;
    const total = subtotal + ivaAmount;

    // Insert quote
    db.prepare(`
      INSERT INTO quotes (
        id, client_id, client_name, company, email, phone, city,
        service_type, event_date, budget_reference, description,
        status, subtotal, iva_rate, iva_amount, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      quoteId,
      clientId,
      name,
      company || '',
      email,
      phone,
      city || 'Antofagasta',
      service || 'Marketing y publicidad',
      date || '',
      budget || '',
      description,
      'pendiente',
      subtotal,
      ivaRate,
      ivaAmount,
      total
    );

    // Insert quote items if any
    if (calculatedItems.length > 0) {
      const insertItem = db.prepare(`
        INSERT INTO quote_items (quote_id, description, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const ci of calculatedItems) {
        insertItem.run(quoteId, ci.description, ci.quantity, ci.unit_price, ci.total_price);
      }
    }

    res.json({
      success: true,
      quoteId,
      message: 'Cotización recibida y registrada exitosamente en el sistema comercial.'
    });
  } catch (error: any) {
    console.error('Error submitting quote:', error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// AUTH & ADMIN APIS
// -------------------------------------------------------------

// Admin Login
app.post('/api/admin/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Profile Check
app.get('/api/admin/auth/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Password Recovery Request
app.post('/api/admin/auth/recovery', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requerido.' });
    }

    const user = db.prepare('SELECT id, name FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      // Do not disclose user existence
      return res.json({ message: 'Si el correo existe, se han generado instrucciones de recuperación.' });
    }

    const recoveryToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    db.prepare('UPDATE users SET recovery_token = ?, recovery_expires = ? WHERE id = ?').run(recoveryToken, expires, user.id);

    // In local/production, return token in dev or send email
    res.json({
      message: 'Instrucciones de recuperación generadas.',
      recoveryCode: recoveryToken // Provided for straightforward administrative reset
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Password Reset with Code
app.post('/api/admin/auth/reset-password', (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND recovery_token = ?').get(email, code) as any;
    if (!user) {
      return res.status(400).json({ error: 'Código de recuperación inválido.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    db.prepare('UPDATE users SET password_hash = ?, recovery_token = NULL, recovery_expires = NULL WHERE id = ?').run(hash, user.id);

    res.json({ success: true, message: 'Contraseña actualizada con éxito.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ADMIN CONTENT CRUD
// -------------------------------------------------------------

app.get('/api/admin/content', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM site_content ORDER BY section ASC, key ASC').all();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/content/:key', authenticateToken, (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'Valor requerido.' });
    }

    db.prepare('UPDATE site_content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(value, key);
    res.json({ success: true, key, value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk update content
app.put('/api/admin/content-bulk', authenticateToken, (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    const stmt = db.prepare('UPDATE site_content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?');
    const updateMany = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        stmt.run(value, key);
      }
    });
    updateMany(updates);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ADMIN SERVICES CRUD
// -------------------------------------------------------------

app.get('/api/admin/services', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM services ORDER BY sort_order ASC').all();
    const formatted = rows.map((r: any) => ({
      ...r,
      servicesList: JSON.parse(r.services_list || '[]'),
      accentColor: r.accent_color,
      ctaText: r.cta_text,
      imageAlt: r.image_alt,
      basePrice: r.base_price,
      active: Boolean(r.active)
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/services', authenticateToken, (req, res) => {
  try {
    const {
      id,
      title,
      tagline,
      description,
      servicesList,
      ctaText,
      theme,
      accentColor,
      image,
      imageAlt,
      badge,
      basePrice,
      unit,
      sortOrder
    } = req.body;

    const serviceId = id || title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    db.prepare(`
      INSERT INTO services (
        id, title, tagline, description, services_list, cta_text,
        theme, accent_color, image, image_alt, badge, base_price, unit, sort_order, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      serviceId,
      title,
      tagline,
      description,
      JSON.stringify(servicesList || []),
      ctaText || 'COTIZAR SERVICIO',
      theme || 'dark',
      accentColor || '#F72585',
      image,
      imageAlt || title,
      badge || null,
      Number(basePrice) || 0,
      unit || 'servicio',
      Number(sortOrder) || 99
    );

    res.json({ success: true, id: serviceId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/services/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      tagline,
      description,
      servicesList,
      ctaText,
      theme,
      accentColor,
      image,
      imageAlt,
      badge,
      basePrice,
      unit,
      sortOrder,
      active
    } = req.body;

    db.prepare(`
      UPDATE services SET
        title = ?, tagline = ?, description = ?, services_list = ?,
        cta_text = ?, theme = ?, accent_color = ?, image = ?,
        image_alt = ?, badge = ?, base_price = ?, unit = ?,
        sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      tagline,
      description,
      JSON.stringify(servicesList || []),
      ctaText,
      theme,
      accentColor,
      image,
      imageAlt,
      badge || null,
      Number(basePrice) || 0,
      unit,
      Number(sortOrder) || 0,
      active ? 1 : 0,
      id
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/services/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ADMIN RATE CARD (TARIFARIO) CRUD
// -------------------------------------------------------------

app.get('/api/admin/rates', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM rate_items ORDER BY category ASC, name ASC').all();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/rates', authenticateToken, (req, res) => {
  try {
    const { service_id, category, name, description, unit, price, iva_applicable, active } = req.body;
    const result = db.prepare(`
      INSERT INTO rate_items (service_id, category, name, description, unit, price, iva_applicable, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      service_id || null,
      category || 'General',
      name,
      description || '',
      unit || 'unidad',
      Number(price) || 0,
      iva_applicable !== false ? 1 : 0,
      active !== false ? 1 : 0
    );
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/rates/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { service_id, category, name, description, unit, price, iva_applicable, active } = req.body;
    db.prepare(`
      UPDATE rate_items SET
        service_id = ?, category = ?, name = ?, description = ?,
        unit = ?, price = ?, iva_applicable = ?, active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      service_id || null,
      category,
      name,
      description,
      unit,
      Number(price) || 0,
      iva_applicable ? 1 : 0,
      active ? 1 : 0,
      id
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/rates/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM rate_items WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ADMIN QUOTES (COTIZACIONES) CRUD & PDF GENERATION
// -------------------------------------------------------------

app.get('/api/admin/quotes', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT q.*, c.company as client_company
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      ORDER BY q.created_at DESC
    `).all();

    // Fetch items for each quote
    const getItemStmt = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?');
    const fullQuotes = rows.map((q: any) => ({
      ...q,
      items: getItemStmt.all(q.id)
    }));

    res.json(fullQuotes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/quotes/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id) as any;
    if (!quote) {
      return res.status(404).json({ error: 'Cotización no encontrada.' });
    }
    const items = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all(id);
    res.json({ ...quote, items });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/quotes', authenticateToken, (req, res) => {
  try {
    const {
      client_name,
      company,
      email,
      phone,
      city,
      service_type,
      event_date,
      description,
      status,
      items,
      notes
    } = req.body;

    const quoteId = `SANCTUM-${Date.now()}`;

    // Find or create client
    let clientId = null;
    const client = db.prepare('SELECT id FROM clients WHERE email = ?').get(email) as any;
    if (client) {
      clientId = client.id;
    } else {
      const inserted = db.prepare(`
        INSERT INTO clients (name, company, email, phone, city)
        VALUES (?, ?, ?, ?, ?)
      `).run(client_name, company || null, email, phone || null, city || null);
      clientId = inserted.lastInsertRowid;
    }

    // Calculate subtotal
    let subtotal = 0;
    const validItems = Array.isArray(items) ? items : [];
    for (const it of validItems) {
      const q = Number(it.quantity) || 1;
      const p = Number(it.unit_price) || 0;
      subtotal += q * p;
    }

    const ivaRate = 0.19;
    const ivaAmount = subtotal * ivaRate;
    const total = subtotal + ivaAmount;

    db.prepare(`
      INSERT INTO quotes (
        id, client_id, client_name, company, email, phone, city,
        service_type, event_date, description, status, subtotal,
        iva_rate, iva_amount, total, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      quoteId,
      clientId,
      client_name,
      company || '',
      email,
      phone || '',
      city || 'Antofagasta',
      service_type || 'Eventos corporativos',
      event_date || '',
      description || '',
      status || 'pendiente',
      subtotal,
      ivaRate,
      ivaAmount,
      total,
      notes || ''
    );

    const insertItem = db.prepare(`
      INSERT INTO quote_items (quote_id, description, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const it of validItems) {
      const q = Number(it.quantity) || 1;
      const p = Number(it.unit_price) || 0;
      insertItem.run(quoteId, it.description, q, p, q * p);
    }

    res.json({ success: true, id: quoteId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/quotes/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_name,
      company,
      email,
      phone,
      city,
      service_type,
      event_date,
      description,
      status,
      items,
      notes
    } = req.body;

    let subtotal = 0;
    const validItems = Array.isArray(items) ? items : [];
    for (const it of validItems) {
      const q = Number(it.quantity) || 1;
      const p = Number(it.unit_price) || 0;
      subtotal += q * p;
    }

    const ivaRate = 0.19;
    const ivaAmount = subtotal * ivaRate;
    const total = subtotal + ivaAmount;

    db.prepare(`
      UPDATE quotes SET
        client_name = ?, company = ?, email = ?, phone = ?, city = ?,
        service_type = ?, event_date = ?, description = ?, status = ?,
        subtotal = ?, iva_amount = ?, total = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      client_name,
      company || '',
      email,
      phone || '',
      city,
      service_type,
      event_date || '',
      description || '',
      status,
      subtotal,
      ivaAmount,
      total,
      notes || '',
      id
    );

    // Refresh items
    db.prepare('DELETE FROM quote_items WHERE quote_id = ?').run(id);
    const insertItem = db.prepare(`
      INSERT INTO quote_items (quote_id, description, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const it of validItems) {
      const q = Number(it.quantity) || 1;
      const p = Number(it.unit_price) || 0;
      insertItem.run(id, it.description, q, p, q * p);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/quotes/:id/status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE quotes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/quotes/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ADMIN CLIENTS CRUD
// -------------------------------------------------------------

app.get('/api/admin/clients', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.*, COUNT(q.id) as quotes_count, SUM(q.total) as total_quoted
      FROM clients c
      LEFT JOIN quotes q ON c.id = q.client_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/clients', authenticateToken, (req, res) => {
  try {
    const { name, company, email, phone, city, notes } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y correo son requeridos.' });
    }

    const inserted = db.prepare(`
      INSERT INTO clients (name, company, email, phone, city, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, company || null, email, phone || null, city || null, notes || null);

    res.json({ success: true, id: inserted.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/clients/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, email, phone, city, notes } = req.body;
    db.prepare(`
      UPDATE clients SET
        name = ?, company = ?, email = ?, phone = ?, city = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, company || null, email, phone || null, city || null, notes || null, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/clients/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ADMIN CAMPAIGNS & EVENTS CRUD
// -------------------------------------------------------------

app.get('/api/admin/campaigns', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM campaigns_events ORDER BY start_date DESC').all();
    const formatted = rows.map((r: any) => ({
      ...r,
      staffAssigned: JSON.parse(r.staff_assigned || '[]')
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/campaigns', authenticateToken, (req, res) => {
  try {
    const {
      title,
      type,
      client_name,
      city,
      venue,
      start_date,
      end_date,
      status,
      budget,
      staffAssigned,
      requirements,
      notes
    } = req.body;

    const inserted = db.prepare(`
      INSERT INTO campaigns_events (
        title, type, client_name, city, venue, start_date, end_date,
        status, budget, staff_assigned, requirements, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      type || 'activacion',
      client_name || null,
      city || 'Antofagasta',
      venue || null,
      start_date,
      end_date || null,
      status || 'planificacion',
      Number(budget) || 0,
      JSON.stringify(staffAssigned || []),
      requirements || null,
      notes || null
    );

    res.json({ success: true, id: inserted.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/campaigns/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      client_name,
      city,
      venue,
      start_date,
      end_date,
      status,
      budget,
      staffAssigned,
      requirements,
      notes
    } = req.body;

    db.prepare(`
      UPDATE campaigns_events SET
        title = ?, type = ?, client_name = ?, city = ?, venue = ?,
        start_date = ?, end_date = ?, status = ?, budget = ?,
        staff_assigned = ?, requirements = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      type,
      client_name || null,
      city,
      venue || null,
      start_date,
      end_date || null,
      status,
      Number(budget) || 0,
      JSON.stringify(staffAssigned || []),
      requirements || null,
      notes || null,
      id
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/campaigns/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM campaigns_events WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ADMIN USERS CRUD & PERMISSIONS
// -------------------------------------------------------------

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const rows = db.prepare('SELECT id, email, name, role, status, created_at FROM users ORDER BY created_at ASC').all();
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { email, password, name, role, status } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, nombre y contraseña son requeridos.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const inserted = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, hash, name, role || 'editor', status || 'active');

    res.json({ success: true, id: inserted.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status, password } = req.body;

    if (password && password.trim().length > 0) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      db.prepare(`
        UPDATE users SET name = ?, role = ?, status = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name, role, status, hash, id);
    } else {
      db.prepare(`
        UPDATE users SET name = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name, role, status, id);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (req.user && req.user.id === Number(id)) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario.' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start listening if run directly
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[SANCTUM API] Server running on http://localhost:${PORT}`);
});

