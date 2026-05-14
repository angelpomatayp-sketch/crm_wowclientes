const router = require('express').Router();
const ctrl = require('../controllers/proveedores.controller');
const ctrlContactos = require('../controllers/proveedorContactos.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createProveedor, updateProveedor } = require('../validators/proveedores');

router.use(auth);

router.get('/', ctrl.listar);
router.post('/', createProveedor, validate, ctrl.crear);
router.get('/:id', ctrl.obtener);
router.get('/:id/historial', ctrl.historial);
router.put('/:id', updateProveedor, validate, ctrl.actualizar);

// Contactos
router.get('/:proveedorId/contactos', ctrlContactos.listarPorProveedor);
router.post('/:proveedorId/contactos', ctrlContactos.crear);
router.get('/contactos/:id', ctrlContactos.obtener);
router.put('/contactos/:id', ctrlContactos.actualizar);

module.exports = router;
