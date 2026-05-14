import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const EMPTY = {
  nombre: '',
  descripcion: '',
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

const MarcaForm = ({ initial, onSubmit, loading, esEdicion }) => {
  const [form, setForm] = useState(initial || EMPTY);
  useEffect(() => { if (initial) setForm(initial); }, [initial]);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className={labelCls}>Nombre *</label>
        <input className={inputCls} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Descripción</label>
        <textarea className={inputCls} rows={3} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Sitio web</label>
        <input className={inputCls} value={form.web} onChange={(e) => set('web', e.target.value)} placeholder="www.marca.com" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
        {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear marca'}
      </button>
    </form>
  );
};

const MarcasPage = () => {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);

  const cargar = async () => {
    try {
      const { data } = await axios.get('/marcas');
      setMarcas(data);
    } catch {
      toast.error('Error al cargar marcas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => { setPage(1); }, [busqueda]);

  const handleCrear = async (form) => {
    setSaving(true);
    try {
      await axios.post('/marcas', form);
      toast.success('Marca creada');
      setModalCrear(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear marca');
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async (form) => {
    setSaving(true);
    try {
      await axios.put(`/marcas/${modalEditar.id}`, form);
      toast.success('Marca actualizada');
      setModalEditar(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar marca');
    } finally {
      setSaving(false);
    }
  };

  const filtradas = marcas.filter((m) => {
    const q = busqueda.toLowerCase();
    return m.nombre?.toLowerCase().includes(q);
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
          <h2 className="text-2xl font-bold text-gray-800">Marcas</h2>
          <p className="text-gray-400 text-sm mt-0.5">Información pública de marcas</p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition"
        >
          <span className="text-lg leading-none">+</span>
          Nueva marca
        </button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            placeholder="Buscar marca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-3">🏷️</span>
            <p className="text-sm">No hay marcas registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Marca</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Web</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginadas.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{m.nombre}</p>
                      {m.descripcion && (
                        <p className="text-xs text-gray-400 line-clamp-1">{m.descripcion}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{m.web || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/marcas/${m.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition"
                      >
                        Ver detalle
                      </button>
                      <button
                        onClick={() => setModalEditar({
                          id: m.id,
                          nombre: m.nombre || '',
                          descripcion: m.descripcion || '',
                          web: m.web || '',
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

      {!loading && filtradas.length > 0 && (
        <Pagination page={page} pageSize={pageSize} total={filtradas.length} onChange={setPage} />
      )}

      <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Nueva marca">
        <MarcaForm onSubmit={handleCrear} loading={saving} esEdicion={false} />
      </Modal>

      <Modal open={!!modalEditar} onClose={() => setModalEditar(null)} title="Editar marca">
        {modalEditar && (
          <MarcaForm initial={modalEditar} onSubmit={handleEditar} loading={saving} esEdicion={true} />
        )}
      </Modal>
    </div>
  );
};

export default MarcasPage;
