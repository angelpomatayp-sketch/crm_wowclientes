const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recordatorio = sequelize.define('Recordatorio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ejecutivo_id: { type: DataTypes.INTEGER, allowNull: false },
  cliente_id: { type: DataTypes.INTEGER },
  fecha: { type: DataTypes.DATE, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  completado: { type: DataTypes.BOOLEAN, defaultValue: false },
  notificado: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'recordatorios' });

module.exports = Recordatorio;
