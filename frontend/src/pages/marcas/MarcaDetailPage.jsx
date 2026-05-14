import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const EMPTY_CONTACTO = { nombre: '', cargo: '', correo: '', telefono: '', celular: '', contacto_principal: false };

const ContactoForm = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState(initial || EMPTY_CONTACTO);
  useEffect(() => { if (initial) setForm(initial); }, [initial]);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <div>
        <label className={labelCls}>Nombre completo *</label>
        <input className={inputCls} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Cargo</label>
        <input className={inputCls} value={form.cargo} onChange={(e) => set('cargo', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Correo</label>
        <input type="email" className={inputCls} value={form.correo} onChange={(e) => set('correo', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Celular</label>
          <input className={inputCls} value={form.celular} onChange={(e) => set('celular', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Teléfono</label>
          <input className={inputCls} value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input type="checkbox" checked={form.contacto_principal} onChange={(e) => set('contacto_principal', e.target.checked)} className="rounded" />
        Contacto principal
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
      >
        {loading ? 'Guardando...' : 'Guardar contacto'}
      </button>
    </form>
  );
};

const MarcaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [marca, setMarca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalContacto, setModalContacto] = useState(false);
  const [editContacto, setEditContacto] = useState(null);

  const cargar = async () => {
    try {
      const { data } = await axios.get(`/marcas/${id}/historial`);
      setMarca(data);
    } catch {
      toast.error('Error al cargar marca');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  const handleCrearContacto = async (form) => {
    setSaving(true);
    try {
      await axios.post(`/marcas/${id}/contactos`, form);
      toast.success('Contacto agregado');
      setModalContacto(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditarContacto = async (form) => {
    setSaving(true);
    try {
      await axios.put(`/marcas/contactos/${editContacto.id}`, form);
      toast.success('Contacto actualizado');
      setEditContacto(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Cargando...</div>;
  if (!marca) return null;

  const contactos = marca.contactos || [];

  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={() => navigate('/marcas')}
          className="mt-1 w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 transition shrink-0"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >←</button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{marca.nombre}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
            {marca.web && <span>{marca.web}</span>}
            {marca.descripcion && <span>· {marca.descripcion}</span>}
          </div>
        </div>
        <button
          onClick={() => setModalContacto(true)}
          className="px-4 py-2 border border-blue-200 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-50 transition shrink-0"
        >
          Agregar contacto
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Contactos de la marca</h3>
        </div>

        {contactos.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">Sin contactos registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
            {contactos.map((c) => (
              <div key={c.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{c.nombre}</p>
                      {c.contacto_principal && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Principal</span>
                      )}
                    </div>
                    {c.cargo && <p className="text-xs text-gray-500 mt-0.5">{c.cargo}</p>}
                    {c.correo && <p className="text-xs text-blue-500 mt-1">{c.correo}</p>}
                    {c.celular && <p className="text-xs text-gray-400">{c.celular}</p>}
                  </div>
                  <button
                    onClick={() => setEditContacto({ ...c })}
                    className="text-xs text-gray-400 hover:text-blue-600 shrink-0"
                  >Editar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalContacto} onClose={() => setModalContacto(false)} title="Agregar contacto">
        <ContactoForm onSubmit={handleCrearContacto} loading={saving} />
      </Modal>

      <Modal open={!!editContacto} onClose={() => setEditContacto(null)} title="Editar contacto">
        {editContacto && (
          <ContactoForm initial={editContacto} onSubmit={handleEditarContacto} loading={saving} />
        )}
      </Modal>
    </div>
  );
};

export default MarcaDetailPage;
