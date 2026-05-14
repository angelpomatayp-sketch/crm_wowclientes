'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const clientes = await queryInterface.describeTable('clientes');
    if (!clientes.estado_cliente) {
      await queryInterface.addColumn('clientes', 'estado_cliente', {
        type: Sequelize.ENUM('prospecto', 'cliente'),
        allowNull: false,
        defaultValue: 'prospecto',
      });
    }

    const cotizaciones = await queryInterface.describeTable('cotizaciones');
    if (!cotizaciones.archivo_propuesta_pdf) {
      await queryInterface.addColumn('cotizaciones', 'archivo_propuesta_pdf', {
        type: Sequelize.STRING(300),
        allowNull: true,
      });
    }
    if (!cotizaciones.moneda) {
      await queryInterface.addColumn('cotizaciones', 'moneda', {
        type: Sequelize.ENUM('PEN', 'USD'),
        allowNull: false,
        defaultValue: 'PEN',
      });
    }
  },

  async down(queryInterface) {
    const cotizaciones = await queryInterface.describeTable('cotizaciones');
    if (cotizaciones.moneda) await queryInterface.removeColumn('cotizaciones', 'moneda');
    if (cotizaciones.archivo_propuesta_pdf) await queryInterface.removeColumn('cotizaciones', 'archivo_propuesta_pdf');

    const clientes = await queryInterface.describeTable('clientes');
    if (clientes.estado_cliente) await queryInterface.removeColumn('clientes', 'estado_cliente');
  },
};
