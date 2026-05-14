import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

// ── Modal contacto ───────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const EMPTY_CONTACTO = { nombre: '', cargo: '', area: '', correo: '', telefono: '', celular: '', contacto_principal: false };

const inputCls2 = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls2 = 'block text-xs font-medium text-gray-600 mb-1';

const EMPTY_CLIENTE = {
  ruc: '', razon_social: '', nombre_comercial: '',
  direccion: '', telefono: '', web: '', estado_cliente: 'prospecto',
};

const ClienteEditForm = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState(initial || EMPTY_CLIENTE);
  const [sunatLoading, setSunatLoading] = useState(false);
  const sunatTimeout = useRef(null);
  useEffect(() => { if (initial) setForm(initial); }, [initial]);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleRucChange = (value) => {
    set('ruc', value);
    if (sunatTimeout.current) clearTimeout(sunatTimeout.current);
    if (value.length === 11 && /^\d{11}$/.test(value)) {
      sunatTimeout.current = setTimeout(async () => {
        setSunatLoading(true);
        try {
          const { data } = await axios.get(`/sunat/ruc/${value}`);
          setForm((prev) => ({
            ...prev,
            razon_social:     data.razon_social     || prev.razon_social,
            nombre_comercial: data.nombre_comercial || prev.nombre_comercial,
            direccion:        data.direccion        || prev.direccion,
          }));
          toast.success('Datos actualizados desde SUNAT');
        } catch { /* manual */ } finally { setSunatLoading(false); }
      }, 600);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls2}>RUC *</label>
          <div className="relative">
            <input className={inputCls2} value={form.ruc} onChange={(e) => handleRucChange(e.target.value.replace(/\D/g,''))} maxLength={11} required />
            {sunatLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
          </div>
        </div>
        <div>
          <label className={labelCls2}>Teléfono</label>
          <input className={inputCls2} value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls2}>Razón social *</label>
        <input className={inputCls2} value={form.razon_social} onChange={(e) => set('razon_social', e.target.value)} required />
      </div>
      <div>
        <label className={labelCls2}>Nombre comercial</label>
        <input className={inputCls2} value={form.nombre_comercial} onChange={(e) => set('nombre_comercial', e.target.value)} />
      </div>
      <div>
        <label className={labelCls2}>Dirección</label>
        <input className={inputCls2} value={form.direccion} onChange={(e) => set('direccion', e.target.value)} />
      </div>
      <div>
        <label className={labelCls2}>Estado comercial</label>
        <select className={inputCls2} value={form.estado_cliente} onChange={(e) => set('estado_cliente', e.target.value)}>
          <option value="prospecto">Prospecto</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>
      <div>
        <label className={labelCls2}>Sitio web</label>
        <input className={inputCls2} value={form.web} onChange={(e) => set('web', e.target.value)} placeholder="www.empresa.com" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 mt-1">
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
};

const ContactoForm = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState(initial || EMPTY_CONTACTO);
  useEffect(() => { if (initial) setForm(initial); }, [initial]);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <div>
        <label className={labelCls}>Nombre completo *</label>
        <input className={inputCls} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Cargo</label>
          <input className={inputCls} value={form.cargo} onChange={(e) => set('cargo', e.target.value)} placeholder="Gerente General" />
        </div>
        <div>
          <label className={labelCls}>Área</label>
          <input className={inputCls} value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="Logística" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Correo</label>
        <input type="email" className={inputCls} value={form.correo} onChange={(e) => set('correo', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Celular</label>
          <input className={inputCls} value={form.celular} onChange={(e) => set('celular', e.target.value)} placeholder="9XXXXXXXX" />
        </div>
        <div>
          <label className={labelCls}>Teléfono fijo</label>
          <input className={inputCls} value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input type="checkbox" checked={form.contacto_principal} onChange={(e) => set('contacto_principal', e.target.checked)} className="rounded" />
        Contacto principal
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 mt-1"
      >
        {loading ? 'Guardando...' : 'Guardar contacto'}
      </button>
    </form>
  );
};

// ── Tabs ──────────────────────────────────────────────────────
const TABS = ['Contactos', 'Cotizaciones', 'Órdenes', 'Facturas', 'Actividades'];

const EstadoBadge = ({ estado }) => {
  const map = {
    borrador:   'bg-gray-100 text-gray-600',
    enviado:    'bg-blue-100 text-blue-700',
    aprobado:   'bg-green-100 text-green-700',
    rechazado:  'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[estado] || 'bg-gray-100 text-gray-500'}`}>
      {estado}
    </span>
  );
};

