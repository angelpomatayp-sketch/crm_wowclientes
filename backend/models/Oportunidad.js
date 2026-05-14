const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Oportunidad = sequelize.define('Oportunidad', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  contacto_id: { type: DataTypes.INTEGER },
  ejecutivo_id: { type: DataTypes.INTEGER, allowNull: false },
  etapa: {
    type: DataTypes.ENUM('prospecto', 'cotizado', 'negociacion', 'ganado', 'perdido'),
    defaultValue: 'prospecto',
  },
  monto_estimado: { type: DataTypes.DECIMAL(12, 2) },
  probabilidad: { type: DataTypes.INTEGER, defaultValue: 0 },
  fecha_cierre_est: { type: DataTypes.DATEONLY },
  cotizacion_id: { type: DataTypes.INTEGER },
  observaciones: { type: DataTypes.TEXT },
}, {
  tableName: 'oportunidades',
  indexes: [
    { fields: ['cliente_id'] },
    { fields: ['ejecutivo_id'] },
    { fields: ['cotizacion_id'] },
    { fields: ['etapa'] },
  ],
});

module.exports = Oportunidad;
