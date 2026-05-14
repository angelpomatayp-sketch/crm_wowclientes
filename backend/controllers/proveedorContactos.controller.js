const { ProveedorContacto, Proveedor } = require('../models');

const listarPorProveedor = async (req, res) => {
  try {
    const contactos = await ProveedorContacto.findAll({
      where: { proveedor_id: req.params.proveedorId, activo: true },
    });
    res.json(contactos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.proveedorId);
    if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
    const contacto = await ProveedorContacto.create({ ...req.body, proveedor_id: req.params.proveedorId });
    res.status(201).json(contacto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const contacto = await ProveedorContacto.findByPk(req.params.id);
    if (!contacto) return res.status(404).json({ message: 'Contacto no encontrado' });
    res.json(contacto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const contacto = await ProveedorContacto.findByPk(req.params.id);
    if (!contacto) return res.status(404).json({ message: 'Contacto no encontrado' });
    await contacto.update(req.body);
    res.json(contacto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listarPorProveedor, crear, obtener, actualizar };
