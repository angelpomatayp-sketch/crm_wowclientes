const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ruc: { type: DataTypes.STRING(11), allowNull: false, unique: true },
  razon_social: { type: DataTypes.STRING(200), allowNull: false },
  nombre_comercial: { type: DataTypes.STRING(200) },
  direccion: { type: DataTypes.STRING(300) },
  telefono: { type: DataTypes.STRING(20) },
  web: { type: DataTypes.STRING(200) },
  categoria: { type: DataTypes.STRING(100) },   // Tecnología, Salud, etc.
  tipo_cliente: { type: DataTypes.STRING(50) },  // Empresa, Persona Natural, etc.
  estado_cliente: {
    type: DataTypes.ENUM('prospecto', 'cliente'),
    allowNull: false,
    defaultValue: 'prospecto',
  },
  ejecutivo_id: { type: DataTypes.INTEGER, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  fecha_registro: { type: DataTypes.DATEONLY },
}, { tableName: 'clientes' });

module.exports = Cliente;
