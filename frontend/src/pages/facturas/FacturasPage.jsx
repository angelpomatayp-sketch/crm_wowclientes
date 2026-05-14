import { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const fmtDate = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('es-PE') : '-');
const fmtMoney = (n, moneda = 'PEN') => {
  if (n == null) return '-';
  const num = Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2 });
  return moneda === 'USD' ? `$ ${num}` : `S/ ${num}`;
};
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

const FacturasPage = () => {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [ordenesFacturables, setOrdenesFacturables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalNueva, setModalNueva] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [form, setForm] = useState({
    orden_id: '',
    numero_factura: '',
    fecha: new Date().toISOString().split('T')[0],
    subtotal: '',
    moneda: 'PEN',
    archivo_pdf: null,
    archivo_xml: null,
  });

  const cargar = async () => {
    try {
      const [resFacturas, resFacturables] = await Promise.all([
        axios.get('/facturas'),
        axios.get('/facturas/ordenes-facturables'),
      ]);
      setFacturas(resFacturas.data);
      setOrdenesFacturables(resFacturables.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => { setPage(1); }, [busqueda]);

  const ordenSeleccionada = useMemo(
    () => ordenesFacturables.find((o) => String(o.id) === String(form.orden_id)),
    [ordenesFacturables, form.orden_id]
  );

  useEffect(() => {
    if (ordenSeleccionada && !form.subtotal) {
      const monto = Number(ordenSeleccionada.monto || 0);
      const subtotal = +(monto / 1.18).toFixed(2);
      setForm((prev) => ({ ...prev, subtotal: subtotal > 0 ? subtotal : '' }));
    }
  }, [ordenSeleccionada]);

  const handleEliminar = async () => {
    try {
      await axios.delete(`/facturas/${modalEliminar.id}`);
      toast.success('Factura eliminada');
      setModalEliminar(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar factura');
    }
  };

  const abrirModalNueva = () => {
    setForm({
      orden_id: '',
      numero_factura: '',
      fecha: new Date().toISOString().split('T')[0],
      subtotal: '',
      moneda: 'PEN',
      archivo_pdf: null,
      archivo_xml: null,
    });
    setModalNueva(true);
  };

  const registrarFactura = async (e) => {
    e.preventDefault();
    if (!form.archivo_pdf) {
      toast.error('Debes adjuntar el PDF emitido en SUNAT');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('orden_id', form.orden_id);
      payload.append('numero_factura', form.numero_factura);
      payload.append('fecha', form.fecha);
      payload.append('subtotal', form.subtotal);
      payload.append('moneda', form.moneda);
      payload.append('archivo_pdf', form.archivo_pdf);
      if (form.archivo_xml) payload.append('archivo_xml', form.archivo_xml);

      await axios.post('/facturas', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Factura registrada');
      setModalNueva(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo registrar la factura');
    } finally {
      setSaving(false);
    }
  };

  const filtradas = facturas.filter((f) => {
    const q = busqueda.toLowerCase();
    return (
      f.numero_factura?.toLowerCase().includes(q) ||
      f.cliente?.razon_social?.toLowerCase().includes(q) ||
      f.orden?.numero_orden?.toLowerCase().includes(q)
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
          <h2 className="text-2xl font-bold text-gray-800">Facturas SUNAT</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Registra comprobantes ya emitidos en SUNAT y vincúlalos a una orden.
          </p>
        </div>
        <button
          onClick={abrirModalNueva}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition"
        >
          <span className="text-lg leading-none">+</span>
          Registrar factura SUNAT
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700">
        Pendientes de facturar: <strong>{ordenesFacturables.length}</strong> orden(es) sin factura.
      </div>

      <div className="relative mb-5 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por factura, cliente u orden..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-3">🧾</span>
            <p className="text-sm">No hay facturas registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Factura</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Orden</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Moneda</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                {user?.rol === 'admin' && (
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ejecutivo</th>
                )}
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Archivos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginadas.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700">{f.numero_factura}</td>
                  <td className="px-6 py-4 text-gray-600">{f.orden?.numero_orden || '-'}</td>
                  <td className="px-6 py-4 text-gray-800">{f.cliente?.razon_social || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{fmtDate(f.fecha)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${f.moneda === 'USD' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {f.moneda || 'PEN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-800">{fmtMoney(f.total, f.moneda)}</td>
                  {user?.rol === 'admin' && (
                    <td className="px-6 py-4 text-gray-600">
                      {[f.ejecutivo?.nombre, f.ejecutivo?.apellido].filter(Boolean).join(' ') || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {f.archivo_pdf && (
                        <a
                          href={getArchivoUrl(f.archivo_pdf)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition"
                        >
                          PDF
                        </a>
                      )}
                      {f.archivo_xml && (
                        <a
                          href={getArchivoUrl(f.archivo_xml)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition"
                        >
                          XML
                        </a>
                      )}
                      {user?.rol === 'admin' && (
                        <button
                          onClick={() => setModalEliminar(f)}
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

      <Modal open={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar factura">
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminar la factura <strong>{modalEliminar?.numero_factura}</strong>? Esta acción no se puede deshacer.
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

      <Modal open={modalNueva} onClose={() => setModalNueva(false)} title="Registrar factura emitida en SUNAT">
        <form onSubmit={registrarFactura} className="space-y-4">
          <div>
            <label className={labelCls}>Orden facturable *</label>
            <select
              className={inputCls}
              value={form.orden_id}
              onChange={(e) => setForm((p) => ({ ...p, orden_id: e.target.value, subtotal: '' }))}
              required
            >
              <option value="">— Seleccionar —</option>
              {ordenesFacturables.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.numero_orden} · {o.cliente?.razon_social}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Número de factura *</label>
              <input
                className={inputCls}
                value={form.numero_factura}
                onChange={(e) => setForm((p) => ({ ...p, numero_factura: e.target.value }))}
                required
                placeholder="F001-00012345"
              />
            </div>
            <div>
              <label className={labelCls}>Fecha emisión *</label>
              <input
                type="date"
                className={inputCls}
                value={form.fecha}
                onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Subtotal *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.subtotal}
                onChange={(e) => setForm((p) => ({ ...p, subtotal: e.target.value }))}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelCls}>Moneda *</label>
              <select
                className={inputCls}
                value={form.moneda}
                onChange={(e) => setForm((p) => ({ ...p, moneda: e.target.value }))}
              >
                <option value="PEN">S/ Soles (PEN)</option>
                <option value="USD">$ Dólares (USD)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>PDF SUNAT *</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setForm((p) => ({ ...p, archivo_pdf: e.target.files?.[0] || null }))}
              required
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <div>
            <label className={labelCls}>XML SUNAT (opcional)</label>
            <input
              type="file"
              accept=".xml"
              onChange={(e) => setForm((p) => ({ ...p, archivo_xml: e.target.files?.[0] || null }))}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Registrar factura'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default FacturasPage;
