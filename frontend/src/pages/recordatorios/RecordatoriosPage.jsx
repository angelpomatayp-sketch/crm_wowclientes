import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../api/axiosInstance';
import Pagination from '../../components/Pagination';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

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

const estadoFecha = (fecha) => {
  const hoy = new Date();
  const f = new Date(fecha);
  const sameDay = hoy.toDateString() === f.toDateString();
  if (sameDay) return 'hoy';
  return f < hoy ? 'vencido' : 'proximo';
};

const badgeEstado = (estado) => {
  if (estado === 'hoy') return 'bg-amber-100 text-amber-700';
  if (estado === 'vencido') return 'bg-rose-100 text-rose-700';
  if (estado === 'completado') return 'bg-emerald-100 text-emerald-700';
  return 'bg-blue-100 text-blue-700';
};

const RecordatoriosPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [filtro, setFiltro] = useState('pendientes');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [form, setForm] = useState({
    cliente_id: '',
    fecha: new Date().toISOString().slice(0, 16),
    descripcion: '',
  });

  const cargar = async () => {
    setLoading(true);
    try {
      const [resClientes, resRecordatorios] = await Promise.all([
        axios.get('/clientes'),
        axios.get('/recordatorios'),
      ]);
      setClientes(resClientes.data || []);
      setRecordatorios(resRecordatorios.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudieron cargar recordatorios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);
  useEffect(() => { setPage(1); }, [filtro, busqueda]);

  const crearRecordatorio = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        cliente_id: form.cliente_id ? Number(form.cliente_id) : null,
        fecha: form.fecha,
        descripcion: form.descripcion,
      };
      await axios.post('/recordatorios', payload);
      toast.success('Recordatorio creado');
      setForm({
        cliente_id: '',
        fecha: new Date().toISOString().slice(0, 16),
        descripcion: '',
      });
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo crear recordatorio');
    } finally {
      setSaving(false);
    }
  };

  const completar = async (id) => {
    try {
      await axios.patch(`/recordatorios/${id}/completar`);
      setRecordatorios((prev) => prev.map((r) => (r.id === id ? { ...r, completado: true } : r)));
      toast.success('Recordatorio completado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo completar');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar recordatorio?')) return;
    try {
      await axios.delete(`/recordatorios/${id}`);
      setRecordatorios((prev) => prev.filter((r) => r.id !== id));
      toast.success('Recordatorio eliminado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  const counters = useMemo(() => {
    const now = new Date();
    const init = { pendientes: 0, hoy: 0, vencidos: 0, completados: 0 };
    (recordatorios || []).forEach((r) => {
      if (r.completado) {
        init.completados += 1;
      } else {
        init.pendientes += 1;
        const f = new Date(r.fecha);
        if (f.toDateString() === now.toDateString()) init.hoy += 1;
        if (f < now) init.vencidos += 1;
      }
    });
    return init;
  }, [recordatorios]);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return (recordatorios || []).filter((r) => {
      const fechaStatus = estadoFecha(r.fecha);
      const byFiltro = (
        (filtro === 'pendientes' && !r.completado)
        || (filtro === 'hoy' && !r.completado && fechaStatus === 'hoy')
        || (filtro === 'vencidos' && !r.completado && fechaStatus === 'vencido')
        || (filtro === 'completados' && r.completado)
        || (filtro === 'todos')
      );
      const byText = !q
        || r.descripcion?.toLowerCase().includes(q)
        || r.cliente?.razon_social?.toLowerCase().includes(q);
      return byFiltro && byText;
    });
  }, [recordatorios, filtro, busqueda]);
  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginados = filtrados.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recordatorios</h2>
        <p className="text-gray-400 text-sm mt-0.5">Control de pendientes comerciales y seguimiento de compromisos.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <button onClick={() => setFiltro('pendientes')} className={`rounded-xl p-3 text-left ${filtro === 'pendientes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
          <p className="text-xs opacity-80">Pendientes</p><p className="text-xl font-bold">{counters.pendientes}</p>
        </button>
        <button onClick={() => setFiltro('hoy')} className={`rounded-xl p-3 text-left ${filtro === 'hoy' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
          <p className="text-xs opacity-80">Para hoy</p><p className="text-xl font-bold">{counters.hoy}</p>
        </button>
        <button onClick={() => setFiltro('vencidos')} className={`rounded-xl p-3 text-left ${filtro === 'vencidos' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
          <p className="text-xs opacity-80">Vencidos</p><p className="text-xl font-bold">{counters.vencidos}</p>
        </button>
        <button onClick={() => setFiltro('completados')} className={`rounded-xl p-3 text-left ${filtro === 'completados' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
          <p className="text-xs opacity-80">Completados</p><p className="text-xl font-bold">{counters.completados}</p>
        </button>
        <button onClick={() => setFiltro('todos')} className={`rounded-xl p-3 text-left ${filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
          <p className="text-xs opacity-80">Todos</p><p className="text-xl font-bold">{recordatorios.length}</p>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Nuevo recordatorio</h3>
        <form onSubmit={crearRecordatorio} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Cliente</label>
            <select
              className={inputCls}
              value={form.cliente_id}
              onChange={(e) => setForm((p) => ({ ...p, cliente_id: e.target.value }))}
            >
              <option value="">Sin cliente</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
            </select>
          </div>
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
          <div className="md:col-span-2">
            <label className={labelCls}>Descripción *</label>
            <input
              className={inputCls}
              value={form.descripcion}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              placeholder="Llamar para confirmar orden..."
              required
            />
          </div>
          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Crear recordatorio'}
            </button>
          </div>
        </form>
      </div>

      <div className="mb-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por cliente o descripción..."
          className="w-full md:w-80 pl-3 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="py-14 text-center text-gray-400">Cargando recordatorios...</div>
        ) : filtrados.length === 0 ? (
          <div className="py-14 text-center text-gray-400">Sin recordatorios en este filtro</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginados.map((r) => {
                const estado = r.completado ? 'completado' : estadoFecha(r.fecha);
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-gray-600">{fmtDateTime(r.fecha)}</td>
                    <td className="px-6 py-3 text-gray-800">{r.cliente?.razon_social || '-'}</td>
                    <td className="px-6 py-3 text-gray-700">{r.descripcion}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeEstado(estado)}`}>
                        {estado}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        {!r.completado && (
                          <button
                            onClick={() => completar(r.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            Completar
                          </button>
                        )}
                        <button
                          onClick={() => eliminar(r.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtrados.length > 0 && (
        <Pagination page={page} pageSize={pageSize} total={filtrados.length} onChange={setPage} />
      )}
    </div>
  );
};

export default RecordatoriosPage;
