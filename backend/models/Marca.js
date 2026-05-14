const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Marca = sequelize.define('Marca', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  descripcion: { type: DataTypes.TEXT },
  web: { type: DataTypes.STRING(200) },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'marcas',
  indexes: [
    { fields: ['activo'] },
  ],
});

module.exports = Marca;
