const { Contacto, Cliente } = require('../models');

const validarAccesoCliente = (req, ejecutivoId) =>
  req.user.rol === 'admin' || Number(ejecutivoId) === Number(req.user.id);

const listarPorCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.clienteId, { attributes: ['id', 'ejecutivo_id'] });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    if (!validarAccesoCliente(req, cliente.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });

    const contactos = await Contacto.findAll({
      where: { cliente_id: req.params.clienteId, activo: true },
    });
    res.json(contactos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.clienteId, { attributes: ['id', 'ejecutivo_id'] });
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    if (!validarAccesoCliente(req, cliente.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });

    const contacto = await Contacto.create({ ...req.body, cliente_id: req.params.clienteId });
    res.status(201).json(contacto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const contacto = await Contacto.findByPk(req.params.id, {
      include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'ejecutivo_id'] }],
    });
    if (!contacto) return res.status(404).json({ message: 'Contacto no encontrado' });
    if (!validarAccesoCliente(req, contacto.cliente?.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    res.json(contacto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const contacto = await Contacto.findByPk(req.params.id, {
      include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'ejecutivo_id'] }],
    });
    if (!contacto) return res.status(404).json({ message: 'Contacto no encontrado' });
    if (!validarAccesoCliente(req, contacto.cliente?.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });

    const data = { ...req.body };
    delete data.cliente_id;
    await contacto.update(data);
    res.json(contacto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const desactivar = async (req, res) => {
  try {
    const contacto = await Contacto.findByPk(req.params.id, {
      include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'ejecutivo_id'] }],
    });
    if (!contacto) return res.status(404).json({ message: 'Contacto no encontrado' });
    if (!validarAccesoCliente(req, contacto.cliente?.ejecutivo_id))
      return res.status(403).json({ message: 'Sin acceso' });
    await contacto.update({ activo: false });
    res.json({ message: 'Contacto desactivado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listarPorCliente, crear, obtener, actualizar, desactivar };
