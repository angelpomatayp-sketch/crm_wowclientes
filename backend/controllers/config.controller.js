const { Categoria, TipoCliente } = require('../models');

// ── TIPOS DE CLIENTE ──────────────────────────────────────────

const listarTipos = async (req, res) => {
  try {
    const tipos = await TipoCliente.findAll({
      where: { activo: true },
      order: [
        ['nombre', 'ASC'],
        [{ model: Categoria, as: 'categorias' }, 'nombre', 'ASC'],
      ],
      include: [{ model: Categoria, as: 'categorias', where: { activo: true }, required: false }],
    });
    res.json(tipos);
  } catch (err) {
    console.error('[CONFIG] listarTipos error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const crearTipo = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'El nombre es requerido' });
    const tipo = await TipoCliente.create({ nombre: nombre.trim() });
    res.status(201).json(tipo);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Ya existe un tipo con ese nombre' });
    res.status(500).json({ message: err.message });
  }
};

const actualizarTipo = async (req, res) => {
  try {
    const tipo = await TipoCliente.findByPk(req.params.id);
    if (!tipo) return res.status(404).json({ message: 'No encontrado' });
    await tipo.update({ nombre: req.body.nombre.trim() });
    res.json(tipo);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Ya existe un tipo con ese nombre' });
    res.status(500).json({ message: err.message });
  }
};

const eliminarTipo = async (req, res) => {
  try {
    const tipo = await TipoCliente.findByPk(req.params.id);
    if (!tipo) return res.status(404).json({ message: 'No encontrado' });
    await tipo.update({ activo: false });
    res.json({ message: 'Tipo eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── CATEGORÍAS ────────────────────────────────────────────────

const listarCategorias = async (req, res) => {
  try {
    const where = { activo: true };
    if (req.query.tipo_id) where.tipo_cliente_id = req.query.tipo_id;
    const categorias = await Categoria.findAll({
      where,
      order: [['nombre', 'ASC']],
      include: [{ model: TipoCliente, as: 'tipo', attributes: ['id', 'nombre'] }],
    });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crearCategoria = async (req, res) => {
  try {
    const { nombre, tipo_cliente_id } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'El nombre es requerido' });
    if (!tipo_cliente_id) return res.status(400).json({ message: 'El tipo de cliente es requerido' });
    const cat = await Categoria.create({ nombre: nombre.trim(), tipo_cliente_id: Number(tipo_cliente_id) });
    res.status(201).json(cat);
  } catch (err) {
    console.error('[CREAR CAT]', err.name, err.parent?.message || err.message);
    const msg = err.name === 'SequelizeUniqueConstraintError'
      ? 'Ya existe una categoría con ese nombre'
      : err.parent?.message || err.message;
    res.status(500).json({ message: msg });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const cat = await Categoria.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'No encontrado' });
    const { nombre, tipo_cliente_id } = req.body;
    await cat.update({ nombre: nombre.trim(), tipo_cliente_id });
    const result = await Categoria.findByPk(cat.id, {
      include: [{ model: TipoCliente, as: 'tipo', attributes: ['id', 'nombre'] }],
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    const cat = await Categoria.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'No encontrado' });
    await cat.update({ activo: false });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  listarTipos, crearTipo, actualizarTipo, eliminarTipo,
  listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria,
};
