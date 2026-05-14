import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const EMPTY = {
  ruc: '',
  razon_social: '',
  nombre_comercial: '',
  descripcion: '',
  direccion: '',
  telefono: '',
  web: '',
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const ProveedorForm = ({ initial, onSubmit, loading, esEdicion }) => {
  const [form, setForm] = useState(initial || EMPTY);
  const [sunatLoading, setSunatLoading] = useState(false);
  const [sunatStatus, setSunatStatus] = useState(null);
  const sunatTimeout = useRef(null);
  useEffect(() => { if (initial) setForm(initial); }, [initial]);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleRucChange = (value) => {
    set('ruc', value);
    setSunatStatus(null);
    if (sunatTimeout.current) clearTimeout(sunatTimeout.current);
    if (value.length === 11 && /^\d{11}$/.test(value)) {
      sunatTimeout.current = setTimeout(() => buscarRuc(value), 600);
    }
  };

  const buscarRuc = async (ruc) => {
    setSunatLoading(true);
    try {
      const { data } = await axios.get(`/sunat/ruc/${ruc}`);
      setForm((prev) => ({
        ...prev,
        razon_social:     data.razon_social     || prev.razon_social,
        nombre_comercial: data.nombre_comercial || prev.nombre_comercial,
        direccion:        data.direccion        || prev.direccion,
      }));
      setSunatStatus({ estado: data.estado, condicion: data.condicion });
      toast.success('Datos cargados desde SUNAT');
    } catch {
      toast.warning('RUC no encontrado en SUNAT. Ingresa los datos manualmente.');
    } finally {
      setSunatLoading(false);
    }
  };

  const estadoColor = sunatStatus?.estado === 'ACTIVO'
    ? 'bg-green-50 text-green-700 border-green-200'
    : sunatStatus?.estado
    ? 'bg-red-50 text-red-700 border-red-200'
    : '';

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>RUC</label>
          <div className="relative">
            <input className={inputCls} value={form.ruc} onChange={(e) => handleRucChange(e.target.value.replace(/\D/g, ''))} maxLength={11} />
            {sunatLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {sunatStatus && (
            <div className={`mt-1.5 flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg border ${estadoColor}`}>
              <span className="font-semibold">{sunatStatus.estado}</span>
              {sunatStatus.condicion && <span className="opacity-70">· {sunatStatus.condicion}</span>}
            </div>
          )}
        </div>
        <div>
          <label className={labelCls}>Teléfono</label>
          <input className={inputCls} value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Razón social *</label>
        <input className={inputCls} value={form.razon_social} onChange={(e) => set('razon_social', e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Nombre comercial</label>
        <input className={inputCls} value={form.nombre_comercial} onChange={(e) => set('nombre_comercial', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Descripción</label>
        <textarea className={inputCls} rows={3} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Actividad principal del proveedor" />
      </div>
      <div>
        <label className={labelCls}>Dirección</label>
        <input className={inputCls} value={form.direccion} onChange={(e) => set('direccion', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Sitio web</label>
        <input className={inputCls} value={form.web} onChange={(e) => set('web', e.target.value)} placeholder="www.proveedor.com" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
        {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear proveedor'}
      </button>
    </form>
  );
};

const ProveedoresPage = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);

  const cargar = async () => {
    try {
      const { data } = await axios.get('/proveedores');
      setProveedores(data);
    } catch {
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => { setPage(1); }, [busqueda]);

  const handleCrear = async (form) => {
    setSaving(true);
    try {
      await axios.post('/proveedores', form);
      toast.success('Proveedor creado');
      setModalCrear(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear proveedor');
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async (form) => {
    setSaving(true);
    try {
      await axios.put(`/proveedores/${modalEditar.id}`, form);
      toast.success('Proveedor actualizado');
      setModalEditar(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar proveedor');
    } finally {
      setSaving(false);
    }
  };

  const filtrados = proveedores.filter((p) => {
    const q = busqueda.toLowerCase();
    return (
      p.razon_social?.toLowerCase().includes(q) ||
      p.ruc?.includes(q) ||
      p.nombre_comercial?.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginados = filtrados.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Proveedores</h2>
          <p className="text-gray-400 text-sm mt-0.5">Información pública de proveedores</p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo proveedor
        </button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            placeholder="Buscar por nombre o RUC..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-3">🏭</span>
            <p className="text-sm">No hay proveedores registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Proveedor</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">RUC</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginados.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{p.razon_social}</p>
                      {p.nombre_comercial && (
                        <p className="text-xs text-gray-400">{p.nombre_comercial}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.ruc || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {p.descripcion ? (
                      <span className="line-clamp-2">{p.descripcion}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.telefono || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/proveedores/${p.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition"
                      >
                        Ver detalle
                      </button>
                      <button
                        onClick={() => setModalEditar({
                          id: p.id,
                          ruc: p.ruc || '',
                          razon_social: p.razon_social || '',
                          nombre_comercial: p.nombre_comercial || '',
                          descripcion: p.descripcion || '',
                          direccion: p.direccion || '',
                          telefono: p.telefono || '',
                          web: p.web || '',
                        })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtrados.length > 0 && (
        <Pagination page={page} pageSize={pageSize} total={filtrados.length} onChange={setPage} />
      )}

      <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo proveedor">
        <ProveedorForm onSubmit={handleCrear} loading={saving} esEdicion={false} />
      </Modal>

      <Modal open={!!modalEditar} onClose={() => setModalEditar(null)} title="Editar proveedor">
        {modalEditar && (
          <ProveedorForm initial={modalEditar} onSubmit={handleEditar} loading={saving} esEdicion={true} />
        )}
      </Modal>
    </div>
  );
};

export default ProveedoresPage;
