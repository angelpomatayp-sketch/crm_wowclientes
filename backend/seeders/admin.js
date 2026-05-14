/**
 * Seed inicial: crea el usuario admin
 * Ejecutar: node seeders/admin.js
 */
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const { sequelize, Ejecutivo } = require('../models');

(async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      console.error('Debes definir ADMIN_EMAIL y ADMIN_PASSWORD en variables de entorno');
      process.exit(1);
    }

    await sequelize.authenticate();

    const existe = await Ejecutivo.findOne({ where: { email: adminEmail } });
    if (existe) {
      console.log('Admin ya existe');
      process.exit(0);
    }

    const hash = await bcrypt.hash(adminPassword, 10);
    await Ejecutivo.create({
      nombre: 'Admin',
      apellido: 'Sistema',
      email: adminEmail,
      password: hash,
      rol: 'admin',
    });

    console.log(`✓ Admin creado: ${adminEmail}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
