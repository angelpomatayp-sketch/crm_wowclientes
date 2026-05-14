'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('facturas', 'moneda', {
      type: Sequelize.ENUM('PEN', 'USD'),
      allowNull: false,
      defaultValue: 'PEN',
      after: 'total',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('facturas', 'moneda');
  },
};
