'use strict';

module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      "SELECT CONSTRAINT_NAME FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'oportunidades' AND CONSTRAINT_NAME = 'oportunidades_ibfk_contacto';"
    );
    if (rows.length === 0) {
      await queryInterface.sequelize.query(
        "ALTER TABLE oportunidades ADD CONSTRAINT oportunidades_ibfk_contacto FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE SET NULL ON UPDATE CASCADE;"
      );
    }
  },

  async down(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      "SELECT CONSTRAINT_NAME FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'oportunidades' AND CONSTRAINT_NAME = 'oportunidades_ibfk_contacto';"
    );
    if (rows.length > 0) {
      await queryInterface.sequelize.query(
        "ALTER TABLE oportunidades DROP FOREIGN KEY oportunidades_ibfk_contacto;"
      );
    }
  },
};
