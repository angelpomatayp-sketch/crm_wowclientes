const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Orden = sequelize.define('Orden', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_orden: { type: DataTypes.STRING(50), unique: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  cotizacion_id: { type: DataTypes.INTEGER },
  ejecutivo_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  monto: { type: DataTypes.DECIMAL(12, 2) },
  archivo_orden: { type: DataTypes.STRING(300) },
  observaciones: { type: DataTypes.TEXT },
}, { tableName: 'ordenes' });

module.exports = Orden;
