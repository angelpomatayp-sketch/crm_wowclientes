'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cotizaciones', 'tipo', {
      type: Sequelize.ENUM('venta', 'alquiler'),
      allowNull: false,
      defaultValue: 'venta',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('cotizaciones', 'tipo');
  },
};