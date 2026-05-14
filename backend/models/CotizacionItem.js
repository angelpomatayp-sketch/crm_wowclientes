const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CotizacionItem = sequelize.define('CotizacionItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacion_id: { type: DataTypes.INTEGER, allowNull: false },
  descripcion: { type: DataTypes.STRING(300), allowNull: false },
  cantidad: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1 },
  precio_unitario: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
}, { tableName: 'cotizacion_items' });

module.exports = CotizacionItem;
