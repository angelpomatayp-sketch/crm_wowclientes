const router = require('express').Router();
const ctrl = require('../controllers/clientes.controller');
const ctrlContactos = require('../controllers/contactos.controller');
const ctrlActividades = require('../controllers/actividades.controller');
const auth = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/role');
const validate = require('../middlewares/validate');
const { createCliente, updateCliente } = require('../validators/clientes');

router.use(auth);

router.get('/', ctrl.listar);
router.post('/', createCliente, validate, ctrl.crear);
router.get('/:id', ctrl.obtener);
router.get('/:id/historial', ctrl.historial);
router.put('/:id', updateCliente, validate, ctrl.actualizar);
router.patch('/:id/asignar-ejecutivo', soloAdmin, ctrl.asignarEjecutivo);
router.delete('/:id', soloAdmin, ctrl.desactivar);

// Contactos anidados
router.get('/:clienteId/contactos', ctrlContactos.listarPorCliente);
router.post('/:clienteId/contactos', ctrlContactos.crear);

// Actividades del cliente
router.get('/:clienteId/actividades', ctrlActividades.listar);

module.exports = router;
