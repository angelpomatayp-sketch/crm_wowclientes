const router = require('express').Router();
const ctrl = require('../controllers/marcas.controller');
const ctrlContactos = require('../controllers/marcaContactos.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createMarca, updateMarca } = require('../validators/marcas');

router.use(auth);

router.get('/', ctrl.listar);
router.post('/', createMarca, validate, ctrl.crear);
router.get('/:id', ctrl.obtener);
router.get('/:id/historial', ctrl.historial);
router.put('/:id', updateMarca, validate, ctrl.actualizar);

// Contactos
router.get('/:marcaId/contactos', ctrlContactos.listarPorMarca);
router.post('/:marcaId/contactos', ctrlContactos.crear);
router.get('/contactos/:id', ctrlContactos.obtener);
router.put('/contactos/:id', ctrlContactos.actualizar);

module.exports = router;
