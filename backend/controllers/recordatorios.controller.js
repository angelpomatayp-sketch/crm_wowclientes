const { Recordatorio, Cliente, Ejecutivo } = require('../models');

const filtroEjecutivo = (req) =>
  req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id };

const validarAcceso = (req, ejecutivoId) =>
  req.user.rol === 'admin' || Number(ejecutivoId) === Number(req.user.id);

const listar = async (req, res) => {
  try {
    const recordatorios = await Recordatorio.findAll({
      where: filtroEjecutivo(req),
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre'] },
      ],
      order: [['fecha', 'DESC']],
    });
    res.json(recordatorios);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    if (req.body.cliente_id) {
      const cliente = await Cliente.findByPk(req.body.cliente_id, { attributes: ['id', 'ejecutivo_id'] });
      if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
      if (!validarAcceso(req, cliente.ejecutivo_id))
        return res.status(403).json({ message: 'Sin acceso al cliente' });
    }

    const recordatorio = await Recordatorio.create({
      ...req.body,
      ejecutivo_id: req.user.rol === 'admin' ? (req.body.ejecutivo_id || req.user.id) : req.user.id,
    });
    res.status(201).json(recordatorio);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const r = await Recordatorio.findByPk(req.params.id, {
      include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] }],
    });
    if (!r) return res.status(404).json({ message: 'Recordatorio no encontrado' });
    if (!validarAcceso(req, r.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const r = await Recordatorio.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Recordatorio no encontrado' });
    if (!validarAcceso(req, r.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });

    const data = { ...req.body };
    if (req.user.rol !== 'admin') delete data.ejecutivo_id;
    await r.update(data);
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const completar = async (req, res) => {
  try {
    const r = await Recordatorio.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Recordatorio no encontrado' });
    if (!validarAcceso(req, r.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    await r.update({ completado: true });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const r = await Recordatorio.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Recordatorio no encontrado' });
    if (!validarAcceso(req, r.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    await r.destroy();
    res.json({ message: 'Recordatorio eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listar, crear, obtener, actualizar, completar, eliminar };
