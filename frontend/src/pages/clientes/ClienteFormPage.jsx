import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const EMPTY = {
  ruc: '', razon_social: '', nombre_comercial: '',
  direccion: '', telefono: '', web: '',
  estado_cliente: 'prospecto',
  ejecutivo_id: '', fecha_registro: new Date().toISOString().split('T')[0],
};

const ClienteFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(esEdicion);

  // SUNAT lookup state
  const [sunatLoading, setSunatLoading] = useState(false);
  const [sunatStatus, setSunatStatus] = useState(null); // { estado, condicion } | null
  const sunatTimeout = useRef(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (esEdicion) {
      axios.get(`/clientes/${id}`)
        .then(({ data }) => setForm({
          ruc: data.ruc || '',
          razon_social: data.razon_social || '',
          nombre_comercial: data.nombre_comercial || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          web: data.web || '',
          estado_cliente: data.estado_cliente || 'prospecto',
          ejecutivo_id: data.ejecutivo_id || '',
          fecha_registro: data.fecha_registro || EMPTY.fecha_registro,
        }))
        .catch(() => toast.error('Error al cargar cliente'))
        .finally(() => setLoadingData(false));
    }
  }, []);

  // Auto-lookup when RUC reaches 11 digits
  const handleRucChange = (value) => {
    set('ruc', value);
    setSunatStatus(null);

    if (sunatTimeout.current) clearTimeout(sunatTimeout.current);

    if (value.length === 11 && /^\d{11}$/.test(value)) {
      sunatTimeout.current = setTimeout(() => buscarRuc(value), 600);
    }
  };

  const buscarRuc = async (ruc) => {
    setSunatLoading(true);
    try {
      const { data } = await axios.get(`/sunat/ruc/${ruc}`);
      setForm((prev) => ({
        ...prev,
        razon_social:     data.razon_social     || prev.razon_social,
        nombre_comercial: data.nombre_comercial || prev.nombre_comercial,
        direccion:        data.direccion        || prev.direccion,
      }));
      setSunatStatus({ estado: data.estado, condicion: data.condicion });
      toast.success('Datos cargados desde SUNAT');
    } catch {
      toast.warning('RUC no encontrado en SUNAT. Puedes ingresar los datos manualmente.');
    } finally {
      setSunatLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.ejecutivo_id;

      if (esEdicion) {
        await axios.put(`/clientes/${id}`, payload);
        toast.success('Cliente actualizado');
      } else {
        await axios.post('/clientes', payload);
        toast.success('Cliente creado');
      }
      navigate('/clientes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="flex items-center justify-center py-20 text-gray-400">Cargando...</div>;
  }

  const estadoColor = sunatStatus?.estado === 'ACTIVO'
    ? 'bg-green-50 text-green-700 border-green-200'
    : sunatStatus?.estado
    ? 'bg-red-50 text-red-700 border-red-200'
    : '';

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/clientes')}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300 transition"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          ←
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <p className="text-gray-400 text-sm">
            {esEdicion ? 'Actualiza la información de la empresa' : 'Registra una nueva empresa en el CRM'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card datos principales */}
        <div className="bg-white rounded-2xl p-6 mb-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Datos de la empresa
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* RUC con indicador SUNAT */}
            <div>
              <label className={labelCls}>RUC *</label>
              <div className="relative">
                <input
                  className={inputCls}
                  value={form.ruc}
                  onChange={(e) => handleRucChange(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  required
                  placeholder="20100011122"
                />
                {sunatLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {/* Badge SUNAT */}
              {sunatStatus && (
                <div className={`mt-1.5 flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg border ${estadoColor}`}>
                  <span className="font-semibold">{sunatStatus.estado}</span>
                  {sunatStatus.condicion && (
                    <span className="opacity-70">· {sunatStatus.condicion}</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Fecha de registro</label>
              <input
                type="date"
                className={inputCls}
                value={form.fecha_registro}
                onChange={(e) => set('fecha_registro', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Estado comercial</label>
              <select
                className={inputCls}
                value={form.estado_cliente}
                onChange={(e) => set('estado_cliente', e.target.value)}
              >
                <option value="prospecto">Prospecto</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Razón social *</label>
              <input
                className={inputCls}
                value={form.razon_social}
                onChange={(e) => set('razon_social', e.target.value)}
                required
                placeholder="WOW Technologies S.A.C."
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Nombre comercial</label>
              <input
                className={inputCls}
                value={form.nombre_comercial}
                onChange={(e) => set('nombre_comercial', e.target.value)}
                placeholder="WOW Tech"
              />
            </div>
          </div>
        </div>

        {/* Card contacto */}
        <div className="bg-white rounded-2xl p-6 mb-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
            Contacto y ubicación
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Teléfono</label>
              <input
                className={inputCls}
                value={form.telefono}
                onChange={(e) => set('telefono', e.target.value)}
                placeholder="01-4441234"
              />
            </div>
            <div>
              <label className={labelCls}>Sitio web</label>
              <input
                className={inputCls}
                value={form.web}
                onChange={(e) => set('web', e.target.value)}
                placeholder="www.empresa.com"
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Dirección</label>
              <input
                className={inputCls}
                value={form.direccion}
                onChange={(e) => set('direccion', e.target.value)}
                placeholder="Av. Principal 123, Lima"
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md shadow-blue-200 transition disabled:opacity-60"
          >
            {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClienteFormPage;
