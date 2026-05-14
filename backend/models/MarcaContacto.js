const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MarcaContacto = sequelize.define('MarcaContacto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  marca_id: { type: DataTypes.INTEGER, allowNull: false },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  cargo: { type: DataTypes.STRING(100) },
  correo: { type: DataTypes.STRING(150) },
  telefono: { type: DataTypes.STRING(20) },
  celular: { type: DataTypes.STRING(20) },
  contacto_principal: { type: DataTypes.BOOLEAN, defaultValue: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'marca_contactos' });

module.exports = MarcaContacto;
