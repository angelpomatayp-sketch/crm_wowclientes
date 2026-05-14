import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const fmt = (n, moneda = 'PEN') => {
  if (n == null) return '—';
  const symbol = moneda === 'USD' ? '$' : 'S/';
  return `${symbol} ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
};
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-PE') : '—';

// ── Estado badge ──────────────────────────────────────────────
const EstadoBadge = ({ estado }) => {
  const map = {
    borrador:  'bg-gray-100 text-gray-600',
    enviado:   'bg-blue-100 text-blue-700',
    aprobado:  'bg-green-100 text-green-700',
    rechazado: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold capitalize ${map[estado] || 'bg-gray-100 text-gray-500'}`}>
      {estado}
    </span>
  );
};

// ── Transiciones permitidas ───────────────────────────────────
const TRANSICIONES = {
  borrador:  [{ value: 'enviado',   label: 'Marcar como enviado',  cls: 'bg-blue-600 hover:bg-blue-700 text-white' }],
  enviado:   [
    { value: 'aprobado',  label: 'Aprobar',   cls: 'bg-green-600 hover:bg-green-700 text-white' },
    { value: 'rechazado', label: 'Rechazar',  cls: 'bg-red-500 hover:bg-red-600 text-white' },
  ],
  rechazado: [{ value: 'borrador', label: 'Volver a borrador', cls: 'bg-gray-600 hover:bg-gray-700 text-white' }],
  aprobado:  [],
};

// ── Modal base ────────────────────────────────────────────────
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

// ── Formulario de ítem ────────────────────────────────────────
const ItemForm = ({ initial, onSubmit, loading, moneda = 'PEN' }) => {
  const [form, setForm] = useState(initial || { descripcion: '', cantidad: 1, precio_unitario: '' });
  useEffect(() => { if (initial) setForm(initial); }, [initial]);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const subtotal = (parseFloat(form.cantidad) || 0) * (parseFloat(form.precio_unitario) || 0);
  const simbolo = moneda === 'USD' ? '$' : 'S/';
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <div>
        <label className={labelCls}>Descripción *</label>
        <input className={inputCls} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} required placeholder="Servicio de consultoría..." autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Cantidad *</label>
          <input type="number" min="0.01" step="0.01" className={inputCls} value={form.cantidad} onChange={(e) => set('cantidad', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Precio unitario ({simbolo}) *</label>
          <input type="number" min="0" step="0.01" className={inputCls} value={form.precio_unitario} onChange={(e) => set('precio_unitario', e.target.value)} required placeholder="0.00" />
        </div>
      </div>
      {subtotal > 0 && (
        <p className="text-xs text-gray-500 text-right">Subtotal: <strong className="text-gray-800">{fmt(subtotal, moneda)}</strong></p>
      )}
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
        {loading ? 'Guardando...' : initial ? 'Actualizar ítem' : 'Agregar ítem'}
      </button>
    </form>
  );
};

