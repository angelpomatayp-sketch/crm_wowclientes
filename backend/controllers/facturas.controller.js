const { Op } = require('sequelize');
const { Factura, Orden, Cliente, Ejecutivo, Cotizacion } = require('../models');

const filtroEjecutivo = (req) =>
  req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id };

const validarAcceso = (req, ejecutivoId) =>
  req.user.rol === 'admin' || Number(ejecutivoId) === Number(req.user.id);

const listarOrdenesFacturables = async (req, res) => {
  try {
    const whereOrden = {
      ...(req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id }),
    };

    const facturas = await Factura.findAll({ attributes: ['orden_id'], raw: true });
    const idsFacturados = facturas
      .map((f) => f.orden_id)
      .filter((id) => id !== null && id !== undefined);

    if (idsFacturados.length > 0) {
      whereOrden.id = { [Op.notIn]: idsFacturados };
    }

    const ordenes = await Orden.findAll({
      where: whereOrden,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social', 'ruc'] },
        { model: Cotizacion, as: 'cotizacion', attributes: ['id', 'numero', 'monto'], required: false },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] },
      ],
      order: [['fecha', 'DESC']],
    });

    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listar = async (req, res) => {
  try {
    const facturas = await Factura.findAll({
      where: filtroEjecutivo(req),
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Orden, as: 'orden', attributes: ['id', 'numero_orden'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] },
      ],
      order: [['fecha', 'DESC']],
    });
    res.json(facturas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const {
      orden_id, numero_factura, fecha, subtotal, moneda,
    } = req.body;

    if (!orden_id) return res.status(400).json({ message: 'La orden es requerida' });
    if (!numero_factura?.trim()) return res.status(400).json({ message: 'El número de factura es requerido' });
    if (!fecha) return res.status(400).json({ message: 'La fecha de emisión es requerida' });
    if (!subtotal || Number(subtotal) <= 0) return res.status(400).json({ message: 'El subtotal es requerido' });
    if (!req.files?.archivo_pdf?.[0]) return res.status(400).json({ message: 'Debes adjuntar el PDF de SUNAT' });

    const orden = await Orden.findByPk(orden_id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    if (!validarAcceso(req, orden.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso a esta orden' });

    const existeEnOrden = await Factura.findOne({ where: { orden_id } });
    if (existeEnOrden) {
      return res.status(400).json({ message: 'Esta orden ya tiene una factura registrada' });
    }

    const subtotalNum = Number(subtotal);
    const igv = +(subtotalNum * 0.18).toFixed(2);
    const total = +(subtotalNum + igv).toFixed(2);

    const archivo_pdf = `/uploads/facturas/${req.files.archivo_pdf[0].filename}`;
    const archivo_xml = req.files?.archivo_xml?.[0]
      ? `/uploads/facturas/${req.files.archivo_xml[0].filename}`
      : null;

    const monedaValida = ['PEN', 'USD'].includes(moneda) ? moneda : 'PEN';

    const factura = await Factura.create({
      numero_factura: numero_factura.trim(),
      orden_id,
      cliente_id: orden.cliente_id,
      ejecutivo_id: orden.ejecutivo_id,
      fecha,
      subtotal: subtotalNum,
      igv,
      total,
      moneda: monedaValida,
      archivo_pdf,
      archivo_xml,
    });

    const detalle = await Factura.findByPk(factura.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Orden, as: 'orden', attributes: ['id', 'numero_orden'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] },
      ],
    });

    res.status(201).json(detalle);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El número de factura ya existe' });
    }
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social', 'ruc'] },
        { model: Orden, as: 'orden', attributes: ['id', 'numero_orden'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre', 'apellido'] },
      ],
    });
    if (!factura) return res.status(404).json({ message: 'Factura no encontrada' });
    if (!validarAcceso(req, factura.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    res.json(factura);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id);
    if (!factura) return res.status(404).json({ message: 'Factura no encontrada' });
    if (!validarAcceso(req, factura.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });

    const data = { ...req.body };
    if (data.subtotal && Number(data.subtotal) > 0) {
      const subtotalNum = Number(data.subtotal);
      data.subtotal = subtotalNum;
      data.igv = +(subtotalNum * 0.18).toFixed(2);
      data.total = +(subtotalNum + data.igv).toFixed(2);
    }
    if (data.numero_factura && typeof data.numero_factura === 'string') {
      data.numero_factura = data.numero_factura.trim();
    }
    if (req.files?.archivo_pdf?.[0]) {
      data.archivo_pdf = `/uploads/facturas/${req.files.archivo_pdf[0].filename}`;
    }
    if (req.files?.archivo_xml?.[0]) {
      data.archivo_xml = `/uploads/facturas/${req.files.archivo_xml[0].filename}`;
    }

    await factura.update(data);
    res.json(factura);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El número de factura ya existe' });
    }
    res.status(500).json({ message: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const factura = await Factura.findByPk(req.params.id);
    if (!factura) return res.status(404).json({ message: 'Factura no encontrada' });
    if (!validarAcceso(req, factura.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    await factura.destroy();
    res.json({ message: 'Factura eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listarOrdenesFacturables, listar, crear, obtener, actualizar, eliminar };
