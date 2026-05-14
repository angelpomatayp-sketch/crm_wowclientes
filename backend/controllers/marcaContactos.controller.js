const { MarcaContacto, Marca } = require('../models');

const listarPorMarca = async (req, res) => {
  try {
    const contactos = await MarcaContacto.findAll({
      where: { marca_id: req.params.marcaId, activo: true },
    });
    res.json(contactos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const marca = await Marca.findByPk(req.params.marcaId);
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
    const contacto = await MarcaContacto.create({ ...req.body, marca_id: req.params.marcaId });
    res.status(201).json(contacto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const contacto = await MarcaContacto.findByPk(req.params.id);
    if (!contacto) return res.status(404).json({ message: 'Contacto no encontrado' });
    res.json(contacto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const contacto = await MarcaContacto.findByPk(req.params.id);
    if (!contacto) return res.status(404).json({ message: 'Contacto no encontrado' });
    await contacto.update(req.body);
    res.json(contacto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listarPorMarca, crear, obtener, actualizar };
