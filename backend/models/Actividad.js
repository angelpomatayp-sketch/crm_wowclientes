const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Actividad = sequelize.define('Actividad', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cliente_id: { type: DataTypes.INTEGER, allowNull: false },
  contacto_id: { type: DataTypes.INTEGER },
  ejecutivo_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo: {
    type: DataTypes.ENUM('llamada', 'reunion', 'visita', 'seguimiento', 'email'),
    allowNull: false,
  },
  fecha: { type: DataTypes.DATE, allowNull: false },
  duracion_min: { type: DataTypes.INTEGER },
  asunto: { type: DataTypes.STRING(200) },
  descripcion: { type: DataTypes.TEXT },
  resultado: { type: DataTypes.TEXT },
}, { tableName: 'actividades' });

module.exports = Actividad;
