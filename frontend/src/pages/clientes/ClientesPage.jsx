import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

// ── Estilos reutilizables ───────────────────────────────────
const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const EMPTY = {
  ruc: '', razon_social: '', nombre_comercial: '',
  direccion: '', telefono: '', web: '',
  ejecutivo_id: '',
  estado_cliente: 'prospecto',
  categoria: '', tipo_cliente: '',
  fecha_registro: new Date().toISOString().split('T')[0],
};

// ── Modal base ──────────────────────────────────────────────
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

// ── Formulario de cliente ───────────────────────────────────
const ClienteForm = ({ initial, onSubmit, loading, esEdicion, tipos, ejecutivos, isAdmin }) => {
  const [form, setForm] = useState(initial || EMPTY);
  const [sunatLoading, setSunatLoading] = useState(false);
  const [sunatStatus, setSunatStatus] = useState(null);
  const sunatTimeout = useRef(null);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  // Categorías del tipo seleccionado
  const categoriasFiltradas = tipos.find((t) => t.nombre === form.tipo_cliente)?.categorias || [];

  const set = (k, v) => setForm((p) => ({
    ...p,
    [k]: v,
    ...(k === 'tipo_cliente' ? { categoria: '' } : {}),
  }));

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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-5">
      {/* Datos empresa */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos de la empresa</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>RUC *</label>
            <div className="relative">
              <input
                className={inputCls}
                value={form.ruc}
                onChange={(e) => handleRucChange(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                required
                placeholder="20100011122"
              />
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
            <label className={labelCls}>Fecha de registro</label>
            <input
              type="date"
              className={inputCls}
              value={form.fecha_registro}
              onChange={(e) => set('fecha_registro', e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <label className={labelCls}>Razón social *</label>
            <input
              className={inputCls}
              value={form.razon_social}
              onChange={(e) => set('razon_social', e.target.value)}
              required
              placeholder="WOW Technologies S.A.C."
            />
          </div>

          <div className="col-span-2">
            <label className={labelCls}>Nombre comercial</label>
            <input
              className={inputCls}
              value={form.nombre_comercial}
              onChange={(e) => set('nombre_comercial', e.target.value)}
              placeholder="WOW Tech"
            />
          </div>

          <div>
            <label className={labelCls}>Estado comercial</label>
            <select
              className={inputCls}
              value={form.estado_cliente}
              onChange={(e) => set('estado_cliente', e.target.value)}
            >
              <option value="prospecto">Prospecto</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className={labelCls}>Ejecutivo asignado *</label>
              <select
                className={inputCls}
                value={form.ejecutivo_id || ''}
                onChange={(e) => set('ejecutivo_id', e.target.value)}
                required
              >
                <option value="">— Seleccionar ejecutivo —</option>
                {(ejecutivos || []).map((ej) => (
                  <option key={ej.id} value={ej.id}>
                    {ej.nombre} {ej.apellido}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelCls}>Tipo de cliente</label>
            <select className={inputCls} value={form.tipo_cliente} onChange={(e) => set('tipo_cliente', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {tipos.map((t) => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Categoría / Sector</label>
            <select
              className={inputCls}
              value={form.categoria}
              onChange={(e) => set('categoria', e.target.value)}
              disabled={!form.tipo_cliente || categoriasFiltradas.length === 0}
            >
              <option value="">
                {!form.tipo_cliente
                  ? '— Selecciona un tipo primero —'
                  : categoriasFiltradas.length === 0
                  ? '— Sin categorías para este tipo —'
                  : '— Seleccionar —'}
              </option>
              {categoriasFiltradas.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacto y ubicación</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              className={inputCls}
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              placeholder="01-4441234"
            />
          </div>
          <div>
            <label className={labelCls}>Sitio web</label>
            <input
              className={inputCls}
              value={form.web}
              onChange={(e) => set('web', e.target.value)}
              placeholder="www.empresa.com"
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Dirección</label>
            <input
              className={inputCls}
              value={form.direccion}
              onChange={(e) => set('direccion', e.target.value)}
              placeholder="Av. Principal 123, Lima"
            />
          </div>
        </div>
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md shadow-blue-200 transition disabled:opacity-60"
        >
          {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </form>
  );
};

// ── Página principal ────────────────────────────────────────
const ClientesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [tipos, setTipos] = useState([]); // cada tipo incluye .categorias[]
  const [ejecutivos, setEjecutivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);

  const cargar = async () => {
    try {
      const { data } = await axios.get('/clientes');
      setClientes(data);
    } catch {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const cargarListas = async () => {
    try {
      const [resTipos, resEjs] = await Promise.all([
        axios.get('/config/tipos-cliente'),
        user.rol === 'admin' ? axios.get('/ejecutivos') : Promise.resolve({ data: [] }),
      ]);
      setTipos(resTipos.data); // incluye .categorias[] por tipo
      setEjecutivos(resEjs.data || []);
    } catch (err) {
      console.error('Error cargando tipos:', err);
      toast.error('No se pudieron cargar los datos de configuración');
    }
  };

  useEffect(() => { cargar(); cargarListas(); }, [user.rol]);
  useEffect(() => { setPage(1); }, [busqueda, filtroCategoria]);

  const handleCrear = async (form) => {
    setSaving(true);
    try {
      await axios.post('/clientes', form);
      toast.success('Cliente creado');
      setModalCrear(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async (form) => {
    setSaving(true);
    try {
      await axios.put(`/clientes/${modalEditar.id}`, form);
      toast.success('Cliente actualizado');
      setModalEditar(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar cliente');
    } finally {
      setSaving(false);
    }
  };

  const filtrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    const matchBusqueda = (
      c.razon_social?.toLowerCase().includes(q) ||
      c.ruc?.includes(q) ||
      c.nombre_comercial?.toLowerCase().includes(q)
    );
    const matchCategoria = !filtroCategoria || c.categoria === filtroCategoria;
    return matchBusqueda && matchCategoria;
  });
  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginados = filtrados.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {user.rol === 'admin' ? 'Todos los clientes del sistema' : 'Mis clientes asignados'}
          </p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo cliente
        </button>
      </div>

      {/* Buscador + Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o RUC..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
        >
          <option value="">Todas las categorías</option>
          {tipos.flatMap((t) => t.categorias || []).map((c) => (
            <option key={c.id} value={c.nombre}>{c.nombre}</option>
          ))}
        </select>
        {filtroCategoria && (
          <button
            onClick={() => setFiltroCategoria('')}
            className="px-3 py-2 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            × Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-3">🏢</span>
            <p className="text-sm">{busqueda ? 'Sin resultados para tu búsqueda' : 'No hay clientes registrados'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Empresa</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">RUC</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</th>
                {user.rol === 'admin' && (
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ejecutivo</th>
                )}
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginados.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: '#1e3a5f' }}
                      >
                        {c.razon_social?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{c.razon_social}</p>
                        {c.nombre_comercial && (
                          <p className="text-xs text-gray-400">{c.nombre_comercial}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{c.ruc}</td>
                  <td className="px-6 py-4">
                    {c.categoria ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {c.categoria}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    {c.tipo_cliente ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {c.tipo_cliente}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        c.estado_cliente === 'cliente'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {c.estado_cliente || 'prospecto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{c.telefono || '—'}</td>
                  {user.rol === 'admin' && (
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
                        👤 {c.ejecutivo?.nombre} {c.ejecutivo?.apellido}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/clientes/${c.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition"
                      >
                        Ver detalle
                      </button>
                      <button
                        onClick={() => setModalEditar({
                          id: c.id,
                          ruc: c.ruc || '',
                          razon_social: c.razon_social || '',
                          nombre_comercial: c.nombre_comercial || '',
                          direccion: c.direccion || '',
                          telefono: c.telefono || '',
                          web: c.web || '',
                          ejecutivo_id: c.ejecutivo_id || '',
                          estado_cliente: c.estado_cliente || 'prospecto',
                          categoria: c.categoria || '',
                          tipo_cliente: c.tipo_cliente || '',
                          fecha_registro: c.fecha_registro || EMPTY.fecha_registro,
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

      {/* Contador */}
      {!loading && filtrados.length > 0 && (
        <Pagination page={page} pageSize={pageSize} total={filtrados.length} onChange={setPage} />
      )}

      {/* Modal Crear */}
      <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo cliente">
        <ClienteForm
          onSubmit={handleCrear}
          loading={saving}
          esEdicion={false}
          tipos={tipos}
          ejecutivos={ejecutivos}
          isAdmin={user.rol === 'admin'}
        />
      </Modal>

      {/* Modal Editar */}
      <Modal open={!!modalEditar} onClose={() => setModalEditar(null)} title="Editar cliente">
        {modalEditar && (
          <ClienteForm
            initial={modalEditar}
            onSubmit={handleEditar}
            loading={saving}
            esEdicion={true}
            tipos={tipos}
            ejecutivos={ejecutivos}
            isAdmin={user.rol === 'admin'}
          />
        )}
      </Modal>
    </div>
  );
};

export default ClientesPage;
