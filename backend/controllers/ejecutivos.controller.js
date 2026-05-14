const bcrypt = require('bcryptjs');
const { Ejecutivo } = require('../models');

const listar = async (req, res) => {
  try {
    const ejecutivos = await Ejecutivo.findAll({
      attributes: { exclude: ['password'] },
      where: { activo: true },
      order: [['createdAt', 'DESC']],
    });
    res.json(ejecutivos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const ejecutivo = await Ejecutivo.create({ nombre, apellido, email, password: hash, rol });
    const { password: _, ...data } = ejecutivo.toJSON();
    res.status(201).json(data);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'El email ya está registrado' });
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const ejecutivo = await Ejecutivo.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!ejecutivo) return res.status(404).json({ message: 'No encontrado' });
    res.json(ejecutivo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const ejecutivo = await Ejecutivo.findByPk(req.params.id);
    if (!ejecutivo) return res.status(404).json({ message: 'No encontrado' });
    const { nombre, apellido, email, rol, password } = req.body;
    const cambios = { nombre, apellido, email, rol };
    if (password && password.trim() !== '') {
      cambios.password = await bcrypt.hash(password, 10);
    }
    await ejecutivo.update(cambios);
    const { password: _, ...data } = ejecutivo.toJSON();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const desactivar = async (req, res) => {
  try {
    const ejecutivo = await Ejecutivo.findByPk(req.params.id);
    if (!ejecutivo) return res.status(404).json({ message: 'No encontrado' });
    await ejecutivo.update({ activo: false });
    res.json({ message: 'Ejecutivo desactivado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listar, crear, obtener, actualizar, desactivar };
