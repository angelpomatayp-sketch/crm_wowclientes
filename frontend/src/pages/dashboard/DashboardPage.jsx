import { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar,
} from 'recharts';

const KpiCard = ({ label, value, color, icon, bg }) => (
  <div
    className="bg-white flex items-center gap-4 p-6"
    style={{
      borderRadius: '16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
      borderLeft: `4px solid ${color}`,
    }}
  >
    <div
      className="flex items-center justify-center shrink-0"
      style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg }}
    >
      <span style={{ fontSize: '22px' }}>{icon}</span>
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clientes: 0,
    cotizaciones: 0,
    ordenes: 0,
    facturas: 0,
    total_facturado: 0,
    total_facturado_usd: 0,
    conversion: 0,
    recordatorios: 0,
  });
  const [estadoCot, setEstadoCot] = useState([]);
  const [topEjecutivo, setTopEjecutivo] = useState(null);
  const [topCliente, setTopCliente] = useState(null);
  const [flujoMensual, setFlujoMensual] = useState([]);
  const [ventasEjecutivo, setVentasEjecutivo] = useState([]);
  const [conversionEjecutivo, setConversionEjecutivo] = useState([]);

  const fmtMoney = (n) => `S/ ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

  const estadoMap = useMemo(() => {
    const base = { borrador: 0, enviado: 0, aprobado: 0, rechazado: 0 };
    (estadoCot || []).forEach((e) => { base[e.estado] = Number(e.cantidad || 0); });
    return base;
  }, [estadoCot]);

  useEffect(() => {
    Promise.all([
      axios.get('/reportes/resumen'),
      axios.get('/reportes/cotizaciones-por-estado'),
      axios.get('/reportes/ventas-por-ejecutivo'),
      axios.get('/reportes/conversion-por-ejecutivo'),
      axios.get('/reportes/flujo-mensual?meses=6'),
      axios.get('/reportes/top-clientes?limit=1'),
      axios.get('/recordatorios'),
    ]).then(([resumen, estados, ventas, conversion, flujo, topClientes, rec]) => {
      const r = resumen.data || {};
      const rankingEjecutivos = (ventas.data || [])
        .map((x) => ({
          nombre: [x.ejecutivo?.nombre, x.ejecutivo?.apellido].filter(Boolean).join(' '),
          total: Number(x.total || 0),
        }))
        .sort((a, b) => b.total - a.total);

      setStats({
        clientes: r.clientes || 0,
        cotizaciones: r.cotizaciones || 0,
        ordenes: r.ordenes || 0,
        facturas: r.facturas || 0,
        total_facturado: Number(r.total_facturado || 0),
        total_facturado_usd: Number(r.total_facturado_usd || 0),
        conversion: Number(r.conversion || 0),
        recordatorios: rec.data.filter((r) => !r.completado).length,
      });
      setEstadoCot(estados.data || []);
      setVentasEjecutivo(ventas.data || []);
      setConversionEjecutivo(conversion.data || []);
      setFlujoMensual(flujo.data || []);
      setTopEjecutivo(rankingEjecutivos[0] || null);
      setTopCliente((topClientes.data || [])[0] || null);
      setLoading(false);
    }).catch(() => {});
  }, []);

  const dataEstadoBar = useMemo(
    () => (estadoCot || []).map((e) => ({ estado: e.estado, cantidad: Number(e.cantidad || 0) })),
    [estadoCot]
  );

  const dataVentasBar = useMemo(
    () =>
      (ventasEjecutivo || [])
        .map((x) => ({
          ejecutivo: [x.ejecutivo?.nombre, x.ejecutivo?.apellido].filter(Boolean).join(' ') || `ID ${x.ejecutivo_id}`,
          total: Number(x.total || 0),
        }))
        .slice(0, 6),
    [ventasEjecutivo]
  );

  const dataConversionBar = useMemo(
    () =>
      (conversionEjecutivo || []).map((x) => ({
        ejecutivo: [x.ejecutivo?.nombre, x.ejecutivo?.apellido].filter(Boolean).join(' ') || `ID ${x.ejecutivo_id}`,
        conversion: Number(x.conversion || 0),
      })),
    [conversionEjecutivo]
  );

  if (loading) return <div className="text-gray-400">Cargando dashboard...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h2>
      <p className="text-gray-400 text-sm mb-8">
        {user?.rol === 'admin' ? 'Resumen comercial global' : 'Resumen comercial personal'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard label="Clientes activos"        value={stats.clientes}      color="#3b82f6" bg="#eff6ff" icon="🏢" />
        <KpiCard label="Cotizaciones"             value={stats.cotizaciones}  color="#f59e0b" bg="#fffbeb" icon="📄" />
        <KpiCard label="Órdenes de compra"        value={stats.ordenes}       color="#10b981" bg="#ecfdf5" icon="📦" />
        <KpiCard label="Facturas"                 value={stats.facturas}      color="#0ea5e9" bg="#ecfeff" icon="🧾" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
        <div className="grid grid-rows-2 gap-3">
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Facturación Total (Soles)</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{fmtMoney(stats.total_facturado)}</p>
            <p className="text-xs text-gray-500 mt-2">Conversión de cotizaciones: {stats.conversion}%</p>
          </div>
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Facturación Total (Dólares)</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">
              {`$ ${Number(stats.total_facturado_usd || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            </p>
            <p className="text-xs text-gray-500 mt-2">Facturas emitidas en USD</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Estados de Cotización</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Borrador</span><strong>{estadoMap.borrador}</strong></div>
            <div className="flex justify-between"><span className="text-gray-500">Enviado</span><strong>{estadoMap.enviado}</strong></div>
            <div className="flex justify-between"><span className="text-gray-500">Aprobado</span><strong className="text-green-700">{estadoMap.aprobado}</strong></div>
            <div className="flex justify-between"><span className="text-gray-500">Rechazado</span><strong className="text-red-600">{estadoMap.rechazado}</strong></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Indicadores rápidos</p>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Recordatorios pendientes</p>
              <p className="font-semibold text-gray-800">{stats.recordatorios}</p>
            </div>
            {user?.rol === 'admin' && topEjecutivo && (
              <div>
                <p className="text-gray-400 text-xs">Top ejecutivo (ventas)</p>
                <p className="font-semibold text-gray-800">{topEjecutivo.nombre}</p>
                <p className="text-blue-700 text-xs">{fmtMoney(topEjecutivo.total)}</p>
              </div>
            )}
            {topCliente && (
              <div>
                <p className="text-gray-400 text-xs">Top cliente (facturación)</p>
                <p className="font-semibold text-gray-800">{topCliente.cliente?.razon_social}</p>
                <p className="text-blue-700 text-xs">{fmtMoney(topCliente.total)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">Flujo Comercial (6 meses)</p>
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
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">
            {user?.rol === 'admin' ? 'Ventas por Ejecutivo' : 'Conversión personal y estado de cotizaciones'}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {user?.rol === 'admin' ? (
                <BarChart data={dataVentasBar}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ejecutivo" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtMoney(v)} />
                  <Bar dataKey="total" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={dataEstadoBar}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="estado" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {user?.rol === 'admin' && (
        <div className="bg-white rounded-2xl p-5 mt-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">Conversión por Ejecutivo</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataConversionBar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ejecutivo" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="conversion" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
