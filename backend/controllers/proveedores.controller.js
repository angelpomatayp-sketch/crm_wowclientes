const { Proveedor, ProveedorContacto } = require('../models');

const listar = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      where: { activo: true },
      order: [['createdAt', 'DESC']],
    });
    res.json(proveedores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const proveedor = await Proveedor.create(req.body);
    res.status(201).json(proveedor);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'El RUC ya está registrado' });
    }
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
    await proveedor.update(req.body);
    res.json(proveedor);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'El RUC ya está registrado' });
    }
    res.status(500).json({ message: err.message });
  }
};

const historial = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id, {
      include: [{ model: ProveedorContacto, as: 'contactos', where: { activo: true }, required: false }],
    });
    if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listar, crear, obtener, actualizar, historial };
