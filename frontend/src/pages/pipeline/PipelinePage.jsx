import { useEffect, useMemo, useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'react-toastify';
import axios from '../../api/axiosInstance';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const ETAPAS = [
  { id: 'prospecto', label: 'Prospecto', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'cotizado', label: 'Cotizado', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'negociacion', label: 'Negociación', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'ganado', label: 'Ganado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'perdido', label: 'Perdido', color: 'bg-rose-100 text-rose-700 border-rose-200' },
];

const fmtMoney = (n) => `S/ ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const Card = ({ oportunidad }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `op-${oportunidad.id}`,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm cursor-grab active:cursor-grabbing"
    >
      <p className="text-sm font-semibold text-gray-800">{oportunidad.nombre}</p>
      <p className="text-xs text-gray-500 mt-1">{oportunidad.cliente?.razon_social || 'Sin cliente'}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-blue-700 font-semibold">{fmtMoney(oportunidad.monto_estimado)}</span>
        <span className="text-gray-500">{Number(oportunidad.probabilidad || 0)}%</span>
      </div>
    </div>
  );
};

const Columna = ({ etapa, items }) => {
  const { setNodeRef, isOver } = useDroppable({ id: etapa.id });
  const total = items.reduce((acc, it) => acc + Number(it.monto_estimado || 0), 0);

  return (
    <div className="min-w-[250px] flex-1">
      <div className={`rounded-xl border px-3 py-2 text-xs font-semibold inline-flex ${etapa.color}`}>
        {etapa.label} · {items.length}
      </div>
      <div className="text-xs text-gray-500 mt-1 mb-2">{fmtMoney(total)}</div>
      <div
        ref={setNodeRef}
        className={`rounded-2xl p-3 min-h-[380px] transition border ${
          isOver ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent'
        }`}
      >
        <div className="space-y-2">
          {items.map((op) => <Card key={op.id} oportunidad={op} />)}
          {items.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-8">Sin oportunidades</div>
          )}
        </div>
      </div>
    </div>
  );
};

const PipelinePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [oportunidades, setOportunidades] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    cliente_id: '',
    monto_estimado: '',
    probabilidad: 30,
    fecha_cierre_est: '',
    observaciones: '',
  });

  const cargar = async () => {
    setLoading(true);
    try {
      const [resClientes, resOps] = await Promise.all([
        axios.get('/clientes'),
        axios.get('/oportunidades'),
      ]);
      setClientes(resClientes.data || []);
      setOportunidades(resOps.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo cargar el pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const porEtapa = useMemo(() => {
    const base = {};
    ETAPAS.forEach((e) => { base[e.id] = []; });
    (oportunidades || []).forEach((op) => {
      const key = ETAPAS.some((e) => e.id === op.etapa) ? op.etapa : 'prospecto';
      base[key].push(op);
    });
    return base;
  }, [oportunidades]);

  const crearOportunidad = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        cliente_id: Number(form.cliente_id),
        monto_estimado: form.monto_estimado || null,
        probabilidad: Number(form.probabilidad || 0),
        fecha_cierre_est: form.fecha_cierre_est || null,
        observaciones: form.observaciones || null,
      };
      await axios.post('/oportunidades', payload);
      toast.success('Oportunidad creada');
      setForm({
        nombre: '',
        cliente_id: '',
        monto_estimado: '',
        probabilidad: 30,
        fecha_cierre_est: '',
        observaciones: '',
      });
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo crear la oportunidad');
    } finally {
      setSaving(false);
    }
  };

  const moverEtapa = async (id, nuevaEtapa) => {
    const anterior = oportunidades;
    setOportunidades((prev) => prev.map((op) => (op.id === id ? { ...op, etapa: nuevaEtapa } : op)));
    try {
      await axios.patch(`/oportunidades/${id}/etapa`, { etapa: nuevaEtapa });
    } catch (err) {
      setOportunidades(anterior);
      toast.error(err.response?.data?.message || 'No se pudo actualizar etapa');
    }
  };

  const onDragEnd = async ({ active, over }) => {
    if (!over?.id || !active?.id) return;
    const id = String(active.id).replace('op-', '');
    const targetEtapa = String(over.id);
    const oportunidad = oportunidades.find((op) => String(op.id) === id);
    if (!oportunidad || oportunidad.etapa === targetEtapa) return;
    await moverEtapa(oportunidad.id, targetEtapa);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pipeline</h2>
        <p className="text-gray-400 text-sm mt-0.5">Kanban comercial para controlar el avance de oportunidades.</p>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Nueva oportunidad</h3>
        <form onSubmit={crearOportunidad} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Nombre *</label>
              <input
                className={inputCls}
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                required
                placeholder="Renovación soporte TI"
              />
            </div>
            <div>
              <label className={labelCls}>Cliente *</label>
              <select
                className={inputCls}
                value={form.cliente_id}
                onChange={(e) => setForm((p) => ({ ...p, cliente_id: e.target.value }))}
                required
              >
                <option value="">Seleccionar</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Monto estimado</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.monto_estimado}
                onChange={(e) => setForm((p) => ({ ...p, monto_estimado: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Probabilidad (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className={inputCls}
                value={form.probabilidad}
                onChange={(e) => setForm((p) => ({ ...p, probabilidad: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Cierre estimado</label>
              <input
                type="date"
                className={inputCls}
                value={form.fecha_cierre_est}
                onChange={(e) => setForm((p) => ({ ...p, fecha_cierre_est: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Observaciones</label>
              <input
                className={inputCls}
                value={form.observaciones}
                onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
                placeholder="Detalle breve"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Crear oportunidad'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-gray-400">Cargando pipeline...</div>
      ) : (
        <DndContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {ETAPAS.map((etapa) => (
              <Columna key={etapa.id} etapa={etapa} items={porEtapa[etapa.id]} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
};

export default PipelinePage;
