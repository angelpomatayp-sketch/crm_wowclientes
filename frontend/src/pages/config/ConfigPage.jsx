import { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

// ── Modal base ───────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
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
const btnPrimary = 'w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60';
const btnDanger  = 'flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60';
const btnCancel  = 'flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition';

// ── Form tipo (solo nombre) ───────────────────────────────────
const TipoForm = ({ initial, onSubmit, loading, esEdicion }) => {
  const [nombre, setNombre] = useState(initial?.nombre || '');
  useEffect(() => setNombre(initial?.nombre || ''), [initial]);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(nombre); }} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
        <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus placeholder="Ej: Gobierno" />
      </div>
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear tipo'}
      </button>
    </form>
  );
};

// ── Form categoría (nombre + tipo) ────────────────────────────
const CategoriaForm = ({ initial, tipos, onSubmit, loading, esEdicion, tipoFijo }) => {
  const [nombre, setNombre] = useState(initial?.nombre || '');
  const [tipoId, setTipoId] = useState(initial?.tipo_cliente_id || tipoFijo || '');
  useEffect(() => {
    setNombre(initial?.nombre || '');
    setTipoId(initial?.tipo_cliente_id || tipoFijo || '');
  }, [initial, tipoFijo]);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ nombre, tipo_cliente_id: tipoId }); }} className="space-y-4">
      {!tipoFijo && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de cliente *</label>
          <select className={inputCls} value={tipoId} onChange={(e) => setTipoId(e.target.value)} required>
            <option value="">— Seleccionar tipo —</option>
            {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la categoría *</label>
        <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus placeholder="Ej: Ministerios" />
      </div>
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear categoría'}
      </button>
    </form>
  );
};

