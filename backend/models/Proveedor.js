const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proveedor = sequelize.define('Proveedor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ruc: { type: DataTypes.STRING(11), unique: true },
  razon_social: { type: DataTypes.STRING(200), allowNull: false },
  nombre_comercial: { type: DataTypes.STRING(200) },
  descripcion: { type: DataTypes.TEXT },
  direccion: { type: DataTypes.STRING(300) },
  telefono: { type: DataTypes.STRING(20) },
  web: { type: DataTypes.STRING(200) },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'proveedores' });

module.exports = Proveedor;
