const { Cliente, Contacto, Cotizacion, Orden, Factura, Actividad, Oportunidad, Ejecutivo } = require('../models');

const filtroEjecutivo = (req) =>
  req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id };
const ESTADOS_CLIENTE_VALIDOS = ['prospecto', 'cliente'];

const resolverEstadoCliente = (value) => {
  if (!value) return 'prospecto';
  const normalizado = String(value).toLowerCase().trim();
  return ESTADOS_CLIENTE_VALIDOS.includes(normalizado) ? normalizado : null;
};

const resolverEjecutivoAsignado = async (req, ejecutivoIdBody) => {
  if (req.user.rol !== 'admin') return req.user.id;
  const ejecutivoId = Number(ejecutivoIdBody);
  if (!ejecutivoId || Number.isNaN(ejecutivoId)) return null;
  const ejecutivo = await Ejecutivo.findByPk(ejecutivoId);
  if (!ejecutivo || !ejecutivo.activo) return null;
  return ejecutivo.id;
};

const buscarClientePorRuc = async (ruc) => Cliente.findOne({
  where: { ruc },
  include: [{ model: Ejecutivo, as: 'ejecutivo', attributes: ['nombre', 'apellido'] }],
});

const mensajeClienteDuplicado = (cliente) => {
  const nombreEjecutivo = `${cliente?.ejecutivo?.nombre || ''} ${cliente?.ejecutivo?.apellido || ''}`.trim() || 'Sin asignar';
  return `El cliente ya existe y le pertenece al ejecutivo: ${nombreEjecutivo}`;
};

const listar = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: { activo: true, ...filtroEjecutivo(req) },
      include: [{ model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] }],
      order: [['fecha_registro', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const ruc = String(req.body.ruc || '').trim();
    if (!ruc) return res.status(400).json({ message: 'RUC requerido' });

    const clienteExistente = await buscarClientePorRuc(ruc);
    if (clienteExistente) {
      return res.status(409).json({ message: mensajeClienteDuplicado(clienteExistente) });
    }

    const estado_cliente = resolverEstadoCliente(req.body.estado_cliente);
    if (!estado_cliente) {
      return res.status(400).json({ message: 'estado_cliente debe ser "prospecto" o "cliente"' });
    }

    const ejecutivoAsignado = await resolverEjecutivoAsignado(req, req.body.ejecutivo_id);
    if (!ejecutivoAsignado) {
      return res.status(400).json({ message: 'Debes asignar un ejecutivo activo al cliente' });
    }

    const data = {
      ...req.body,
      ruc,
      estado_cliente,
      ejecutivo_id: ejecutivoAsignado,
    };
    const cliente = await Cliente.create(data);
    res.status(201).json(cliente);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const ruc = String(req.body.ruc || '').trim();
      const clienteExistente = await buscarClientePorRuc(ruc);
      if (clienteExistente) {
        return res.status(409).json({ message: mensajeClienteDuplicado(clienteExistente) });
      }
      return res.status(409).json({ message: 'El RUC ya está registrado' });
    }
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [{ model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] }],
    });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    if (req.user.rol !== 'admin' && cliente.ejecutivo_id !== req.user.id)
      return res.status(403).json({ message: 'Sin acceso' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const historial = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [
        { model: Contacto, as: 'contactos', where: { activo: true }, required: false },
        { model: Cotizacion, as: 'cotizaciones', order: [['fecha', 'DESC']], required: false },
        { model: Orden, as: 'ordenes', order: [['fecha', 'DESC']], required: false },
        { model: Factura, as: 'facturas', order: [['fecha', 'DESC']], required: false },
        { model: Actividad, as: 'actividades', order: [['fecha', 'DESC']], limit: 10, required: false },
        { model: Oportunidad, as: 'oportunidades', required: false },
      ],
    });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    if (req.user.rol !== 'admin' && cliente.ejecutivo_id !== req.user.id)
      return res.status(403).json({ message: 'Sin acceso' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    if (req.user.rol !== 'admin' && cliente.ejecutivo_id !== req.user.id)
      return res.status(403).json({ message: 'Sin acceso' });

    const data = { ...req.body };
    if (data.estado_cliente !== undefined) {
      const estado_cliente = resolverEstadoCliente(data.estado_cliente);
      if (!estado_cliente) {
        return res.status(400).json({ message: 'estado_cliente debe ser "prospecto" o "cliente"' });
      }
      data.estado_cliente = estado_cliente;
    }

    if (req.user.rol !== 'admin') {
      delete data.ejecutivo_id;
    } else if (data.ejecutivo_id !== undefined) {
      const ejecutivoAsignado = await resolverEjecutivoAsignado(req, data.ejecutivo_id);
      if (!ejecutivoAsignado) {
        return res.status(400).json({ message: 'El ejecutivo asignado no es válido o está inactivo' });
      }
      data.ejecutivo_id = ejecutivoAsignado;
    }

    await cliente.update(data);
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const desactivar = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    await cliente.update({ activo: false });
    res.json({ message: 'Cliente desactivado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const asignarEjecutivo = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    const ejecutivoAsignado = await resolverEjecutivoAsignado(req, req.body.ejecutivo_id);
    if (!ejecutivoAsignado) {
      return res.status(400).json({ message: 'Debes seleccionar un ejecutivo activo válido' });
    }

    await cliente.update({ ejecutivo_id: ejecutivoAsignado });
    const actualizado = await Cliente.findByPk(cliente.id, {
      include: [{ model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] }],
    });
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listar, crear, obtener, historial, actualizar, desactivar, asignarEjecutivo };
