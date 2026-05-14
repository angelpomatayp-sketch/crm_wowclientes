import { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const fmtDate = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('es-PE') : '-');
const fmtMoney = (n) => (n != null ? `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-');
const getArchivoUrl = (url) => {
  if (!url) return '';
  return url;
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const OrdenesPage = () => {
  const { user } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [cotizacionesAprobadas, setCotizacionesAprobadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalNueva, setModalNueva] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [form, setForm] = useState({
    cotizacion_id: '',
    numero_orden: '',
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    observaciones: '',
    archivo_orden: null,
  });

  const cargar = async () => {
    try {
      const [resOrdenes, resAprobadas] = await Promise.all([
        axios.get('/ordenes'),
        axios.get('/ordenes/cotizaciones-aprobadas'),
      ]);
      setOrdenes(resOrdenes.data);
      setCotizacionesAprobadas(resAprobadas.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => { setPage(1); }, [busqueda]);

  const cotizacionSeleccionada = useMemo(
    () => cotizacionesAprobadas.find((c) => String(c.id) === String(form.cotizacion_id)),
    [cotizacionesAprobadas, form.cotizacion_id]
  );

  useEffect(() => {
    if (cotizacionSeleccionada && !form.monto) {
      setForm((prev) => ({ ...prev, monto: cotizacionSeleccionada.monto || '' }));
    }
  }, [cotizacionSeleccionada]);

  const handleEliminar = async () => {
    try {
      await axios.delete(`/ordenes/${modalEliminar.id}`);
      toast.success('Orden eliminada');
      setModalEliminar(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar orden');
    }
  };

  const abrirModalNueva = () => {
    setForm({
      cotizacion_id: '',
      numero_orden: '',
      fecha: new Date().toISOString().split('T')[0],
      monto: '',
      observaciones: '',
      archivo_orden: null,
    });
    setModalNueva(true);
  };

  const crearOrden = async (e) => {
    e.preventDefault();
    if (!form.archivo_orden) {
      toast.error('Debes adjuntar el PDF de la orden/servicio');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('cotizacion_id', form.cotizacion_id);
      payload.append('numero_orden', form.numero_orden);
      payload.append('fecha', form.fecha);
      payload.append('monto', form.monto || '');
      payload.append('observaciones', form.observaciones || '');
      payload.append('archivo_orden', form.archivo_orden);

      await axios.post('/ordenes', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Orden registrada');
      setModalNueva(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo registrar la orden');
    } finally {
      setSaving(false);
    }
  };

  const filtradas = ordenes.filter((o) => {
    const q = busqueda.toLowerCase();
    return (
      o.numero_orden?.toLowerCase().includes(q) ||
      o.cliente?.razon_social?.toLowerCase().includes(q) ||
      o.cotizacion?.numero?.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtradas.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginadas = filtradas.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Órdenes de Servicio / Compra</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Registra las órdenes recibidas del cliente. Solo cotizaciones aprobadas.
          </p>
        </div>
        <button
          onClick={abrirModalNueva}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition"
        >
          <span className="text-lg leading-none">+</span>
          Cargar orden recibida
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700">
        Pendientes de registrar: <strong>{cotizacionesAprobadas.length}</strong> cotización(es) aprobadas sin orden.
      </div>

      <div className="relative mb-5 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por orden, cliente o cotización..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-3">📥</span>
            <p className="text-sm">No hay órdenes registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Orden</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cotización</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                {user?.rol === 'admin' && (
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ejecutivo</th>
                )}
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Archivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginadas.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700">{o.numero_orden}</td>
                  <td className="px-6 py-4 text-gray-600">{o.cotizacion?.numero || '-'}</td>
                  <td className="px-6 py-4 text-gray-800">{o.cliente?.razon_social || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{fmtDate(o.fecha)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-800">{fmtMoney(o.monto)}</td>
                  {user?.rol === 'admin' && (
                    <td className="px-6 py-4 text-gray-600">
                      {[o.ejecutivo?.nombre, o.ejecutivo?.apellido].filter(Boolean).join(' ') || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {o.archivo_orden ? (
                        <a
                          href={getArchivoUrl(o.archivo_orden)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition"
                        >
                          Ver PDF
                        </a>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                      {user?.rol === 'admin' && (
                        <button
                          onClick={() => setModalEliminar(o)}
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

      <Modal open={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar orden">
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminar la orden <strong>{modalEliminar?.numero_orden}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setModalEliminar(null)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={handleEliminar} className="px-4 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition">
            Eliminar
          </button>
        </div>
      </Modal>

      <Modal open={modalNueva} onClose={() => setModalNueva(false)} title="Cargar orden recibida del cliente">
        <form onSubmit={crearOrden} className="space-y-4">
          <div>
            <label className={labelCls}>Cotización aprobada *</label>
            <select
              className={inputCls}
              value={form.cotizacion_id}
              onChange={(e) => setForm((p) => ({ ...p, cotizacion_id: e.target.value, monto: '' }))}
              required
            >
              <option value="">— Seleccionar —</option>
              {cotizacionesAprobadas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero} · {c.cliente?.razon_social}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>N° Orden/Servicio cliente *</label>
              <input
                className={inputCls}
                value={form.numero_orden}
                onChange={(e) => setForm((p) => ({ ...p, numero_orden: e.target.value }))}
                required
                placeholder="OS-2026-00124"
              />
            </div>
            <div>
              <label className={labelCls}>Fecha recepción *</label>
              <input
                type="date"
                className={inputCls}
                value={form.fecha}
                onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Monto</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputCls}
              value={form.monto}
              onChange={(e) => setForm((p) => ({ ...p, monto: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={labelCls}>PDF de orden/servicio recibido *</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setForm((p) => ({ ...p, archivo_orden: e.target.files?.[0] || null }))}
              required
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <p className="text-xs text-gray-400 mt-1">Solo PDF. Máximo 10MB.</p>
          </div>

          <div>
            <label className={labelCls}>Observaciones</label>
            <textarea
              rows={3}
              className={inputCls}
              value={form.observaciones}
              onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
              placeholder="Recibida por correo el ..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Registrar orden'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default OrdenesPage;
