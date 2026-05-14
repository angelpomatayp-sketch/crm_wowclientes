import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../api/axiosInstance';
import Pagination from '../../components/Pagination';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const tipos = [
  { value: 'llamada', label: 'Llamada' },
  { value: 'reunion', label: 'Reunión' },
  { value: 'visita', label: 'Visita' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'email', label: 'Email' },
];

const fmtDateTime = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ActividadesPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [form, setForm] = useState({
    cliente_id: '',
    contacto_id: '',
    tipo: 'llamada',
    fecha: new Date().toISOString().slice(0, 16),
    asunto: '',
    descripcion: '',
    resultado: '',
    duracion_min: '',
  });

  const cargar = async () => {
    setLoading(true);
    try {
      const [resClientes, resActividades] = await Promise.all([
        axios.get('/clientes'),
        axios.get('/actividades'),
      ]);
      setClientes(resClientes.data || []);
      setActividades(resActividades.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudieron cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);
  useEffect(() => { setPage(1); }, [busqueda, tipoFiltro]);

  useEffect(() => {
    const cargarContactos = async () => {
      if (!form.cliente_id) {
        setContactos([]);
        return;
      }
      try {
        const res = await axios.get(`/clientes/${form.cliente_id}/contactos`);
        setContactos(res.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'No se pudieron cargar contactos');
      }
    };
    cargarContactos();
  }, [form.cliente_id]);

  const crearActividad = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        cliente_id: Number(form.cliente_id),
        contacto_id: form.contacto_id ? Number(form.contacto_id) : null,
        tipo: form.tipo,
        fecha: form.fecha,
        asunto: form.asunto || null,
        descripcion: form.descripcion || null,
        resultado: form.resultado || null,
        duracion_min: form.duracion_min ? Number(form.duracion_min) : null,
      };
      await axios.post('/actividades', payload);
      toast.success('Actividad registrada');
      setForm({
        cliente_id: '',
        contacto_id: '',
        tipo: 'llamada',
        fecha: new Date().toISOString().slice(0, 16),
        asunto: '',
        descripcion: '',
        resultado: '',
        duracion_min: '',
      });
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo registrar la actividad');
    } finally {
      setSaving(false);
    }
  };

  const eliminarActividad = async (id) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return;
    try {
      await axios.delete(`/actividades/${id}`);
      toast.success('Actividad eliminada');
      setActividades((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return (actividades || []).filter((a) => {
      const okTipo = !tipoFiltro || a.tipo === tipoFiltro;
      const okTexto = !q
        || a.asunto?.toLowerCase().includes(q)
        || a.descripcion?.toLowerCase().includes(q)
        || a.cliente?.razon_social?.toLowerCase().includes(q)
        || a.contacto?.nombre?.toLowerCase().includes(q);
      return okTipo && okTexto;
    });
  }, [actividades, busqueda, tipoFiltro]);
  const totalPages = Math.max(1, Math.ceil(filtradas.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginadas = filtradas.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Actividades</h2>
        <p className="text-gray-400 text-sm mt-0.5">Bitácora comercial por cliente (llamadas, reuniones, visitas, correos).</p>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Registrar actividad</h3>
        <form onSubmit={crearActividad} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Cliente *</label>
              <select
                className={inputCls}
                value={form.cliente_id}
                onChange={(e) => setForm((p) => ({ ...p, cliente_id: e.target.value, contacto_id: '' }))}
                required
              >
                <option value="">Seleccionar</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.razon_social}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Contacto</label>
              <select
                className={inputCls}
                value={form.contacto_id}
                onChange={(e) => setForm((p) => ({ ...p, contacto_id: e.target.value }))}
              >
                <option value="">Sin contacto</option>
                {contactos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo *</label>
              <select
                className={inputCls}
                value={form.tipo}
                onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                required
              >
                {tipos.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Fecha y hora *</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.fecha}
                onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Duración (min)</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                value={form.duracion_min}
                onChange={(e) => setForm((p) => ({ ...p, duracion_min: e.target.value }))}
                placeholder="30"
              />
            </div>
            <div>
              <label className={labelCls}>Asunto</label>
              <input
                className={inputCls}
                value={form.asunto}
                onChange={(e) => setForm((p) => ({ ...p, asunto: e.target.value }))}
                placeholder="Seguimiento propuesta"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Descripción</label>
              <textarea
                className={inputCls}
                rows={3}
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Resultado / próximo paso</label>
              <textarea
                className={inputCls}
                rows={3}
                value={form.resultado}
                onChange={(e) => setForm((p) => ({ ...p, resultado: e.target.value }))}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar actividad'}
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente, asunto, contacto..."
            className="w-72 pl-3 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="py-14 text-center text-gray-400">Cargando actividades...</div>
        ) : filtradas.length === 0 ? (
          <div className="py-14 text-center text-gray-400">Sin actividades registradas</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Asunto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Resultado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginadas.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-gray-600">{fmtDateTime(a.fecha)}</td>
                  <td className="px-6 py-3 capitalize text-gray-700">{a.tipo}</td>
                  <td className="px-6 py-3 text-gray-800">{a.cliente?.razon_social || '-'}</td>
                  <td className="px-6 py-3 text-gray-600">{a.contacto?.nombre || '-'}</td>
                  <td className="px-6 py-3 text-gray-700">{a.asunto || '-'}</td>
                  <td className="px-6 py-3 text-gray-500 max-w-sm truncate">{a.resultado || '-'}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => eliminarActividad(a.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      Eliminar
                    </button>
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
    </div>
  );
};

export default ActividadesPage;
