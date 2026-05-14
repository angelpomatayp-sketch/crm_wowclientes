const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ejecutivo = sequelize.define('Ejecutivo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM('admin', 'ejecutivo'), defaultValue: 'ejecutivo' },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'ejecutivos' });

module.exports = Ejecutivo;
