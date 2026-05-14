const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoCliente = sequelize.define('TipoCliente', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'tipos_cliente' });

module.exports = TipoCliente;
