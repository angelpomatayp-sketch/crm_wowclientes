const { Oportunidad, Cliente, Contacto, Ejecutivo, Cotizacion } = require('../models');

const filtroEjecutivo = (req) =>
  req.user.rol === 'admin' ? {} : { ejecutivo_id: req.user.id };

const validarAcceso = (req, ejecutivoId) =>
  req.user.rol === 'admin' || Number(ejecutivoId) === Number(req.user.id);

const listar = async (req, res) => {
  try {
    const oportunidades = await Oportunidad.findAll({
      where: filtroEjecutivo(req),
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(oportunidades);
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

    const oportunidad = await Oportunidad.create({
      ...req.body,
      ejecutivo_id: req.user.rol === 'admin' ? (req.body.ejecutivo_id || req.user.id) : req.user.id,
    });
    res.status(201).json(oportunidad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const op = await Oportunidad.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'razon_social'] },
        { model: Contacto, as: 'contacto', attributes: ['id', 'nombre'] },
        { model: Ejecutivo, as: 'ejecutivo', attributes: ['id', 'nombre'] },
        { model: Cotizacion, as: 'cotizacion', attributes: ['id', 'numero', 'monto'] },
      ],
    });
    if (!op) return res.status(404).json({ message: 'Oportunidad no encontrada' });
    if (!validarAcceso(req, op.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    res.json(op);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const op = await Oportunidad.findByPk(req.params.id);
    if (!op) return res.status(404).json({ message: 'Oportunidad no encontrada' });
    if (!validarAcceso(req, op.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });

    const data = { ...req.body };
    if (req.user.rol !== 'admin') delete data.ejecutivo_id;
    await op.update(data);
    res.json(op);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cambiarEtapa = async (req, res) => {
  const etapasValidas = ['prospecto', 'cotizado', 'negociacion', 'ganado', 'perdido'];
  try {
    const op = await Oportunidad.findByPk(req.params.id);
    if (!op) return res.status(404).json({ message: 'Oportunidad no encontrada' });
    if (!validarAcceso(req, op.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    const { etapa } = req.body;
    if (!etapasValidas.includes(etapa))
      return res.status(400).json({ message: 'Etapa no válida' });
    await op.update({ etapa });
    res.json(op);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const op = await Oportunidad.findByPk(req.params.id);
    if (!op) return res.status(404).json({ message: 'Oportunidad no encontrada' });
    if (!validarAcceso(req, op.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    await op.destroy();
    res.json({ message: 'Oportunidad eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listar, crear, obtener, actualizar, cambiarEtapa, eliminar };
