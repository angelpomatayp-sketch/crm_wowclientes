const { Marca, MarcaContacto } = require('../models');

const listar = async (req, res) => {
  try {
    const marcas = await Marca.findAll({
      where: { activo: true },
      order: [['createdAt', 'DESC']],
    });
    res.json(marcas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const marca = await Marca.create(req.body);
    res.status(201).json(marca);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'La marca ya existe' });
    }
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const marca = await Marca.findByPk(req.params.id);
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
    res.json(marca);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const marca = await Marca.findByPk(req.params.id);
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
    await marca.update(req.body);
    res.json(marca);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'La marca ya existe' });
    }
    res.status(500).json({ message: err.message });
  }
};

const historial = async (req, res) => {
  try {
    const marca = await Marca.findByPk(req.params.id, {
      include: [{ model: MarcaContacto, as: 'contactos', where: { activo: true }, required: false }],
    });
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
    res.json(marca);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listar, crear, obtener, actualizar, historial };