// ── Confirmar eliminar ────────────────────────────────────────
const ModalEliminar = ({ open, onClose, item, onConfirm, saving }) => (
  <Modal open={open} onClose={onClose} title="Confirmar eliminación">
    {item && (
      <div>
        <p className="text-sm text-gray-600 mb-1">¿Eliminar <strong>{item.nombre}</strong>?</p>
        <p className="text-xs text-gray-400 mb-6">Ya no aparecerá como opción en el formulario de clientes.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className={btnCancel}>Cancelar</button>
          <button onClick={onConfirm} disabled={saving} className={btnDanger}>
            {saving ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    )}
  </Modal>
);

// ── Página principal ──────────────────────────────────────────
const ConfigPage = () => {
  const [tipos, setTipos] = useState([]); // cada tipo incluye .categorias[]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modales tipos
  const [modalTipCrear, setModalTipCrear] = useState(false);
  const [modalTipEditar, setModalTipEditar] = useState(null);
  const [modalTipEliminar, setModalTipEliminar] = useState(null);

  // Modales categorías
  const [modalCatCrear, setModalCatCrear] = useState(null); // = tipoId fijo al abrir
  const [modalCatEditar, setModalCatEditar] = useState(null);
  const [modalCatEliminar, setModalCatEliminar] = useState(null);

  const cargar = async () => {
    try {
      const { data } = await axios.get('/config/tipos-cliente');
      setTipos(data);
    } catch (err) {
      console.error('[Config]', err);
      toast.error(err.response?.data?.message || 'Error al cargar configuración');
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  // ── Tipos ──
  const handleCrearTipo = async (nombre) => {
    setSaving(true);
    try {
      await axios.post('/config/tipos-cliente', { nombre });
      toast.success('Tipo creado');
      setModalTipCrear(false);
      cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleEditarTipo = async (nombre) => {
    setSaving(true);
    try {
      await axios.put(`/config/tipos-cliente/${modalTipEditar.id}`, { nombre });
      toast.success('Tipo actualizado');
      setModalTipEditar(null);
      cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleEliminarTipo = async () => {
    setSaving(true);
    try {
      await axios.delete(`/config/tipos-cliente/${modalTipEliminar.id}`);
      toast.success('Tipo eliminado');
      setModalTipEliminar(null);
      cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  // ── Categorías ──
  const handleCrearCat = async ({ nombre, tipo_cliente_id }) => {
    setSaving(true);
    try {
      await axios.post('/config/categorias', { nombre, tipo_cliente_id });
      toast.success('Categoría creada');
      setModalCatCrear(null);
      cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleEditarCat = async ({ nombre, tipo_cliente_id }) => {
    setSaving(true);
    try {
      await axios.put(`/config/categorias/${modalCatEditar.id}`, { nombre, tipo_cliente_id });
      toast.success('Categoría actualizada');
      setModalCatEditar(null);
      cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleEliminarCat = async () => {
    setSaving(true);
    try {
      await axios.delete(`/config/categorias/${modalCatEliminar.id}`);
      toast.success('Categoría eliminada');
      setModalCatEliminar(null);
      cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
        <p className="text-gray-400 text-sm mt-0.5">
          Define los tipos de cliente y sus categorías. La categoría depende del tipo seleccionado.
        </p>
      </div>

      {/* Botón agregar tipo */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setModalTipCrear(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo tipo de cliente
        </button>
      </div>

      {/* Lista tipos con categorías anidadas */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : tipos.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center text-gray-400" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <p className="text-4xl mb-3">⚙️</p>
          <p className="text-sm">No hay tipos de cliente. Crea uno para comenzar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tipos.map((tipo) => (
            <div key={tipo.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              {/* Cabecera tipo */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {tipo.nombre[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{tipo.nombre}</p>
                    <p className="text-xs text-gray-400">
                      {tipo.categorias?.length || 0} categoría{tipo.categorias?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalCatCrear(tipo.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition"
                  >
                    + Categoría
                  </button>
                  <button
                    onClick={() => setModalTipEditar(tipo)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setModalTipEliminar(tipo)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Categorías del tipo */}
              {tipo.categorias && tipo.categorias.length > 0 ? (
                <ul className="divide-y divide-gray-50">
                  {tipo.categorias.map((cat) => (
                    <li key={cat.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span className="text-sm text-gray-700">{cat.nombre}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalCatEditar({ ...cat, tipo_cliente_id: cat.tipo_cliente_id })}
                          className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setModalCatEliminar(cat)}
                          className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-4 text-sm text-gray-400 italic">
                  Sin categorías — haz clic en "+ Categoría" para agregar
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modales Tipos ── */}
      <Modal open={modalTipCrear} onClose={() => setModalTipCrear(false)} title="Nuevo tipo de cliente">
        <TipoForm onSubmit={handleCrearTipo} loading={saving} esEdicion={false} />
      </Modal>
      <Modal open={!!modalTipEditar} onClose={() => setModalTipEditar(null)} title="Editar tipo de cliente">
        <TipoForm initial={modalTipEditar} onSubmit={handleEditarTipo} loading={saving} esEdicion={true} />
      </Modal>
      <ModalEliminar
        open={!!modalTipEliminar} onClose={() => setModalTipEliminar(null)}
        item={modalTipEliminar} onConfirm={handleEliminarTipo} saving={saving}
      />

      {/* ── Modales Categorías ── */}
      <Modal open={!!modalCatCrear} onClose={() => setModalCatCrear(null)} title="Nueva categoría">
        <CategoriaForm
          tipos={tipos}
          tipoFijo={modalCatCrear}
          onSubmit={handleCrearCat}
          loading={saving}
          esEdicion={false}
        />
      </Modal>
      <Modal open={!!modalCatEditar} onClose={() => setModalCatEditar(null)} title="Editar categoría">
        <CategoriaForm
          initial={modalCatEditar}
          tipos={tipos}
          onSubmit={handleEditarCat}
          loading={saving}
          esEdicion={true}
        />
      </Modal>
      <ModalEliminar
        open={!!modalCatEliminar} onClose={() => setModalCatEliminar(null)}
        item={modalCatEliminar} onConfirm={handleEliminarCat} saving={saving}
      />
    </div>
  );
};

export default ConfigPage;
