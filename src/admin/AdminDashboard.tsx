import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  DollarSign,
  FileSpreadsheet,
  Users,
  Calendar,
  Shield,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { generateQuotePDF } from '../utils/pdfGenerator';
import type { User, SiteContentItem, Service, RateItem, Quote, Client, CampaignEvent } from './types';

interface AdminDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onGoToSite: () => void;
}

type TabKey = 'resumen' | 'contenido' | 'servicios' | 'tarifario' | 'cotizaciones' | 'clientes' | 'campanas' | 'usuarios';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, token, onLogout, onGoToSite }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('resumen');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data states
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [contentList, setContentList] = useState<SiteContentItem[]>([]);
  const [rates, setRates] = useState<RateItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignEvent[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Notification helper
  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Auth headers
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch all initial data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [qRes, sRes, cRes, rRes, clRes, cmpRes] = await Promise.all([
        apiFetch('/api/admin/quotes', { headers: authHeaders }),
        apiFetch('/api/admin/services', { headers: authHeaders }),
        apiFetch('/api/admin/content', { headers: authHeaders }),
        apiFetch('/api/admin/rates', { headers: authHeaders }),
        apiFetch('/api/admin/clients', { headers: authHeaders }),
        apiFetch('/api/admin/campaigns', { headers: authHeaders })
      ]);

      if (qRes.ok) setQuotes(await qRes.json());
      if (sRes.ok) setServices(await sRes.json());
      if (cRes.ok) setContentList(await cRes.json());
      if (rRes.ok) setRates(await rRes.json());
      if (clRes.ok) setClients(await clRes.json());
      if (cmpRes.ok) setCampaigns(await cmpRes.json());

      if (user.role === 'admin') {
        const uRes = await apiFetch('/api/admin/users', { headers: authHeaders });
        if (uRes.ok) setUsersList(await uRes.json());
      }
    } catch (err: any) {
      notify('Error cargando datos del servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // -------------------------------------------------------------
  // 1. CONTENT EDITOR HANDLERS
  // -------------------------------------------------------------
  const [contentChanges, setContentChanges] = useState<Record<string, string>>({});

  const handleContentChange = (key: string, value: string) => {
    setContentChanges(prev => ({ ...prev, [key]: value }));
  };

  const saveContentChanges = async () => {
    try {
      const res = await apiFetch('/api/admin/content-bulk', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(contentChanges)
      });
      if (!res.ok) throw new Error('Error al guardar cambios de contenido.');
      notify('Contenido del sitio actualizado y reflejado en la web.');
      setContentChanges({});
      // reload content
      const cRes = await apiFetch('/api/admin/content', { headers: authHeaders });
      if (cRes.ok) setContentList(await cRes.json());
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // 2. SERVICES HANDLERS
  // -------------------------------------------------------------
  const [editingService, setEditingService] = useState<Service | null>(null);

  const saveService = async (service: Service) => {
    try {
      const isNew = !services.find(s => s.id === service.id);
      const url = isNew ? '/api/admin/services' : `/api/admin/services/${service.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(service)
      });
      if (!res.ok) throw new Error('Error guardando servicio.');
      notify(`Servicio "${service.title}" guardado exitosamente.`);
      setEditingService(null);
      const sRes = await apiFetch('/api/admin/services', { headers: authHeaders });
      if (sRes.ok) setServices(await sRes.json());
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      const res = await apiFetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) throw new Error('Error eliminando servicio.');
      notify('Servicio eliminado.');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // 3. RATES (TARIFARIO) HANDLERS
  // -------------------------------------------------------------
  const [newRate, setNewRate] = useState<Partial<RateItem>>({
    category: 'Staff',
    name: '',
    description: '',
    unit: 'jornada',
    price: 0,
    iva_applicable: 1,
    active: 1
  });
  const [showRateModal, setShowRateModal] = useState(false);

  const saveRate = async (rate: Partial<RateItem>) => {
    try {
      const isNew = !rate.id;
      const url = isNew ? '/api/admin/rates' : `/api/admin/rates/${rate.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(rate)
      });
      if (!res.ok) throw new Error('Error guardando ítem de tarifario.');
      notify('Tarifario actualizado.');
      setShowRateModal(false);
      const rRes = await apiFetch('/api/admin/rates', { headers: authHeaders });
      if (rRes.ok) setRates(await rRes.json());
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const deleteRate = async (id: number) => {
    if (!confirm('¿Eliminar ítem del tarifario?')) return;
    try {
      const res = await apiFetch(`/api/admin/rates/${id}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) throw new Error('Error eliminando ítem.');
      notify('Ítem eliminado.');
      setRates(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // 4. QUOTES HANDLERS & MODAL
  // -------------------------------------------------------------
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [newQuoteModal, setNewQuoteModal] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState<any>({
    client_name: '',
    company: '',
    email: '',
    phone: '',
    city: 'Antofagasta',
    service_type: 'Eventos corporativos',
    event_date: '',
    description: '',
    items: [{ description: 'Servicio base', quantity: 1, unit_price: 150000 }]
  });

  const updateQuoteStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/api/admin/quotes/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Error actualizando estado.');
      notify(`Estado actualizado a ${status.toUpperCase()}.`);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: status as any } : q));
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const createAdminQuote = async () => {
    try {
      const res = await apiFetch('/api/admin/quotes', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newQuoteData)
      });
      if (!res.ok) throw new Error('Error creando cotización.');
      notify('Cotización creada exitosamente.');
      setNewQuoteModal(false);
      const qRes = await apiFetch('/api/admin/quotes', { headers: authHeaders });
      if (qRes.ok) setQuotes(await qRes.json());
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // 5. CLIENTS HANDLERS
  // -------------------------------------------------------------
  const [clientSearch, setClientSearch] = useState('');
  const [newClientModal, setNewClientModal] = useState(false);
  const [clientForm, setClientForm] = useState<Partial<Client>>({ name: '', company: '', email: '', phone: '', city: 'Antofagasta', notes: '' });

  const saveClient = async () => {
    try {
      const isNew = !clientForm.id;
      const url = isNew ? '/api/admin/clients' : `/api/admin/clients/${clientForm.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(clientForm)
      });
      if (!res.ok) throw new Error('Error guardando cliente.');
      notify('Cliente guardado.');
      setNewClientModal(false);
      const clRes = await apiFetch('/api/admin/clients', { headers: authHeaders });
      if (clRes.ok) setClients(await clRes.json());
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // 6. CAMPAIGNS & EVENTS HANDLERS
  // -------------------------------------------------------------
  const [campaignModal, setCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState<Partial<CampaignEvent>>({
    title: '',
    type: 'activacion',
    client_name: '',
    city: 'Antofagasta',
    venue: '',
    start_date: new Date().toISOString().split('T')[0],
    status: 'planificacion',
    budget: 0,
    staffAssigned: [],
    requirements: ''
  });

  const saveCampaign = async () => {
    try {
      const isNew = !campaignForm.id;
      const url = isNew ? '/api/admin/campaigns' : `/api/admin/campaigns/${campaignForm.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(campaignForm)
      });
      if (!res.ok) throw new Error('Error guardando campaña o evento.');
      notify('Campaña/Evento guardado exitosamente.');
      setCampaignModal(false);
      const cmpRes = await apiFetch('/api/admin/campaigns', { headers: authHeaders });
      if (cmpRes.ok) setCampaigns(await cmpRes.json());
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // 7. USERS MANAGEMENT (Admin only)
  // -------------------------------------------------------------
  const [newUserModal, setNewUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'editor', status: 'active' });

  const saveUser = async () => {
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(userForm)
      });
      if (!res.ok) throw new Error('Error creando usuario.');
      notify('Usuario creado.');
      setNewUserModal(false);
      setUserForm({ name: '', email: '', password: '', role: 'editor', status: 'active' });
      const uRes = await apiFetch('/api/admin/users', { headers: authHeaders });
      if (uRes.ok) setUsersList(await uRes.json());
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#121212',
      color: 'var(--warm-white)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: notification.type === 'success' ? 'var(--yellow)' : 'var(--orange)',
          color: 'var(--carbon)',
          padding: '14px 20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        background: 'var(--carbon)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          {/* Logo Brand Header */}
          <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: 'var(--warm-white)'
              }}>
                SANCTUM
              </span>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--magenta)',
                boxShadow: '0 0 10px var(--magenta)'
              }} />
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--yellow)',
              letterSpacing: '0.12em',
              fontWeight: 700,
              marginTop: '4px'
            }}>
              ADMIN PRIVADO
            </div>
          </div>

          {/* Nav Items */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { key: 'resumen', label: 'Resumen General', icon: LayoutDashboard },
              { key: 'cotizaciones', label: 'Cotizaciones', icon: FileSpreadsheet, badge: quotes.filter(q => q.status === 'pendiente').length },
              { key: 'servicios', label: 'Servicios', icon: Briefcase },
              { key: 'tarifario', label: 'Tarifario & Precios', icon: DollarSign },
              { key: 'contenido', label: 'Contenido Web', icon: FileText },
              { key: 'clientes', label: 'Clientes', icon: Users },
              { key: 'campanas', label: 'Campañas y Eventos', icon: Calendar },
              ...(user.role === 'admin' ? [{ key: 'usuarios', label: 'Usuarios & Roles', icon: Shield }] : [])
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as TabKey)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 14px',
                    background: isActive ? 'var(--magenta)' : 'transparent',
                    color: isActive ? 'var(--warm-white)' : 'rgba(255, 253, 248, 0.75)',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span style={{
                      background: 'var(--yellow)',
                      color: 'var(--carbon)',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions Bottom */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--warm-white)' }}>{user.name}</div>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--yellow)', textTransform: 'uppercase' }}>
              Rol: {user.role}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={onGoToSite}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--warm-white)',
                padding: '10px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <ExternalLink size={14} />
              <span>Ver Web Pública</span>
            </button>

            <button
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: '1px solid rgba(255, 90, 54, 0.3)',
                color: 'var(--orange)',
                padding: '10px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
        
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '36px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--warm-white)',
              margin: 0
            }}>
              {activeTab === 'resumen' && 'Resumen Ejecutivo'}
              {activeTab === 'cotizaciones' && 'Gestión de Cotizaciones'}
              {activeTab === 'servicios' && 'Administración de Servicios'}
              {activeTab === 'tarifario' && 'Tarifario de Servicios & IVA'}
              {activeTab === 'contenido' && 'Editor de Contenido & Banners'}
              {activeTab === 'clientes' && 'Cartera de Clientes'}
              {activeTab === 'campanas' && 'Campañas & Eventos en Calendario'}
              {activeTab === 'usuarios' && 'Usuarios & Control de Acceso'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>
              Control directo reflejado en tiempo real en la web pública de SANCTUM.
            </p>
          </div>

          <button
            onClick={loadAllData}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--warm-white)',
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sincronizar</span>
          </button>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: RESUMEN GENERAL
        ------------------------------------------------------------- */}
        {activeTab === 'resumen' && (
          <div>
            {/* Quick Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '36px'
            }}>
              <div style={{ background: 'var(--carbon)', borderLeft: '4px solid var(--magenta)', padding: '24px' }}>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)' }}>COTIZACIONES TOTALES</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: 'var(--warm-white)', margin: '6px 0' }}>
                  {quotes.length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
                  {quotes.filter(q => q.status === 'pendiente').length} Pendientes de revisión
                </div>
              </div>

              <div style={{ background: 'var(--carbon)', borderLeft: '4px solid var(--orange)', padding: '24px' }}>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)' }}>MONTO COTIZADO TOTAL</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 900, color: 'var(--warm-white)', margin: '6px 0' }}>
                  ${quotes.reduce((acc, q) => acc + (q.total || 0), 0).toLocaleString('es-CL')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
                  Valores con IVA incluido
                </div>
              </div>

              <div style={{ background: 'var(--carbon)', borderLeft: '4px solid var(--yellow)', padding: '24px' }}>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)' }}>CLIENTES REGISTRADOS</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: 'var(--warm-white)', margin: '6px 0' }}>
                  {clients.length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
                  Empresas y particulares
                </div>
              </div>

              <div style={{ background: 'var(--carbon)', borderLeft: '4px solid var(--soft-pink)', padding: '24px' }}>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)' }}>SERVICIOS ACTIVOS</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: 'var(--warm-white)', margin: '6px 0' }}>
                  {services.filter(s => s.active).length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
                  Publicados en frontend
                </div>
              </div>
            </div>

            {/* Recent Quotes Feed */}
            <div style={{ background: 'var(--carbon)', border: '1px solid rgba(255,255,255,0.1)', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', textTransform: 'uppercase', margin: 0 }}>
                  Últimas Cotizaciones Ingresadas
                </h3>
                <button
                  onClick={() => setActiveTab('cotizaciones')}
                  style={{ background: 'none', border: 'none', color: 'var(--yellow)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                >
                  Ver todas →
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>CLIENTE</th>
                      <th style={{ padding: '10px' }}>CIUDAD</th>
                      <th style={{ padding: '10px' }}>SERVICIO</th>
                      <th style={{ padding: '10px' }}>ESTADO</th>
                      <th style={{ padding: '10px' }}>MONTO</th>
                      <th style={{ padding: '10px' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.slice(0, 5).map(q => (
                      <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>{q.id}</td>
                        <td style={{ padding: '12px 10px', fontWeight: 600 }}>{q.client_name} {q.company && <span style={{ opacity: 0.6 }}>({q.company})</span>}</td>
                        <td style={{ padding: '12px 10px' }}>{q.city}</td>
                        <td style={{ padding: '12px 10px' }}>{q.service_type}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: q.status === 'aprobada' ? '#25D366' : (q.status === 'pendiente' ? 'var(--yellow)' : 'var(--orange)'),
                            color: 'var(--carbon)'
                          }}>
                            {q.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', fontWeight: 700 }}>
                          ${q.total > 0 ? q.total.toLocaleString('es-CL') : 'A convenir'}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <button
                            onClick={() => { setSelectedQuote(q); setActiveTab('cotizaciones'); }}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: GESTIÓN DE COTIZACIONES & PDF
        ------------------------------------------------------------- */}
        {activeTab === 'cotizaciones' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setNewQuoteModal(true)}
                  style={{
                    background: 'var(--yellow)',
                    color: 'var(--carbon)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    padding: '12px 20px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={16} strokeWidth={3} />
                  <span>CREAR COTIZACIÓN</span>
                </button>
              </div>
            </div>

            {/* Quotes Table */}
            <div style={{ background: 'var(--carbon)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      <th style={{ padding: '10px' }}>REFERENCIA</th>
                      <th style={{ padding: '10px' }}>CLIENTE / EMPRESA</th>
                      <th style={{ padding: '10px' }}>CIUDAD</th>
                      <th style={{ padding: '10px' }}>SERVICIO</th>
                      <th style={{ padding: '10px' }}>FECHA EVENTO</th>
                      <th style={{ padding: '10px' }}>ESTADO</th>
                      <th style={{ padding: '10px' }}>TOTAL CLP</th>
                      <th style={{ padding: '10px' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map(q => (
                      <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '14px 10px', fontFamily: 'var(--font-mono)', color: 'var(--yellow)', fontWeight: 700 }}>{q.id}</td>
                        <td style={{ padding: '14px 10px' }}>
                          <div style={{ fontWeight: 700 }}>{q.client_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{q.email} | {q.phone}</div>
                        </td>
                        <td style={{ padding: '14px 10px' }}>{q.city}</td>
                        <td style={{ padding: '14px 10px' }}>{q.service_type}</td>
                        <td style={{ padding: '14px 10px' }}>{q.event_date || 'Por coordinar'}</td>
                        <td style={{ padding: '14px 10px' }}>
                          <select
                            value={q.status}
                            onChange={(e) => updateQuoteStatus(q.id, e.target.value)}
                            style={{
                              background: '#111',
                              color: 'var(--warm-white)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              padding: '6px 8px',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            <option value="pendiente">PENDIENTE</option>
                            <option value="en_revision">EN REVISIÓN</option>
                            <option value="enviada">ENVIADA</option>
                            <option value="aprobada">APROBADA</option>
                            <option value="rechazada">RECHAZADA</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 10px', fontWeight: 800, color: 'var(--magenta)' }}>
                          ${q.total > 0 ? q.total.toLocaleString('es-CL') : 'A convenir'}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => generateQuotePDF(q)}
                              title="Descargar PDF"
                              style={{
                                background: 'rgba(232, 255, 85, 0.15)',
                                border: '1px solid var(--yellow)',
                                color: 'var(--yellow)',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem'
                              }}
                            >
                              <Download size={14} />
                              <span>PDF</span>
                            </button>
                            <button
                              onClick={() => setSelectedQuote(q)}
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: '#fff',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Ver
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quote Detail Modal */}
            {selectedQuote && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'var(--carbon)',
                  border: '2px solid var(--magenta)',
                  padding: '36px',
                  maxWidth: '700px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: 0 }}>
                        COTIZACIÓN {selectedQuote.id}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
                        Estado: {selectedQuote.status.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedQuote(null)}
                      style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '0.9rem' }}>
                    <div><strong>Cliente:</strong> {selectedQuote.client_name}</div>
                    <div><strong>Empresa:</strong> {selectedQuote.company || 'Particular'}</div>
                    <div><strong>Email:</strong> {selectedQuote.email}</div>
                    <div><strong>Teléfono:</strong> {selectedQuote.phone}</div>
                    <div><strong>Ciudad:</strong> {selectedQuote.city}</div>
                    <div><strong>Fecha Evento:</strong> {selectedQuote.event_date || 'A convenir'}</div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <strong>Descripción del Requerimiento:</strong>
                    <p style={{ background: '#111', padding: '12px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', marginTop: '6px' }}>
                      {selectedQuote.description || 'Sin descripción adicional.'}
                    </p>
                  </div>

                  {selectedQuote.items && selectedQuote.items.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <strong>Ítems Detallados:</strong>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: '#111', color: 'rgba(255,255,255,0.6)' }}>
                            <th style={{ padding: '8px' }}>Ítem</th>
                            <th style={{ padding: '8px' }}>Cant.</th>
                            <th style={{ padding: '8px' }}>P. Unit</th>
                            <th style={{ padding: '8px' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedQuote.items.map((it, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '8px' }}>{it.description}</td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>{it.quantity}</td>
                              <td style={{ padding: '8px' }}>${it.unit_price.toLocaleString('es-CL')}</td>
                              <td style={{ padding: '8px' }}>${it.total_price.toLocaleString('es-CL')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.9rem' }}>Subtotal: ${selectedQuote.subtotal.toLocaleString('es-CL')}</div>
                    <div style={{ fontSize: '0.9rem' }}>IVA (19%): ${selectedQuote.iva_amount.toLocaleString('es-CL')}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--yellow)', marginTop: '4px' }}>
                      Total: ${selectedQuote.total.toLocaleString('es-CL')} CLP
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      onClick={() => generateQuotePDF(selectedQuote)}
                      style={{
                        background: 'var(--yellow)',
                        color: 'var(--carbon)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        padding: '12px 20px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Download size={16} />
                      DESCARGAR PDF OFICIAL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Quote Modal */}
            {newQuoteModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'var(--carbon)',
                  border: '2px solid var(--yellow)',
                  padding: '36px',
                  maxWidth: '750px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: 0 }}>
                      CREAR NUEVA COTIZACIÓN
                    </h3>
                    <button onClick={() => setNewQuoteModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>NOMBRE CLIENTE *</label>
                      <input
                        type="text"
                        required
                        value={newQuoteData.client_name}
                        onChange={(e) => setNewQuoteData({ ...newQuoteData, client_name: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>EMPRESA</label>
                      <input
                        type="text"
                        value={newQuoteData.company}
                        onChange={(e) => setNewQuoteData({ ...newQuoteData, company: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>EMAIL *</label>
                      <input
                        type="email"
                        required
                        value={newQuoteData.email}
                        onChange={(e) => setNewQuoteData({ ...newQuoteData, email: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>TELÉFONO</label>
                      <input
                        type="tel"
                        value={newQuoteData.phone}
                        onChange={(e) => setNewQuoteData({ ...newQuoteData, phone: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>CIUDAD</label>
                      <input
                        type="text"
                        value={newQuoteData.city}
                        onChange={(e) => setNewQuoteData({ ...newQuoteData, city: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>SERVICIO PRINCIPAL</label>
                      <input
                        type="text"
                        value={newQuoteData.service_type}
                        onChange={(e) => setNewQuoteData({ ...newQuoteData, service_type: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                  </div>

                  {/* Dynamic Items Builder */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>ÍTEMS DE COTIZACIÓN</span>
                      <button
                        type="button"
                        onClick={() => setNewQuoteData({
                          ...newQuoteData,
                          items: [...newQuoteData.items, { description: '', quantity: 1, unit_price: 0 }]
                        })}
                        style={{ background: 'var(--magenta)', color: '#fff', border: 'none', padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        + Agregar Ítem
                      </button>
                    </div>

                    {newQuoteData.items.map((it: any, idx: number) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 120px 40px', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          placeholder="Descripción del ítem"
                          value={it.description}
                          onChange={(e) => {
                            const updated = [...newQuoteData.items];
                            updated[idx].description = e.target.value;
                            setNewQuoteData({ ...newQuoteData, items: updated });
                          }}
                          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', color: '#fff' }}
                        />
                        <input
                          type="number"
                          placeholder="Cant."
                          value={it.quantity}
                          onChange={(e) => {
                            const updated = [...newQuoteData.items];
                            updated[idx].quantity = Number(e.target.value);
                            setNewQuoteData({ ...newQuoteData, items: updated });
                          }}
                          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', color: '#fff' }}
                        />
                        <input
                          type="number"
                          placeholder="Precio CLP"
                          value={it.unit_price}
                          onChange={(e) => {
                            const updated = [...newQuoteData.items];
                            updated[idx].unit_price = Number(e.target.value);
                            setNewQuoteData({ ...newQuoteData, items: updated });
                          }}
                          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', color: '#fff' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newQuoteData.items.filter((_: any, i: number) => i !== idx);
                            setNewQuoteData({ ...newQuoteData, items: updated });
                          }}
                          style={{ background: 'rgba(255,90,54,0.2)', color: 'var(--orange)', border: 'none', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => setNewQuoteModal(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 20px', cursor: 'pointer' }}>
                      CANCELAR
                    </button>
                    <button onClick={createAdminQuote} style={{ background: 'var(--yellow)', color: 'var(--carbon)', border: 'none', padding: '12px 24px', fontWeight: 900, cursor: 'pointer' }}>
                      GUARDAR COTIZACIÓN
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: SERVICIOS
        ------------------------------------------------------------- */}
        {activeTab === 'servicios' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                Cualquier cambio de imagen, descripción, precio o estado se refleja inmediatamente en la sección de servicios pública.
              </p>
              <button
                onClick={() => setEditingService({
                  id: `srv-${Date.now()}`,
                  title: '',
                  tagline: '',
                  description: '',
                  servicesList: ['Característica 1', 'Característica 2'],
                  ctaText: 'COTIZAR SERVICIO',
                  theme: 'dark',
                  accentColor: '#F72585',
                  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
                  imageAlt: 'Servicio nuevo SANCTUM',
                  active: true,
                  sort_order: services.length + 1,
                  basePrice: 500000,
                  unit: 'campaña'
                })}
                style={{
                  background: 'var(--yellow)',
                  color: 'var(--carbon)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  padding: '12px 20px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} strokeWidth={3} />
                <span>NUEVO SERVICIO</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {services.map(s => (
                <div key={s.id} style={{
                  background: 'var(--carbon)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr auto',
                  gap: '24px',
                  alignItems: 'center'
                }}>
                  <img
                    src={s.image}
                    alt={s.title}
                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{
                        background: s.accentColor,
                        color: '#000',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        padding: '2px 6px'
                      }}>
                        {s.theme.toUpperCase()}
                      </span>
                      <span style={{
                        color: s.active ? '#25D366' : 'var(--orange)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700
                      }}>
                        {s.active ? '● ACTIVO EN LA WEB' : '○ DESACTIVADO'}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 6px', color: 'var(--warm-white)' }}>
                      {s.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                      {s.description}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>
                      Precio base: ${s.basePrice ? s.basePrice.toLocaleString('es-CL') : '0'} CLP / {s.unit || 'unidad'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => setEditingService(s)}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '8px 14px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Editar
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => deleteService(s.id)}
                        style={{
                          background: 'rgba(255,90,54,0.15)',
                          border: '1px solid var(--orange)',
                          color: 'var(--orange)',
                          padding: '8px 14px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Edit / Create Service Modal */}
            {editingService && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'var(--carbon)',
                  border: '2px solid var(--magenta)',
                  padding: '36px',
                  maxWidth: '750px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '20px' }}>
                    EDITAR SERVICIO: {editingService.title || 'NUEVO'}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>TÍTULO DEL SERVICIO</label>
                      <input
                        type="text"
                        value={editingService.title}
                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>TAGLINE / TITULAR EDITORIAL</label>
                      <input
                        type="text"
                        value={editingService.tagline}
                        onChange={(e) => setEditingService({ ...editingService, tagline: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>PRECIO BASE CLP</label>
                      <input
                        type="number"
                        value={editingService.basePrice || 0}
                        onChange={(e) => setEditingService({ ...editingService, basePrice: Number(e.target.value) })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>UNIDAD DE COBRO</label>
                      <input
                        type="text"
                        value={editingService.unit || 'servicio'}
                        onChange={(e) => setEditingService({ ...editingService, unit: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>COLOR ACENTO HEX</label>
                      <input
                        type="text"
                        value={editingService.accentColor}
                        onChange={(e) => setEditingService({ ...editingService, accentColor: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>TEMA VISUAL</label>
                      <select
                        value={editingService.theme}
                        onChange={(e) => setEditingService({ ...editingService, theme: e.target.value as any })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      >
                        <option value="dark">Dark (Negro Carbón)</option>
                        <option value="soft-pink">Soft Pink (Rosa Suave)</option>
                        <option value="warm-white">Warm White (Blanco Cálido)</option>
                        <option value="seasonal-coral">Seasonal Coral (Navidad / Fin de Año)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>URL DE LA FOTOGRAFÍA</label>
                    <input
                      type="text"
                      value={editingService.image}
                      onChange={(e) => setEditingService({ ...editingService, image: e.target.value })}
                      style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>DESCRIPCIÓN COMERCIAL</label>
                    <textarea
                      rows={3}
                      value={editingService.description}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editingService.active}
                        onChange={(e) => setEditingService({ ...editingService, active: e.target.checked })}
                      />
                      <span>Servicio visible y activo en la web pública</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => setEditingService(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 20px', cursor: 'pointer' }}>
                      CANCELAR
                    </button>
                    <button onClick={() => saveService(editingService)} style={{ background: 'var(--magenta)', color: '#fff', border: 'none', padding: '12px 24px', fontWeight: 900, cursor: 'pointer' }}>
                      GUARDAR CAMBIOS
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: TARIFARIO & PRECIOS & IVA
        ------------------------------------------------------------- */}
        {activeTab === 'tarifario' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
                Configura los precios unitarios, personal de campo, equipamiento y costos adicionales para confeccionar cotizaciones con IVA (19%).
              </div>
              <button
                onClick={() => {
                  setNewRate({ category: 'Staff', name: '', description: '', unit: 'jornada', price: 0, iva_applicable: 1, active: 1 });
                  setShowRateModal(true);
                }}
                style={{
                  background: 'var(--yellow)',
                  color: 'var(--carbon)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  padding: '12px 20px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} strokeWidth={3} />
                <span>AGREGAR PRECIO / SERVICIO</span>
              </button>
            </div>

            <div style={{ background: 'var(--carbon)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '10px' }}>CATEGORÍA</th>
                    <th style={{ padding: '10px' }}>ÍTEM / CONCEPTO</th>
                    <th style={{ padding: '10px' }}>UNIDAD DE COBRO</th>
                    <th style={{ padding: '10px' }}>PRECIO NETO</th>
                    <th style={{ padding: '10px' }}>CON IVA (19%)</th>
                    <th style={{ padding: '10px' }}>ESTADO</th>
                    <th style={{ padding: '10px' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>{r.category}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 700 }}>{r.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{r.description}</div>
                      </td>
                      <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>{r.unit}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>${r.price.toLocaleString('es-CL')}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--magenta)' }}>
                        ${Math.round(r.price * 1.19).toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ color: r.active ? '#25D366' : 'var(--orange)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                          {r.active ? 'ACTIVO' : 'PAUSADO'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <button
                          onClick={() => { setNewRate(r); setShowRateModal(true); }}
                          style={{ background: 'none', border: 'none', color: 'var(--yellow)', cursor: 'pointer', marginRight: '8px' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteRate(r.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--orange)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rate Item Modal */}
            {showRateModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'var(--carbon)',
                  border: '2px solid var(--yellow)',
                  padding: '36px',
                  maxWidth: '550px',
                  width: '100%'
                }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '20px' }}>
                    {newRate.id ? 'EDITAR PRECIO EN TARIFARIO' : 'AGREGAR ÍTEM AL TARIFARIO'}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>CATEGORÍA</label>
                      <select
                        value={newRate.category}
                        onChange={(e) => setNewRate({ ...newRate, category: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      >
                        <option value="Staff">Staff (Promotoras / Anfitriones)</option>
                        <option value="BTL">BTL & Activaciones</option>
                        <option value="Eventos">Eventos & Coordinación</option>
                        <option value="Producción">Producción Técnica & Escenarios</option>
                        <option value="Navidad">Campañas Navideñas</option>
                        <option value="Logística">Logística & Traslados Norte</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>NOMBRE DEL SERVICIO / PRODUCTO</label>
                      <input
                        type="text"
                        value={newRate.name}
                        onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>UNIDAD (ej. jornada, hora)</label>
                        <input
                          type="text"
                          value={newRate.unit}
                          onChange={(e) => setNewRate({ ...newRate, unit: e.target.value })}
                          style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>PRECIO NETO (CLP)</label>
                        <input
                          type="number"
                          value={newRate.price}
                          onChange={(e) => setNewRate({ ...newRate, price: Number(e.target.value) })}
                          style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>DESCRIPCIÓN BREVE</label>
                      <input
                        type="text"
                        value={newRate.description}
                        onChange={(e) => setNewRate({ ...newRate, description: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => setShowRateModal(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', cursor: 'pointer' }}>
                      CANCELAR
                    </button>
                    <button onClick={() => saveRate(newRate)} style={{ background: 'var(--yellow)', color: 'var(--carbon)', border: 'none', padding: '10px 22px', fontWeight: 900, cursor: 'pointer' }}>
                      GUARDAR
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: CONTENIDO WEB & TEXTOS & BANNERS
        ------------------------------------------------------------- */}
        {activeTab === 'contenido' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                Modifica titulares, citas editoriales, imágenes de cabecera y enlaces de redes sociales.
              </div>
              {Object.keys(contentChanges).length > 0 && (
                <button
                  onClick={saveContentChanges}
                  style={{
                    background: 'var(--magenta)',
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    padding: '12px 24px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Save size={16} />
                  <span>GUARDAR CAMBIOS ({Object.keys(contentChanges).length})</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {contentList.map(item => {
                const currentValue = contentChanges[item.key] !== undefined ? contentChanges[item.key] : item.value;
                return (
                  <div key={item.key} style={{
                    background: 'var(--carbon)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--yellow)', fontWeight: 700 }}>
                        {item.label} [{item.key}]
                      </label>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                        Sección: {item.section}
                      </span>
                    </div>

                    {item.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={currentValue}
                        onChange={(e) => handleContentChange(item.key, e.target.value)}
                        style={{
                          background: '#111',
                          border: '1px solid rgba(255,255,255,0.2)',
                          padding: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleContentChange(item.key, e.target.value)}
                        style={{
                          background: '#111',
                          border: '1px solid rgba(255,255,255,0.2)',
                          padding: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    )}

                    {item.type === 'image' && (
                      <div style={{ marginTop: '6px' }}>
                        <img
                          src={currentValue}
                          alt={item.label}
                          style={{ height: '80px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                          onError={(e: any) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 6: CLIENTES
        ------------------------------------------------------------- */}
        {activeTab === 'clientes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Buscar cliente por nombre o email..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                style={{
                  background: 'var(--carbon)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '10px 16px',
                  color: '#fff',
                  width: '320px'
                }}
              />
              <button
                onClick={() => {
                  setClientForm({ name: '', company: '', email: '', phone: '', city: 'Antofagasta', notes: '' });
                  setNewClientModal(true);
                }}
                style={{
                  background: 'var(--yellow)',
                  color: 'var(--carbon)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  padding: '12px 20px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} strokeWidth={3} />
                <span>NUEVO CLIENTE</span>
              </button>
            </div>

            <div style={{ background: 'var(--carbon)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '10px' }}>NOMBRE / EMPRESA</th>
                    <th style={{ padding: '10px' }}>CONTACTO</th>
                    <th style={{ padding: '10px' }}>CIUDAD</th>
                    <th style={{ padding: '10px' }}>COTIZACIONES</th>
                    <th style={{ padding: '10px' }}>OBSERVACIONES</th>
                    <th style={{ padding: '10px' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {clients
                    .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase()))
                    .map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '14px 10px' }}>
                          <div style={{ fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>{c.company || 'Particular'}</div>
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <div>{c.email}</div>
                          <div style={{ fontSize: '0.78rem', opacity: 0.6 }}>{c.phone || '-'}</div>
                        </td>
                        <td style={{ padding: '14px 10px' }}>{c.city || '-'}</td>
                        <td style={{ padding: '14px 10px', fontFamily: 'var(--font-mono)' }}>
                          {c.quotes_count || 0} cotizaciones
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '0.8rem', opacity: 0.8 }}>
                          {c.notes || 'Sin notas'}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <button
                            onClick={() => { setClientForm(c); setNewClientModal(true); }}
                            style={{ background: 'none', border: 'none', color: 'var(--yellow)', cursor: 'pointer' }}
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Client Modal */}
            {newClientModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 1000
              }}>
                <div style={{ background: 'var(--carbon)', border: '2px solid var(--yellow)', padding: '36px', maxWidth: '550px', width: '100%' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '20px' }}>
                    {clientForm.id ? 'EDITAR CLIENTE' : 'REGISTRAR CLIENTE'}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>NOMBRE COMPLETO *</label>
                      <input
                        type="text"
                        value={clientForm.name}
                        onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>EMPRESA</label>
                      <input
                        type="text"
                        value={clientForm.company}
                        onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>CORREO ELECTRÓNICO *</label>
                      <input
                        type="email"
                        value={clientForm.email}
                        onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>TELÉFONO O WHATSAPP</label>
                      <input
                        type="tel"
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>OBSERVACIONES / REQUERIMIENTOS ESPECIALES</label>
                      <textarea
                        rows={3}
                        value={clientForm.notes || ''}
                        onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => setNewClientModal(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', cursor: 'pointer' }}>
                      CANCELAR
                    </button>
                    <button onClick={saveClient} style={{ background: 'var(--yellow)', color: 'var(--carbon)', border: 'none', padding: '10px 22px', fontWeight: 900, cursor: 'pointer' }}>
                      GUARDAR CLIENTE
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 7: CAMPAÑAS Y EVENTOS
        ------------------------------------------------------------- */}
        {activeTab === 'campanas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
                Planificación operativa de campañas promocionales, ferias y eventos con asignación de personal en terreno.
              </div>
              <button
                onClick={() => {
                  setCampaignForm({
                    title: '',
                    type: 'activacion',
                    client_name: '',
                    city: 'Antofagasta',
                    venue: '',
                    start_date: new Date().toISOString().split('T')[0],
                    status: 'planificacion',
                    budget: 0,
                    staffAssigned: [],
                    requirements: ''
                  });
                  setCampaignModal(true);
                }}
                style={{
                  background: 'var(--yellow)',
                  color: 'var(--carbon)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  padding: '12px 20px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} strokeWidth={3} />
                <span>NUEVA CAMPAÑA / EVENTO</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {campaigns.map(cmp => (
                <div key={cmp.id} style={{
                  background: 'var(--carbon)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        background: 'var(--magenta)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 8px',
                        textTransform: 'uppercase'
                      }}>
                        {cmp.type}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--yellow)' }}>
                        {cmp.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 6px', color: 'var(--warm-white)' }}>
                      {cmp.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                      📍 {cmp.city} {cmp.venue && `— ${cmp.venue}`}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.8)' }}>
                      📅 Fecha: {cmp.start_date} {cmp.end_date && `al ${cmp.end_date}`}
                    </div>

                    {cmp.requirements && (
                      <p style={{ fontSize: '0.8rem', background: '#111', padding: '10px', marginTop: '10px', color: 'rgba(255,255,255,0.8)' }}>
                        {cmp.requirements}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--yellow)', fontSize: '0.9rem' }}>
                      Ppto: ${cmp.budget ? cmp.budget.toLocaleString('es-CL') : '0'}
                    </div>
                    <button
                      onClick={() => { setCampaignForm(cmp); setCampaignModal(true); }}
                      style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Campaign Modal */}
            {campaignModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 1000
              }}>
                <div style={{ background: 'var(--carbon)', border: '2px solid var(--magenta)', padding: '36px', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '20px' }}>
                    {campaignForm.id ? 'EDITAR CAMPAÑA / EVENTO' : 'NUEVA CAMPAÑA O EVENTO'}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>TÍTULO *</label>
                      <input
                        type="text"
                        value={campaignForm.title}
                        onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>TIPO</label>
                      <select
                        value={campaignForm.type}
                        onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value as any })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      >
                        <option value="activacion">Activación BTL</option>
                        <option value="campaña">Campaña Publicitaria</option>
                        <option value="evento_corporativo">Evento Corporativo</option>
                        <option value="evento_privado">Evento Privado</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>CIUDAD</label>
                      <input
                        type="text"
                        value={campaignForm.city}
                        onChange={(e) => setCampaignForm({ ...campaignForm, city: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>LOCACIÓN / VENUE</label>
                      <input
                        type="text"
                        value={campaignForm.venue || ''}
                        onChange={(e) => setCampaignForm({ ...campaignForm, venue: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>FECHA INICIO</label>
                      <input
                        type="date"
                        value={campaignForm.start_date}
                        onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>ESTADO OPERATIVO</label>
                      <select
                        value={campaignForm.status}
                        onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value as any })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      >
                        <option value="planificacion">Planificación</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>REQUERIMIENTOS Y PERSONAL ASIGNADO</label>
                    <textarea
                      rows={3}
                      value={campaignForm.requirements || ''}
                      onChange={(e) => setCampaignForm({ ...campaignForm, requirements: e.target.value })}
                      placeholder="Ej. 4 promotoras, 1 anfitrión, sistema de sonido y supervisor de terreno."
                      style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => setCampaignModal(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', cursor: 'pointer' }}>
                      CANCELAR
                    </button>
                    <button onClick={saveCampaign} style={{ background: 'var(--magenta)', color: '#fff', border: 'none', padding: '10px 22px', fontWeight: 900, cursor: 'pointer' }}>
                      GUARDAR
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 8: USUARIOS Y PERMISOS (Solo Administradores)
        ------------------------------------------------------------- */}
        {activeTab === 'usuarios' && user.role === 'admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
                Control de administradores y editores con contraseñas encriptadas con bcrypt.
              </div>
              <button
                onClick={() => setNewUserModal(true)}
                style={{
                  background: 'var(--yellow)',
                  color: 'var(--carbon)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  padding: '12px 20px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} strokeWidth={3} />
                <span>NUEVO USUARIO</span>
              </button>
            </div>

            <div style={{ background: 'var(--carbon)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>NOMBRE</th>
                    <th style={{ padding: '10px' }}>EMAIL</th>
                    <th style={{ padding: '10px' }}>ROL</th>
                    <th style={{ padding: '10px' }}>ESTADO</th>
                    <th style={{ padding: '10px' }}>FECHA ALTA</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>{u.id}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>{u.name}</td>
                      <td style={{ padding: '12px 10px' }}>{u.email}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          background: u.role === 'admin' ? 'var(--magenta)' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: u.status === 'active' ? '#25D366' : 'var(--orange)' }}>
                        {u.status}
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '0.8rem', opacity: 0.6 }}>
                        {new Date(u.created_at).toLocaleDateString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Modal */}
            {newUserModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 1000
              }}>
                <div style={{ background: 'var(--carbon)', border: '2px solid var(--yellow)', padding: '36px', maxWidth: '480px', width: '100%' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '20px' }}>
                    CREAR USUARIO ADMINISTRATIVO
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>NOMBRE</label>
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>EMAIL</label>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>CONTRASEÑA INICIAL</label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>ROL</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', color: '#fff' }}
                      >
                        <option value="admin">Administrador (Total)</option>
                        <option value="editor">Editor de Contenido</option>
                        <option value="commercial">Ejecutivo Comercial</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={() => setNewUserModal(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', cursor: 'pointer' }}>
                      CANCELAR
                    </button>
                    <button onClick={saveUser} style={{ background: 'var(--yellow)', color: 'var(--carbon)', border: 'none', padding: '10px 22px', fontWeight: 900, cursor: 'pointer' }}>
                      CREAR USUARIO
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
