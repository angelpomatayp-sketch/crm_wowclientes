import { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { toast } from 'react-toastify';

const fmtMoney = (n, moneda = 'PEN') => {
  const symbol = moneda === 'USD' ? '$' : 'S/';
  return `${symbol} ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
};
const COLORS = ['#1d4ed8', '#16a34a', '#f59e0b', '#ef4444', '#7c3aed', '#0d9488'];
const ESTADOS = ['borrador', 'enviado', 'aprobado', 'rechazado'];

const KpiCard = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
    <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{title}</p>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    {subtitle ? <p className="text-xs text-gray-500 mt-1">{subtitle}</p> : null}
  </div>
);

const ReportesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meses, setMeses] = useState(6);
  const [rango, setRango] = useState({ desde: '', hasta: '' });
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEjecutivo, setFiltroEjecutivo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroMoneda, setFiltroMoneda] = useState('');

  const [resumen, setResumen] = useState(null);
  const [ventasEjecutivo, setVentasEjecutivo] = useState([]);
  const [cotizacionesEstado, setCotizacionesEstado] = useState([]);
  const [conversionEjecutivo, setConversionEjecutivo] = useState([]);
  const [flujoMensual, setFlujoMensual] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [correlativo, setCorrelativo] = useState([]);
  const [correlativoLoading, setCorrelativoLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [ejecutivos, setEjecutivos] = useState([]);
  const [pageCorrelativo, setPageCorrelativo] = useState(1);
  const pageSizeCorrelativo = 10;

  const queryParams = useMemo(() => {
    const q = new URLSearchParams();
    if (rango.desde) q.set('desde', rango.desde);
    if (rango.hasta) q.set('hasta', rango.hasta);
    q.set('meses', String(meses));
    return q.toString();
  }, [rango, meses]);

  const queryParamsCorrelativo = useMemo(() => {
    const q = new URLSearchParams();
    if (rango.desde) q.set('desde', rango.desde);
    if (rango.hasta) q.set('hasta', rango.hasta);
    if (filtroCliente) q.set('cliente_id', filtroCliente);
    if (filtroEjecutivo) q.set('ejecutivo_id', filtroEjecutivo);
    if (filtroEstado) q.set('estado', filtroEstado);
    if (filtroTipo) q.set('tipo', filtroTipo);
    if (filtroMoneda) q.set('moneda', filtroMoneda);
    return q.toString();
  }, [rango, filtroCliente, filtroEjecutivo, filtroEstado, filtroTipo, filtroMoneda]);

  const cargar = async () => {
    setLoading(true);
    try {
      const [rResumen, rVentas, rEstado, rConv, rFlujo, rTop] = await Promise.all([
        axios.get(`/reportes/resumen?${queryParams}`),
        axios.get(`/reportes/ventas-por-ejecutivo?${queryParams}`),
        axios.get(`/reportes/cotizaciones-por-estado?${queryParams}`),
        axios.get(`/reportes/conversion-por-ejecutivo?${queryParams}`),
        axios.get(`/reportes/flujo-mensual?meses=${meses}`),
        axios.get(`/reportes/top-clientes?${queryParams}`),
      ]);

      setResumen(rResumen.data);
      setVentasEjecutivo(rVentas.data);
      setCotizacionesEstado(rEstado.data);
      setConversionEjecutivo(rConv.data);
      setFlujoMensual(rFlujo.data);
      setTopClientes(rTop.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const cargarCorrelativo = async () => {
    setCorrelativoLoading(true);
    try {
      const { data } = await axios.get(`/reportes/correlativo-cotizaciones?${queryParamsCorrelativo}`);
      setCorrelativo(data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo cargar el correlativo');
    } finally {
      setCorrelativoLoading(false);
    }
  };

  const cargarListas = async () => {
    try {
      const [resClientes, resEjecutivos] = await Promise.all([
        axios.get('/clientes'),
        user?.rol === 'admin' ? axios.get('/ejecutivos') : Promise.resolve({ data: [] }),
      ]);
      setClientes(resClientes.data || []);
      setEjecutivos(resEjecutivos.data || []);
    } catch {
      // Silencioso para no bloquear
    }
  };

  useEffect(() => { cargar(); }, [queryParams, meses]);
  useEffect(() => { cargarCorrelativo(); }, [queryParamsCorrelativo]);
  useEffect(() => { cargarListas(); }, [user?.rol]);
  useEffect(() => { setPageCorrelativo(1); }, [queryParamsCorrelativo]);

  const dataVentas = ventasEjecutivo.map((r) => ({
    ejecutivo: [r.ejecutivo?.nombre, r.ejecutivo?.apellido].filter(Boolean).join(' ') || `ID ${r.ejecutivo_id}`,
    total: Number(r.total || 0),
    cantidad: Number(r.cantidad || 0),
  }));

  const dataEstado = cotizacionesEstado.map((r) => ({
    estado: r.estado,
    cantidad: Number(r.cantidad || 0),
    total: Number(r.total || 0),
  }));

  const dataConversion = conversionEjecutivo.map((r) => ({
    ejecutivo: [r.ejecutivo?.nombre, r.ejecutivo?.apellido].filter(Boolean).join(' ') || `ID ${r.ejecutivo_id}`,
    conversion: Number(r.conversion || 0),
    aprobadas: Number(r.aprobadas || 0),
    rechazadas: Number(r.rechazadas || 0),
    total: Number(r.total_cotizaciones || 0),
  }));

  const dataTopClientes = topClientes.map((r) => ({
    cliente: r.cliente?.razon_social || `Cliente ${r.cliente_id}`,
    total: Number(r.total || 0),
    facturas: Number(r.facturas || 0),
  }));

  const totalPagesCorrelativo = Math.max(1, Math.ceil(correlativo.length / pageSizeCorrelativo));
  useEffect(() => {
    if (pageCorrelativo > totalPagesCorrelativo) setPageCorrelativo(totalPagesCorrelativo);
  }, [pageCorrelativo, totalPagesCorrelativo]);
  const correlativoPaginado = correlativo.slice(
    (pageCorrelativo - 1) * pageSizeCorrelativo,
    pageCorrelativo * pageSizeCorrelativo
  );

  const exportarPdf = async () => {
    try {
      const res = await axios.get(`/reportes/correlativo-cotizaciones/pdf?${queryParamsCorrelativo}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'correlativo-cotizaciones.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo exportar el PDF');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reportes</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {user?.rol === 'admin' ? 'Visión global y por ejecutivo' : 'Tu desempeño comercial'}
          </p>
        </div>

        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={rango.desde}
              onChange={(e) => setRango((p) => ({ ...p, desde: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={rango.hasta}
              onChange={(e) => setRango((p) => ({ ...p, hasta: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cliente</label>
            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.razon_social}</option>
              ))}
            </select>
          </div>
          {user?.rol === 'admin' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ejecutivo</label>
              <select
                value={filtroEjecutivo}
                onChange={(e) => setFiltroEjecutivo(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {ejecutivos.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Moneda</label>
            <select
              value={filtroMoneda}
              onChange={(e) => setFiltroMoneda(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              <option value="PEN">PEN (S/)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Meses flujo</label>
            <select
              value={meses}
              onChange={(e) => setMeses(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
                {[6, 9, 12].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading || !resumen ? (
        <div className="bg-white rounded-2xl p-10 text-gray-400">Cargando reportes...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
            <KpiCard title="Clientes" value={resumen.clientes} />
            <KpiCard title="Cotizaciones" value={resumen.cotizaciones} />
            <KpiCard title="Aprobadas" value={resumen.cotizaciones_aprobadas} subtitle={`Conversión ${resumen.conversion}%`} />
            <KpiCard title="Órdenes" value={resumen.ordenes} />
            <KpiCard title="Facturas" value={resumen.facturas} />
            <KpiCard title="Facturado" value={fmtMoney(resumen.total_facturado)} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Ventas por Ejecutivo</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataVentas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ejecutivo" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(v) => fmtMoney(v)} />
                    <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Cotizaciones por Estado</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataEstado} dataKey="cantidad" nameKey="estado" outerRadius={95} label>
                      {dataEstado.map((entry, idx) => (
                        <Cell key={entry.estado} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Flujo Mensual</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={flujoMensual}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cotizaciones" stroke="#2563eb" strokeWidth={2} />
                    <Line type="monotone" dataKey="ordenes" stroke="#16a34a" strokeWidth={2} />
                    <Line type="monotone" dataKey="facturas" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Clientes por Facturación</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataTopClientes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="cliente" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => fmtMoney(v)} />
                    <Bar dataKey="total" fill="#0f766e" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Conversión por Ejecutivo</h3>
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Ejecutivo</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Cotizaciones</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Aprobadas</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Rechazadas</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Conversión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataConversion.map((r) => (
                    <tr key={r.ejecutivo}>
                      <td className="px-4 py-3 text-gray-700">{r.ejecutivo}</td>
                      <td className="px-4 py-3 text-right">{r.total}</td>
                      <td className="px-4 py-3 text-right">{r.aprobadas}</td>
                      <td className="px-4 py-3 text-right">{r.rechazadas}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">{r.conversion}%</td>
                    </tr>
                  ))}
                  {dataConversion.length === 0 && (
                    <tr><td className="px-4 py-6 text-center text-gray-400" colSpan={5}>Sin datos para el rango seleccionado</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl p-5 mt-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Correlativo de cotizaciones</h3>
                <button
                  type="button"
                  onClick={exportarPdf}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Exportar PDF
                </button>
              </div>
              {correlativoLoading ? (
                <div className="py-8 text-sm text-gray-400">Cargando correlativo...</div>
              ) : correlativo.length === 0 ? (
                <div className="py-8 text-sm text-gray-400">Sin registros para el filtro aplicado</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Correlativo</th>
                        <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Fecha</th>
                        <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Cliente</th>
                        <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Descripción</th>
                        <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Ejecutivo</th>
                        <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Tipo</th>
                        <th className="text-right px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Prec. Vta</th>
                        <th className="text-right px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">IGV</th>
                        <th className="text-right px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Prec. Tot</th>
                        <th className="text-center px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Margen %</th>
                        <th className="text-center px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Util Aprox</th>
                        <th className="text-center px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Prob. cierre</th>
                        <th className="text-center px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Fecha cierre</th>
                        <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {correlativoPaginado.map((r) => (
                        <tr key={`${r.correlativo}-${r.fecha}`} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-2 font-mono text-[11px]">{r.correlativo}</td>
                          <td className="px-3 py-2">{r.fecha ? new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-PE') : '—'}</td>
                          <td className="px-3 py-2">{r.cliente || '—'}</td>
                          <td className="px-3 py-2 max-w-[280px]">{r.descripcion || '—'}</td>
                          <td className="px-3 py-2">{r.ejecutivo || '—'}</td>
                          <td className="px-3 py-2 capitalize">{r.tipo || '—'}</td>
                          <td className="px-3 py-2 text-right">{fmtMoney(r.prec_venta, r.moneda)}</td>
                          <td className="px-3 py-2 text-right">{fmtMoney(r.igv, r.moneda)}</td>
                          <td className="px-3 py-2 text-right">{fmtMoney(r.prec_total, r.moneda)}</td>
                          <td className="px-3 py-2 text-center">—</td>
                          <td className="px-3 py-2 text-center">—</td>
                          <td className="px-3 py-2 text-center">—</td>
                          <td className="px-3 py-2 text-center">—</td>
                          <td className="px-3 py-2">{r.observaciones || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!correlativoLoading && correlativo.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-gray-400">
                      Mostrando {(pageCorrelativo - 1) * pageSizeCorrelativo + 1}-
                      {Math.min(correlativo.length, pageCorrelativo * pageSizeCorrelativo)} de {correlativo.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPageCorrelativo((p) => Math.max(1, p - 1))}
                        disabled={pageCorrelativo <= 1}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
                      >
                        Anterior
                      </button>
                      <span className="text-xs text-gray-500">{pageCorrelativo} / {totalPagesCorrelativo}</span>
                      <button
                        type="button"
                        onClick={() => setPageCorrelativo((p) => Math.min(totalPagesCorrelativo, p + 1))}
                        disabled={pageCorrelativo >= totalPagesCorrelativo}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportesPage;