const fmt = (n) => n ? `S/ ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-PE') : '—';

// ── Página ────────────────────────────────────────────────────
const ClienteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cliente, setCliente] = useState(null);
  const [ejecutivos, setEjecutivos] = useState([]);
  const [ejecutivoAsignado, setEjecutivoAsignado] = useState('');
  const [tab, setTab] = useState('Contactos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalContacto, setModalContacto] = useState(false);
  const [editContacto, setEditContacto] = useState(null);
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [modalAsignarEjecutivo, setModalAsignarEjecutivo] = useState(false);

  const cargar = async () => {
    try {
      const [resCliente, resEjs] = await Promise.all([
        axios.get(`/clientes/${id}/historial`),
        user.rol === 'admin' ? axios.get('/ejecutivos') : Promise.resolve({ data: [] }),
      ]);
      setCliente(resCliente.data);
      setEjecutivos(resEjs.data || []);
      setEjecutivoAsignado(String(resCliente.data?.ejecutivo_id || ''));
    } catch {
      toast.error('Error al cargar cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [id, user.rol]);

  const handleCrearContacto = async (form) => {
    setSaving(true);
    try {
      await axios.post(`/clientes/${id}/contactos`, form);
      toast.success('Contacto agregado');
      setModalContacto(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditarCliente = async (form) => {
    setSaving(true);
    try {
      await axios.put(`/clientes/${id}`, form);
      toast.success('Cliente actualizado');
      setModalEditarCliente(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditarContacto = async (form) => {
    setSaving(true);
    try {
      await axios.put(`/contactos/${editContacto.id}`, form);
      toast.success('Contacto actualizado');
      setEditContacto(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleAsignarEjecutivo = async (e) => {
    e.preventDefault();
    if (!ejecutivoAsignado) {
      toast.error('Selecciona un ejecutivo');
      return;
    }
    setSaving(true);
    try {
      await axios.patch(`/clientes/${id}/asignar-ejecutivo`, { ejecutivo_id: ejecutivoAsignado });
      toast.success('Cliente reasignado correctamente');
      setModalAsignarEjecutivo(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo reasignar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Cargando...</div>;
  if (!cliente) return null;

  const contactos   = cliente.contactos   || [];
  const cotizaciones = cliente.cotizaciones || [];
  const ordenes      = cliente.ordenes      || [];
  const facturas     = cliente.facturas     || [];
  const actividades  = cliente.actividades  || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={() => navigate('/clientes')}
          className="mt-1 w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 transition shrink-0"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >←</button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0"
              style={{ background: '#1e3a5f' }}
            >
              {cliente.razon_social?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{cliente.razon_social}</h2>
              <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-400">
                <span>RUC: <strong className="text-gray-600 font-mono">{cliente.ruc}</strong></span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    cliente.estado_cliente === 'cliente'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {cliente.estado_cliente || 'prospecto'}
                </span>
                {cliente.telefono && <span>· {cliente.telefono}</span>}
                {cliente.ejecutivo && (
                  <span className="text-blue-600 font-medium">
                    · Ejec: {cliente.ejecutivo.nombre} {cliente.ejecutivo.apellido}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {user.rol === 'admin' && (
            <button
              onClick={() => setModalAsignarEjecutivo(true)}
              className="px-4 py-2 border border-blue-200 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-50 transition"
            >
              Reasignar ejecutivo
            </button>
          )}
          <button
            onClick={() => setModalEditarCliente(true)}
            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            Editar
          </button>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Contactos',     value: contactos.length,    color: '#3b82f6' },
          { label: 'Cotizaciones',  value: cotizaciones.length, color: '#f59e0b' },
          { label: 'Órdenes',       value: ordenes.length,      color: '#10b981' },
          { label: 'Facturas',      value: facturas.length,     color: '#8b5cf6' },
          { label: 'Actividades',   value: actividades.length,  color: '#ef4444' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-4 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderTop: `3px solid ${k.color}` }}>
            <p className="text-2xl font-bold text-gray-800">{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div className="flex border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${tab === t ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Contactos ── */}
          {tab === 'Contactos' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-gray-700">Personas de contacto en la empresa</p>
                <button
                  onClick={() => setModalContacto(true)}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                >
                  <span>+</span> Agregar contacto
                </button>
              </div>
              {contactos.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">Sin contactos registrados</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contactos.map((c) => (
                    <div key={c.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800 text-sm">{c.nombre}</p>
                            {c.contacto_principal && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Principal</span>
                            )}
                          </div>
                          {c.cargo && <p className="text-xs text-gray-500 mt-0.5">{c.cargo} {c.area ? `· ${c.area}` : ''}</p>}
                          {c.correo && <p className="text-xs text-blue-500 mt-1">{c.correo}</p>}
                          {c.celular && <p className="text-xs text-gray-400">{c.celular}</p>}
                        </div>
                        <button
                          onClick={() => setEditContacto({ ...c })}
                          className="text-xs text-gray-400 hover:text-blue-600 shrink-0"
                        >Editar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Cotizaciones ── */}
          {tab === 'Cotizaciones' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-gray-700">Cotizaciones enviadas al cliente</p>
                <button
                  onClick={() => navigate(`/cotizaciones/nueva?cliente=${id}`)}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                >
                  <span>+</span> Nueva cotización
                </button>
              </div>
              {cotizaciones.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">Sin cotizaciones</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-2 font-medium">Número</th>
                    <th className="text-left py-2 font-medium">Fecha</th>
                    <th className="text-left py-2 font-medium">Monto</th>
                    <th className="text-left py-2 font-medium">Estado</th>
                    <th></th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {cotizaciones.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-mono text-xs text-gray-700">{c.numero}</td>
                        <td className="py-3 text-gray-500">{fmtDate(c.fecha)}</td>
                        <td className="py-3 font-semibold text-gray-800">{fmt(c.monto)}</td>
                        <td className="py-3"><EstadoBadge estado={c.estado} /></td>
                        <td className="py-3 text-right">
                          <button onClick={() => navigate(`/cotizaciones/${c.id}`)} className="text-xs text-blue-600 hover:underline">Ver</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Órdenes ── */}
          {tab === 'Órdenes' && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-4">Órdenes de compra recibidas</p>
              {ordenes.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">Sin órdenes</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-2 font-medium">N° Orden</th>
                    <th className="text-left py-2 font-medium">Fecha</th>
                    <th className="text-left py-2 font-medium">Monto</th>
                    <th></th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {ordenes.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-mono text-xs text-gray-700">{o.numero_orden}</td>
                        <td className="py-3 text-gray-500">{fmtDate(o.fecha)}</td>
                        <td className="py-3 font-semibold text-gray-800">{fmt(o.monto)}</td>
                        <td className="py-3 text-right">
                          <button onClick={() => navigate(`/ordenes/${o.id}`)} className="text-xs text-blue-600 hover:underline">Ver</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Facturas ── */}
          {tab === 'Facturas' && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-4">Facturas emitidas al cliente</p>
              {facturas.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">Sin facturas</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-2 font-medium">N° Factura</th>
                    <th className="text-left py-2 font-medium">Fecha</th>
                    <th className="text-left py-2 font-medium">Subtotal</th>
                    <th className="text-left py-2 font-medium">IGV</th>
                    <th className="text-left py-2 font-medium">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {facturas.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-mono text-xs text-gray-700">{f.numero_factura}</td>
                        <td className="py-3 text-gray-500">{fmtDate(f.fecha)}</td>
                        <td className="py-3 text-gray-600">{fmt(f.subtotal)}</td>
                        <td className="py-3 text-gray-600">{fmt(f.igv)}</td>
                        <td className="py-3 font-bold text-gray-800">{fmt(f.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Actividades ── */}
          {tab === 'Actividades' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-gray-700">Historial de interacciones</p>
                <button
                  onClick={() => navigate(`/actividades/nueva?cliente=${id}`)}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                >
                  <span>+</span> Registrar actividad
                </button>
              </div>
              {actividades.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">Sin actividades registradas</p>
              ) : (
                <div className="space-y-3">
                  {actividades.map((a) => {
                    const tipoIcon = { llamada: '📞', reunion: '🤝', visita: '🚗', seguimiento: '📋', email: '📧' };
                    return (
                      <div key={a.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-100 transition">
                        <span className="text-xl shrink-0">{tipoIcon[a.tipo] || '📌'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">{a.asunto || a.tipo}</p>
                            <span className="text-xs text-gray-400">{fmtDate(a.fecha)}</span>
                          </div>
                          {a.descripcion && <p className="text-xs text-gray-500 mt-0.5 truncate">{a.descripcion}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal nuevo contacto */}
      <Modal open={modalContacto} onClose={() => setModalContacto(false)} title="Agregar contacto">
        <ContactoForm onSubmit={handleCrearContacto} loading={saving} />
      </Modal>

      {/* Modal editar contacto */}
      <Modal open={!!editContacto} onClose={() => setEditContacto(null)} title="Editar contacto">
        {editContacto && (
          <ContactoForm initial={editContacto} onSubmit={handleEditarContacto} loading={saving} />
        )}
      </Modal>

      {/* Modal editar cliente */}
      <Modal open={modalEditarCliente} onClose={() => setModalEditarCliente(false)} title="Editar cliente">
        {cliente && (
          <ClienteEditForm
            initial={{
              ruc: cliente.ruc || '',
              razon_social: cliente.razon_social || '',
              nombre_comercial: cliente.nombre_comercial || '',
              direccion: cliente.direccion || '',
              telefono: cliente.telefono || '',
              web: cliente.web || '',
              estado_cliente: cliente.estado_cliente || 'prospecto',
            }}
            onSubmit={handleEditarCliente}
            loading={saving}
          />
        )}
      </Modal>

      {/* Modal reasignar ejecutivo */}
      <Modal open={modalAsignarEjecutivo} onClose={() => setModalAsignarEjecutivo(false)} title="Reasignar ejecutivo">
        <form onSubmit={handleAsignarEjecutivo} className="space-y-3">
          <div>
            <label className={labelCls2}>Ejecutivo *</label>
            <select
              className={inputCls2}
              value={ejecutivoAsignado}
              onChange={(e) => setEjecutivoAsignado(e.target.value)}
              required
            >
              <option value="">— Seleccionar ejecutivo —</option>
              {ejecutivos.map((ej) => (
                <option key={ej.id} value={ej.id}>
                  {ej.nombre} {ej.apellido}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
          >
            {saving ? 'Reasignando...' : 'Guardar asignación'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ClienteDetailPage;
