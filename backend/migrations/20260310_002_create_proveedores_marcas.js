'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) => tables.map((t) => t.toString()).includes(name);

    if (!has('proveedores')) {
      await queryInterface.createTable('proveedores', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        ruc: { type: Sequelize.STRING(11), unique: true },
        razon_social: { type: Sequelize.STRING(200), allowNull: false },
        nombre_comercial: { type: Sequelize.STRING(200) },
        direccion: { type: Sequelize.STRING(300) },
        telefono: { type: Sequelize.STRING(20) },
        web: { type: Sequelize.STRING(200) },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!has('proveedor_contactos')) {
      await queryInterface.createTable('proveedor_contactos', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        proveedor_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'proveedores', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        nombre: { type: Sequelize.STRING(150), allowNull: false },
        cargo: { type: Sequelize.STRING(100) },
        correo: { type: Sequelize.STRING(150) },
        telefono: { type: Sequelize.STRING(20) },
        celular: { type: Sequelize.STRING(20) },
        contacto_principal: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!has('marcas')) {
      await queryInterface.createTable('marcas', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        nombre: { type: Sequelize.STRING(150), allowNull: false, unique: true },
        descripcion: { type: Sequelize.TEXT },
        web: { type: Sequelize.STRING(200) },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!has('marca_contactos')) {
      await queryInterface.createTable('marca_contactos', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        marca_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'marcas', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        nombre: { type: Sequelize.STRING(150), allowNull: false },
        cargo: { type: Sequelize.STRING(100) },
        correo: { type: Sequelize.STRING(150) },
        telefono: { type: Sequelize.STRING(20) },
        celular: { type: Sequelize.STRING(20) },
        contacto_principal: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) => tables.map((t) => t.toString()).includes(name);

    if (has('marca_contactos')) await queryInterface.dropTable('marca_contactos');
    if (has('marcas')) await queryInterface.dropTable('marcas');
    if (has('proveedor_contactos')) await queryInterface.dropTable('proveedor_contactos');
    if (has('proveedores')) await queryInterface.dropTable('proveedores');
  },
};
