const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/ejecutivos', require('./ejecutivos.routes'));
router.use('/clientes', require('./clientes.routes'));
router.use('/contactos', require('./contactos.routes'));
router.use('/cotizaciones', require('./cotizaciones.routes'));
router.use('/ordenes', require('./ordenes.routes'));
router.use('/facturas', require('./facturas.routes'));
router.use('/actividades', require('./actividades.routes'));
router.use('/oportunidades', require('./oportunidades.routes'));
router.use('/recordatorios', require('./recordatorios.routes'));
router.use('/reportes', require('./reportes.routes'));
router.use('/sunat', require('./sunat.routes'));
router.use('/config', require('./config.routes'));
router.use('/proveedores', require('./proveedores.routes'));
router.use('/marcas', require('./marcas.routes'));

module.exports = router;
