const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cotizacion = sequelize.define('Cotizacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero: { type: DataTypes.STRING(20), unique: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  contacto_id: { type: DataTypes.INTEGER },
  ejecutivo_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_vencimiento: { type: DataTypes.DATEONLY },
  tipo: {
    type: DataTypes.ENUM('venta', 'alquiler'),
    allowNull: false,
    defaultValue: 'venta',
  },
  moneda: {
    type: DataTypes.ENUM('PEN', 'USD'),
    allowNull: false,
    defaultValue: 'PEN',
  },
  subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  igv: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  monto: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  estado: {
    type: DataTypes.ENUM('borrador', 'enviado', 'aprobado', 'rechazado'),
    defaultValue: 'borrador',
  },
  archivo_pdf: { type: DataTypes.STRING(300) },
  archivo_propuesta_pdf: { type: DataTypes.STRING(300) },
  observaciones: { type: DataTypes.TEXT },
}, { tableName: 'cotizaciones' });

module.exports = Cotizacion;
