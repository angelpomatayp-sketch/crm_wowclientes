const { Op } = require('sequelize');
const { Orden, Cotizacion, Cliente, Ejecutivo, Contacto } = require('../models');

const filtroEjecutivo = (req) =>
  req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id };

const validarAcceso = (req, ejecutivoId) => req.user.rol === 'admin' || Number(ejecutivoId) === Number(req.user.id);

const listarCotizacionesAprobadasDisponibles = async (req, res) => {
  try {
    const whereCot = {
      estado: 'aprobado',
      ...(req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id }),
    };

    const ordenes = await Orden.findAll({ attributes: ['cotizacion_id'], raw: true });
    const idsConOrden = ordenes
      .map((o) => o.cotizacion_id)
      .filter((id) => id !== null && id !== undefined);

    if (idsConOrden.length > 0) {
      whereCot.id = { [Op.notIn]: idsConOrden };
    }

    const cotizaciones = await Cotizacion.findAll({
      where: whereCot,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social', 'ruc'] },
        { model: Contacto, as: 'contacto', attributes: ['id', 'nombre'], required: false },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] },
      ],
      order: [['fecha', 'DESC']],
    });

    res.json(cotizaciones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listar = async (req, res) => {
  try {
    const ordenes = await Orden.findAll({
      where: filtroEjecutivo(req),
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Cotizacion, as: 'cotizacion', attributes: ['id', 'numero'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] },
      ],
      order: [['fecha', 'DESC']],
    });
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const { cotizacion_id, numero_orden, fecha, monto, observaciones } = req.body;

    if (!cotizacion_id) return res.status(400).json({ message: 'La cotización es requerida' });
    if (!numero_orden?.trim()) return res.status(400).json({ message: 'El número de orden/servicio es requerido' });
    if (!fecha) return res.status(400).json({ message: 'La fecha de recepción es requerida' });
    if (!req.file) return res.status(400).json({ message: 'Debes adjuntar el PDF de la orden/servicio recibida' });

    const cot = await Cotizacion.findByPk(cotizacion_id);
    if (!cot || cot.estado !== 'aprobado')
      return res.status(400).json({ message: 'La cotización debe estar aprobada' });

    if (!validarAcceso(req, cot.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso a esta cotización' });

    const yaExiste = await Orden.findOne({ where: { cotizacion_id } });
    if (yaExiste) {
      return res.status(400).json({ message: 'Esta cotización ya tiene una orden registrada' });
    }

    const archivo_orden = `/uploads/ordenes/${req.file.filename}`;
    const orden = await Orden.create({
      numero_orden: numero_orden.trim(),
      cotizacion_id,
      cliente_id: cot.cliente_id,
      fecha,
      monto: monto || cot.monto,
      observaciones,
      archivo_orden,
      ejecutivo_id: cot.ejecutivo_id,
    });

    const detalle = await Orden.findByPk(orden.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Cotizacion, as: 'cotizacion', attributes: ['id', 'numero', 'monto'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] },
      ],
    });

    res.status(201).json(detalle);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El número de orden ya existe' });
    }
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social', 'ruc'] },
        { model: Cotizacion, as: 'cotizacion', attributes: ['id', 'numero', 'monto'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] },
      ],
    });
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    if (!validarAcceso(req, orden.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    res.json(orden);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    if (!validarAcceso(req, orden.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });

    const data = { ...req.body };
    if (data.numero_orden && typeof data.numero_orden === 'string') {
      data.numero_orden = data.numero_orden.trim();
    }
    if (req.file) {
      data.archivo_orden = `/uploads/ordenes/${req.file.filename}`;
    }

    await orden.update(data);
    res.json(orden);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El número de orden ya existe' });
    }
    res.status(500).json({ message: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    if (!validarAcceso(req, orden.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    await orden.destroy();
    res.json({ message: 'Orden eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listarCotizacionesAprobadasDisponibles, listar, crear, obtener, actualizar, eliminar };
