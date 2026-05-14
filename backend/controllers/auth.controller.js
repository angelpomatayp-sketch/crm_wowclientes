const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Ejecutivo } = require('../models');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña requeridos' });

    const ejecutivo = await Ejecutivo.findOne({ where: { email, activo: true } });
    if (!ejecutivo)
      return res.status(401).json({ message: 'Credenciales incorrectas' });

    const valid = await bcrypt.compare(password, ejecutivo.password);
    if (!valid)
      return res.status(401).json({ message: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: ejecutivo.id, email: ejecutivo.email, rol: ejecutivo.rol, nombre: ejecutivo.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({
      user: { id: ejecutivo.id, nombre: ejecutivo.nombre, apellido: ejecutivo.apellido, email: ejecutivo.email, rol: ejecutivo.rol },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const me = (req, res) => {
  res.json(req.user);
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada' });
};

const changePassword = async (req, res) => {
  try {
    const { password_actual, password_nuevo } = req.body;
    const ejecutivo = await Ejecutivo.findByPk(req.user.id);
    const valid = await bcrypt.compare(password_actual, ejecutivo.password);
    if (!valid) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

    ejecutivo.password = await bcrypt.hash(password_nuevo, 10);
    await ejecutivo.save();
    res.json({ message: 'Contraseña actualizada' });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { login, me, logout, changePassword };
