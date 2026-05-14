const router = require('express').Router();
const ctrl = require('../controllers/reportes.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/resumen', ctrl.resumen);
router.get('/ventas-por-ejecutivo', ctrl.ventasPorEjecutivo);
router.get('/cotizaciones-por-estado', ctrl.cotizacionesPorEstado);
router.get('/conversion-por-ejecutivo', ctrl.conversionPorEjecutivo);
router.get('/flujo-mensual', ctrl.flujoMensual);
router.get('/top-clientes', ctrl.topClientes);
router.get('/correlativo-cotizaciones', ctrl.correlativoCotizaciones);
router.get('/correlativo-cotizaciones/pdf', ctrl.correlativoCotizacionesPdf);

module.exports = router;
