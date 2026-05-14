import { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

// ── Modal base ──────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ── Badge rol ────────────────────────────────────────────────
const RolBadge = ({ rol }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
    ${rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
    {rol === 'admin' ? '⚙ Admin' : '👤 Ejecutivo'}
  </span>
);

// ── Formulario compartido ────────────────────────────────────
const EjecutivoForm = ({ initial, onSubmit, loading, esEdicion }) => {
  const [form, setForm] = useState(
    initial || { nombre: '', apellido: '', email: '', password: '', rol: 'ejecutivo' }
  );

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
          <input className={inputCls} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Apellido *</label>
          <input className={inputCls} value={form.apellido} onChange={(e) => set('apellido', e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
        <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} required />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Contraseña {esEdicion && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
          {!esEdicion && '*'}
        </label>
        <input
          type="password"
          className={inputCls}
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          required={!esEdicion}
          placeholder={esEdicion ? '••••••••' : ''}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Rol *</label>
        <select className={inputCls} value={form.rol} onChange={(e) => set('rol', e.target.value)}>
          <option value="ejecutivo">Ejecutivo</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
        >
          {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear ejecutivo'}
        </button>
      </div>
    </form>
  );
};

// ── Página principal ─────────────────────────────────────────
const EjecutivosPage = () => {
  const [ejecutivos, setEjecutivos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null); // ejecutivo seleccionado
  const [modalEliminar, setModalEliminar] = useState(null);

  const cargar = async () => {
    try {
      const { data } = await axios.get('/ejecutivos');
      setEjecutivos(data);
    } catch {
      toast.error('Error al cargar ejecutivos');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { cargar(); }, []);
  const totalPages = Math.max(1, Math.ceil(ejecutivos.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginados = ejecutivos.slice((page - 1) * pageSize, page * pageSize);

  const handleCrear = async (form) => {
    setSaving(true);
    try {
      await axios.post('/ejecutivos', form);
      toast.success('Ejecutivo creado');
      setModalCrear(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear');
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async (form) => {
    setSaving(true);
    try {
      await axios.put(`/ejecutivos/${modalEditar.id}`, form);
      toast.success('Ejecutivo actualizado');
      setModalEditar(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDesactivar = async () => {
    setSaving(true);
    try {
      await axios.delete(`/ejecutivos/${modalEliminar.id}`);
      toast.success('Ejecutivo desactivado');
      setModalEliminar(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ejecutivos</h2>
          <p className="text-gray-400 text-sm mt-0.5">Gestión de usuarios del sistema</p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo ejecutivo
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {loadingData ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Cargando...</div>
        ) : ejecutivos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-3">👥</span>
            <p className="text-sm">No hay ejecutivos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginados.map((ej, i) => (
                <tr key={ej.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400">{(page - 1) * pageSize + i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {ej.nombre?.[0]}{ej.apellido?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{ej.nombre} {ej.apellido}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{ej.email}</td>
                  <td className="px-6 py-4"><RolBadge rol={ej.rol} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModalEditar({ ...ej, password: '' })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-medium transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setModalEliminar(ej)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-medium transition"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loadingData && ejecutivos.length > 0 && (
        <Pagination page={page} pageSize={pageSize} total={ejecutivos.length} onChange={setPage} />
      )}

      {/* Modal Crear */}
      <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo ejecutivo">
        <EjecutivoForm onSubmit={handleCrear} loading={saving} esEdicion={false} />
      </Modal>

      {/* Modal Editar */}
      <Modal open={!!modalEditar} onClose={() => setModalEditar(null)} title="Editar ejecutivo">
        {modalEditar && (
          <EjecutivoForm initial={modalEditar} onSubmit={handleEditar} loading={saving} esEdicion={true} />
        )}
      </Modal>

      {/* Modal Confirmar desactivar */}
      <Modal open={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Desactivar ejecutivo">
        {modalEliminar && (
          <div>
            <p className="text-sm text-gray-600 mb-1">
              ¿Desactivar a <strong>{modalEliminar.nombre} {modalEliminar.apellido}</strong>?
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Ya no podrá iniciar sesión en el sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalEliminar(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDesactivar}
                disabled={saving}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
              >
                {saving ? 'Procesando...' : 'Sí, desactivar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EjecutivosPage;
