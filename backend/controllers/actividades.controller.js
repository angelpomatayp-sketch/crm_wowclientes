const { Actividad, Cliente, Contacto, Ejecutivo } = require('../models');

const filtroEjecutivo = (req) =>
  req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id };

const validarAcceso = (req, ejecutivoId) =>
  req.user.rol === 'admin' || Number(ejecutivoId) === Number(req.user.id);

const listar = async (req, res) => {
  try {
    const where = filtroEjecutivo(req);
    if (req.params.clienteId) where.cliente_id = req.params.clienteId;
    const actividades = await Actividad.findAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Contacto, as: 'contacto', attributes: ['id', 'nombre'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre'] },
      ],
      order: [['fecha', 'DESC']],
    });
    res.json(actividades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.body.cliente_id, { attributes: ['id', 'ejecutivo_id'] });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    if (!validarAcceso(req, cliente.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso al cliente' });

    const actividad = await Actividad.create({
      ...req.body,
      ejecutivo_id: req.user.rol === 'admin' ? (req.body.ejecutivo_id || req.user.id) : req.user.id,
    });
    res.status(201).json(actividad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const actividad = await Actividad.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Contacto, as: 'contacto', attributes: ['id', 'nombre'] },
      ],
    });
    if (!actividad) return res.status(404).json({ message: 'Actividad no encontrada' });
    if (!validarAcceso(req, actividad.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    res.json(actividad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const actividad = await Actividad.findByPk(req.params.id);
    if (!actividad) return res.status(404).json({ message: 'Actividad no encontrada' });
    if (!validarAcceso(req, actividad.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });

    const data = { ...req.body };
    if (req.user.rol !== 'admin') delete data.ejecutivo_id;
    await actividad.update(data);
    res.json(actividad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const actividad = await Actividad.findByPk(req.params.id);
    if (!actividad) return res.status(404).json({ message: 'Actividad no encontrada' });
    if (!validarAcceso(req, actividad.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    await actividad.destroy();
    res.json({ message: 'Actividad eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listar, crear, obtener, actualizar, eliminar };
