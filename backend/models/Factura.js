const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Factura = sequelize.define('Factura', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_factura: { type: DataTypes.STRING(20), unique: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  orden_id: { type: DataTypes.INTEGER },
  ejecutivo_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(12, 2) },
  igv: { type: DataTypes.DECIMAL(12, 2) },
  total: { type: DataTypes.DECIMAL(12, 2) },
  moneda: { type: DataTypes.ENUM('PEN', 'USD'), allowNull: false, defaultValue: 'PEN' },
  archivo_pdf: { type: DataTypes.STRING(300) },
  archivo_xml: { type: DataTypes.STRING(300) },
}, {
  tableName: 'facturas',
  indexes: [
    { fields: ['cliente_id'] },
    { fields: ['ejecutivo_id'] },
    { fields: ['orden_id'] },
  ],
});

module.exports = Factura;