// ── Página principal ──────────────────────────────────────────
const CotizacionDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cot, setCot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalItem, setModalItem] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [modalEliminarItem, setModalEliminarItem] = useState(null);
  const [modalCorreo, setModalCorreo] = useState(false);
  const [correoDestino, setCorreoDestino] = useState('');
  const [correoMensaje, setCorreoMensaje] = useState('');
  const filePropuestaRef = useRef(null);

  const cargar = async () => {
    try {
      const { data } = await axios.get(`/cotizaciones/${id}`);
      setCot(data);
    } catch {
      toast.error('Error al cargar cotización');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  const handleCambiarEstado = async (nuevoEstado) => {
    setSaving(true);
    try {
      await axios.patch(`/cotizaciones/${id}/estado`, { estado: nuevoEstado });
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleAgregarItem = async (form) => {
    setSaving(true);
    try {
      await axios.post(`/cotizaciones/${id}/items`, form);
      toast.success('Ítem agregado');
      setModalItem(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditarItem = async (form) => {
    setSaving(true);
    try {
      await axios.put(`/cotizaciones/${id}/items/${editItem.id}`, form);
      toast.success('Ítem actualizado');
      setEditItem(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarItem = async () => {
    setSaving(true);
    try {
      await axios.delete(`/cotizaciones/${id}/items/${modalEliminarItem.id}`);
      toast.success('Ítem eliminado');
      setModalEliminarItem(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDescargarPdf = async () => {
    try {
      const res = await axios.get(`/cotizaciones/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/i);
      a.href = url;
      a.download = match?.[1] || `${cot.numero || 'cotizacion'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF generado correctamente');
    } catch (err) {
      try {
        const blob = err?.response?.data;
        if (blob && typeof blob.text === 'function') {
          const raw = await blob.text();
          const parsed = JSON.parse(raw);
          toast.error(parsed?.message || 'No se pudo generar el PDF');
          return;
        }
      } catch {
        // Si no se puede parsear, se usa mensaje genérico
      }
      toast.error('No se pudo generar el PDF');
    }
  };

  const handleDescargarPropuestaPdf = async () => {
    try {
      const res = await axios.get(`/cotizaciones/${id}/propuesta-pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/i);
      a.href = url;
      a.download = match?.[1] || `${cot.numero || 'propuesta'}-propuesta.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Propuesta descargada');
    } catch (err) {
      try {
        const blob = err?.response?.data;
        if (blob && typeof blob.text === 'function') {
          const raw = await blob.text();
          const parsed = JSON.parse(raw);
          toast.error(parsed?.message || 'No se pudo descargar la propuesta');
          return;
        }
      } catch {
        // Si no se puede parsear, se usa mensaje genérico
      }
      toast.error('No se pudo descargar la propuesta');
    }
  };

  const handleSubirPropuestaPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Solo se permite PDF para la propuesta económica');
      e.target.value = '';
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('archivo_propuesta_pdf', file);
      await axios.put(`/cotizaciones/${id}`, payload);
      toast.success('Propuesta económica adjuntada');
      await cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo adjuntar la propuesta');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const abrirModalCorreo = () => {
    const correoSugerido = cot?.contacto_principal?.correo || cot?.contacto?.correo || '';
    setCorreoDestino(correoSugerido);
    setCorreoMensaje('');
    setModalCorreo(true);
  };

  const handleEnviarCorreo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`/cotizaciones/${id}/enviar-correo`, {
        to: correoDestino,
        mensaje: correoMensaje,
      });
      toast.success('Correo enviado');
      setModalCorreo(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo enviar el correo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Cargando...</div>;
  if (!cot) return null;

  const esEditable = cot.estado === 'borrador';
  const items = cot.items || [];
  const transiciones = TRANSICIONES[cot.estado] || [];
  const contactoMostrado = cot.contacto_principal || cot.contacto || null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={() => navigate('/cotizaciones')}
          className="mt-1 w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 transition shrink-0"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >←</button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-800">{cot.numero}</h2>
            <EstadoBadge estado={cot.estado} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
            <span
              className="text-blue-600 font-medium hover:underline cursor-pointer"
              onClick={() => navigate(`/clientes/${cot.cliente_id}`)}
            >
              {cot.cliente?.razon_social}
            </span>
            {contactoMostrado && <span>· {contactoMostrado.nombre}</span>}
            <span>· Fecha: {fmtDate(cot.fecha)}</span>
            {cot.fecha_vencimiento && <span>· Vence: {fmtDate(cot.fecha_vencimiento)}</span>}
          </div>
        </div>
        {/* Botones de transición */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDescargarPdf}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition bg-gray-700 hover:bg-gray-800 text-white"
          >
            Descargar PDF
          </button>
          {cot.archivo_propuesta_pdf && (
            <button
              onClick={handleDescargarPropuestaPdf}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Propuesta PDF
            </button>
          )}
          <button
            onClick={abrirModalCorreo}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Enviar por correo
          </button>
          {transiciones.map((t) => (
            <button
              key={t.value}
              onClick={() => handleCambiarEstado(t.value)}
              disabled={saving}
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition disabled:opacity-60 ${t.cls}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* ── Items ── */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Ítems de la cotización</h3>
              {esEditable && (
                <button
                  onClick={() => setModalItem(true)}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                >
                  <span>+</span> Agregar ítem
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-3xl mb-2">📦</p>
                <p className="text-sm">Sin ítems. {esEditable ? 'Agrega el primer ítem.' : ''}</p>
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cant.</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">P. Unit.</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subtotal</th>
                      {esEditable && <th className="px-4 py-3"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3.5 text-gray-700">{item.descripcion}</td>
                        <td className="px-4 py-3.5 text-right text-gray-500">{parseFloat(item.cantidad)}</td>
                        <td className="px-4 py-3.5 text-right text-gray-500">{fmt(item.precio_unitario, cot.moneda)}</td>
                        <td className="px-6 py-3.5 text-right font-semibold text-gray-800">{fmt(item.subtotal, cot.moneda)}</td>
                        {esEditable && (
                          <td className="px-4 py-3.5">
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => setEditItem(item)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition"
                              >Editar</button>
                              <button
                                onClick={() => setModalEliminarItem(item)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                              >×</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totales */}
                <div className="border-t border-gray-100 px-6 py-4 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{fmt(cot.subtotal, cot.moneda)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>IGV (18%)</span>
                    <span>{fmt(cot.igv, cot.moneda)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-800 pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-blue-700">{fmt(cot.monto, cot.moneda)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Sidebar info ── */}
        <div className="space-y-4">
          {/* Resumen */}
          <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold text-gray-800 text-sm">Resumen</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Cliente</span>
                <span className="text-gray-700 font-medium text-right max-w-[60%] truncate">{cot.cliente?.razon_social}</span>
              </div>
              {contactoMostrado && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Contacto</span>
                  <span className="text-gray-700">{contactoMostrado.nombre}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Ejecutivo</span>
                <span className="text-gray-700">{cot.ejecutivo?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fecha</span>
                <span className="text-gray-700">{fmtDate(cot.fecha)}</span>
              </div>
              {cot.fecha_vencimiento && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Vencimiento</span>
                  <span className={`font-medium ${new Date(cot.fecha_vencimiento) < new Date() && cot.estado === 'enviado' ? 'text-red-500' : 'text-gray-700'}`}>
                    {fmtDate(cot.fecha_vencimiento)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-400">Ítems</span>
                <span className="text-gray-700">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Moneda</span>
                <span className="text-gray-700">{cot.moneda === 'USD' ? 'USD ($)' : 'PEN (S/)'} </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo</span>
                <span className="text-gray-700 capitalize">{cot.tipo || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="font-bold text-blue-700 text-sm">{fmt(cot.monto, cot.moneda)}</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {cot.observaciones && (
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="font-semibold text-gray-800 text-sm mb-2">Observaciones</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{cot.observaciones}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold text-gray-800 text-sm mb-2">Propuesta económica</h3>
            {cot.archivo_propuesta_pdf ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Archivo PDF adjunto</p>
                <button
                  onClick={handleDescargarPropuestaPdf}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                >
                  Descargar propuesta
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No hay propuesta económica adjunta.</p>
            )}
            {esEditable && (
              <div className="mt-3">
                <input
                  ref={filePropuestaRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={handleSubirPropuestaPdf}
                />
                <button
                  onClick={() => filePropuestaRef.current?.click()}
                  disabled={saving}
                  className="w-full border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
                >
                  {cot.archivo_propuesta_pdf ? 'Reemplazar propuesta PDF' : 'Adjuntar propuesta PDF'}
                </button>
              </div>
            )}
          </div>

          {/* Flujo de estado */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Flujo de estado</h3>
            <div className="space-y-2">
              {['borrador', 'enviado', 'aprobado'].map((e, i) => {
                const estados = ['borrador', 'enviado', 'aprobado', 'rechazado'];
                const idx = estados.indexOf(cot.estado);
                const eIdx = i;
                const done = (cot.estado === 'aprobado' && eIdx <= 2) ||
                             (cot.estado === 'enviado' && eIdx <= 1) ||
                             (cot.estado === 'borrador' && eIdx === 0);
                const current = cot.estado === e;
                return (
                  <div key={e} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                      ${current ? 'bg-blue-600 text-white' : done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {done && !current ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs capitalize ${current ? 'text-gray-800 font-semibold' : done ? 'text-gray-500' : 'text-gray-300'}`}>{e}</span>
                  </div>
                );
              })}
              {cot.estado === 'rechazado' && (
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-600 shrink-0">✗</div>
                  <span className="text-xs text-red-600 font-semibold">Rechazado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal agregar ítem */}
      <Modal open={modalItem} onClose={() => setModalItem(false)} title="Agregar ítem">
        <ItemForm onSubmit={handleAgregarItem} loading={saving} moneda={cot.moneda} />
      </Modal>

      {/* Modal editar ítem */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Editar ítem">
        <ItemForm initial={editItem} onSubmit={handleEditarItem} loading={saving} moneda={cot.moneda} />
      </Modal>

      {/* Modal confirmar eliminar ítem */}
      <Modal open={!!modalEliminarItem} onClose={() => setModalEliminarItem(null)} title="Eliminar ítem">
        {modalEliminarItem && (
          <div>
            <p className="text-sm text-gray-600 mb-1">¿Eliminar <strong>{modalEliminarItem.descripcion}</strong>?</p>
            <p className="text-xs text-gray-400 mb-5">Se recalcularán los totales automáticamente.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalEliminarItem(null)} className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={handleEliminarItem} disabled={saving} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
                {saving ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalCorreo} onClose={() => setModalCorreo(false)} title="Enviar cotización por correo">
        <form onSubmit={handleEnviarCorreo} className="space-y-3">
          <div>
            <label className={labelCls}>Correo destino *</label>
            <input
              type="email"
              className={inputCls}
              value={correoDestino}
              onChange={(e) => setCorreoDestino(e.target.value)}
              required
              placeholder="cliente@empresa.com"
            />
          </div>
          <div>
            <label className={labelCls}>Mensaje (opcional)</label>
            <textarea
              className={inputCls}
              rows={4}
              value={correoMensaje}
              onChange={(e) => setCorreoMensaje(e.target.value)}
              placeholder="Estimado cliente, adjuntamos la cotización..."
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
          >
            {saving ? 'Enviando...' : 'Enviar correo'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CotizacionDetallePage;
