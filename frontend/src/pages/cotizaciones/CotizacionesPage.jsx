import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

const ESTADOS = ['borrador', 'enviado', 'aprobado', 'rechazado'];

const EstadoBadge = ({ estado }) => {
  const map = {
    borrador:  'bg-gray-100 text-gray-600',
    enviado:   'bg-blue-100 text-blue-700',
    aprobado:  'bg-green-100 text-green-700',
    rechazado: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[estado] || 'bg-gray-100 text-gray-500'}`}>
      {estado}
    </span>
  );
};

const fmt = (n, moneda = 'PEN') => {
  if (n == null) return '—';
  const symbol = moneda === 'USD' ? '$' : 'S/';
  return `${symbol} ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
};
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-PE') : '—';

// ── Modal nueva cotización ────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
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

const NuevaCotizacionForm = ({ clientes, onSubmit, loading, clientePresel }) => {
  const hoy = new Date().toISOString().split('T')[0];
  const venc = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [form, setForm] = useState({
    cliente_id: clientePresel || '',
    fecha: hoy,
    fecha_vencimiento: venc,
    tipo: 'venta',
    moneda: 'PEN',
    observaciones: '',
    archivo_propuesta_pdf: null,
  });
  const [contactos, setContactos] = useState([]);

  useEffect(() => {
    if (clientePresel) setForm((p) => ({ ...p, cliente_id: clientePresel }));
  }, [clientePresel]);

  useEffect(() => {
    if (!form.cliente_id) { setContactos([]); return; }
    axios.get(`/clientes/${form.cliente_id}/contactos`).then(({ data }) => setContactos(data)).catch(() => setContactos([]));
  }, [form.cliente_id]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className={labelCls}>Cliente *</label>
        <select className={inputCls} value={form.cliente_id} onChange={(e) => set('cliente_id', e.target.value)} required>
          <option value="">— Seleccionar cliente —</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Contacto</label>
        <select className={inputCls} value={form.contacto_id || ''} onChange={(e) => set('contacto_id', e.target.value)} disabled={contactos.length === 0}>
          <option value="">{contactos.length === 0 ? '— Sin contactos —' : '— Seleccionar contacto —'}</option>
          {contactos.map((c) => <option key={c.id} value={c.id}>{c.nombre} {c.cargo ? `· ${c.cargo}` : ''}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Fecha *</label>
          <input type="date" className={inputCls} value={form.fecha} onChange={(e) => set('fecha', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Vencimiento</label>
          <input type="date" className={inputCls} value={form.fecha_vencimiento} onChange={(e) => set('fecha_vencimiento', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Tipo *</label>
        <select className={inputCls} value={form.tipo} onChange={(e) => set('tipo', e.target.value)} required>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Moneda *</label>
        <select className={inputCls} value={form.moneda} onChange={(e) => set('moneda', e.target.value)} required>
          <option value="PEN">Soles (PEN)</option>
          <option value="USD">Dólares (USD)</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Observaciones</label>
        <textarea className={inputCls} rows={3} value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} placeholder="Condiciones, notas adicionales..." />
      </div>
      <div>
        <label className={labelCls}>Propuesta económica (PDF)</label>
        <input
          type="file"
          accept="application/pdf,.pdf"
          className={inputCls}
          onChange={(e) => set('archivo_propuesta_pdf', e.target.files?.[0] || null)}
        />
        <p className="text-[11px] text-gray-400 mt-1">Opcional. Se adjunta como archivo adicional de la cotización.</p>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md shadow-blue-200 transition disabled:opacity-60">
        {loading ? 'Creando...' : 'Crear cotización'}
      </button>
    </form>
  );
};

// ── Página principal ──────────────────────────────────────────
const CotizacionesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [modalCrear, setModalCrear] = useState(!!searchParams.get('cliente'));
  const [modalEliminar, setModalEliminar] = useState(null);

  const clientePresel = searchParams.get('cliente');

  const cargar = async () => {
    try {
      const [resCot, resCli] = await Promise.all([
        axios.get('/cotizaciones'),
        axios.get('/clientes'),
      ]);
      setCotizaciones(resCot.data);
      setClientes(resCli.data);
    } catch {
      toast.error('Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => { setPage(1); }, [busqueda, filtroEstado]);

  const handleEliminar = async () => {
    try {
      await axios.delete(`/cotizaciones/${modalEliminar.id}`);
      toast.success('Cotización eliminada');
      setModalEliminar(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar cotización');
    }
  };

  const handleCrear = async (form) => {
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('cliente_id', form.cliente_id);
      if (form.contacto_id) payload.append('contacto_id', form.contacto_id);
      payload.append('fecha', form.fecha);
      if (form.fecha_vencimiento) payload.append('fecha_vencimiento', form.fecha_vencimiento);
      payload.append('tipo', form.tipo);
      payload.append('moneda', form.moneda || 'PEN');
      if (form.observaciones) payload.append('observaciones', form.observaciones);
      if (form.archivo_propuesta_pdf) payload.append('archivo_propuesta_pdf', form.archivo_propuesta_pdf);

      const { data } = await axios.post('/cotizaciones', payload);
      toast.success(`Cotización ${data.numero} creada`);
      setModalCrear(false);
      navigate(`/cotizaciones/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear cotización');
    } finally {
      setSaving(false);
    }
  };

  const filtradas = cotizaciones.filter((c) => {
    const q = busqueda.toLowerCase();
    const matchQ = (
      c.numero?.toLowerCase().includes(q) ||
      c.cliente?.razon_social?.toLowerCase().includes(q)
    );
    const matchE = !filtroEstado || c.estado === filtroEstado;
    return matchQ && matchE;
  });
  const totalPages = Math.max(1, Math.ceil(filtradas.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginadas = filtradas.slice((page - 1) * pageSize, page * pageSize);

  // Totales por estado
  const totales = ESTADOS.reduce((acc, e) => {
    acc[e] = cotizaciones.filter((c) => c.estado === e).length;
    return acc;
  }, {});

  const estadoColor = { borrador: '#6b7280', enviado: '#3b82f6', aprobado: '#10b981', rechazado: '#ef4444' };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cotizaciones</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {user.rol === 'admin' ? 'Todas las cotizaciones' : 'Mis cotizaciones'}
          </p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition"
        >
          <span className="text-lg leading-none">+</span>
          Nueva cotización
        </button>
      </div>

      {/* KPIs por estado */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltroEstado(filtroEstado === e ? '' : e)}
            className={`bg-white rounded-xl p-4 text-center transition hover:shadow-md ${filtroEstado === e ? 'ring-2 ring-offset-1' : ''}`}
            style={{
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              borderTop: `3px solid ${estadoColor[e]}`,
              ringColor: estadoColor[e],
            }}
          >
            <p className="text-2xl font-bold text-gray-800">{totales[e]}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{e}</p>
          </button>
        ))}
      </div>

      {/* Buscador + filtro */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e} className="capitalize">{e}</option>)}
        </select>
        {filtroEstado && (
          <button onClick={() => setFiltroEstado('')} className="px-3 py-2 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
            × Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-3">📋</span>
            <p className="text-sm">{busqueda || filtroEstado ? 'Sin resultados' : 'No hay cotizaciones aún'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Número</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vence</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                {user.rol === 'admin' && <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ejecutivo</th>}
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginadas.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700">{c.numero}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800 text-sm">{c.cliente?.razon_social}</p>
                    {c.contacto && <p className="text-xs text-gray-400">{c.contacto.nombre}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{fmtDate(c.fecha)}</td>
                  <td className="px-6 py-4 text-xs">
                    {c.fecha_vencimiento ? (
                      <span className={new Date(c.fecha_vencimiento) < new Date() && c.estado === 'enviado' ? 'text-red-500 font-medium' : 'text-gray-400'}>
                        {fmtDate(c.fecha_vencimiento)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-800">{fmt(c.monto, c.moneda)}</td>
                  <td className="px-6 py-4"><EstadoBadge estado={c.estado} /></td>
                  {user.rol === 'admin' && <td className="px-6 py-4 text-xs text-gray-500">{c.ejecutivo?.nombre}</td>}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/cotizaciones/${c.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition"
                      >
                        Ver detalle
                      </button>
                      {user.rol === 'admin' && (
                        <button
                          onClick={() => setModalEliminar(c)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtradas.length > 0 && (
        <Pagination page={page} pageSize={pageSize} total={filtradas.length} onChange={setPage} />
      )}

      {/* Modal Eliminar */}
      <Modal open={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar cotización">
        {modalEliminar && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Eliminar la cotización <strong>{modalEliminar.numero}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModalEliminar(null)} className="text-sm px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition">Cancelar</button>
              <button onClick={handleEliminar} className="text-sm px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition">Eliminar</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal */}
      <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Nueva cotización">
        <NuevaCotizacionForm
          clientes={clientes}
          onSubmit={handleCrear}
          loading={saving}
          clientePresel={clientePresel}
        />
      </Modal>
    </div>
  );
};

export default CotizacionesPage;
