const router = require('express').Router();
const ctrl = require('../controllers/recordatorios.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createRecordatorio, updateRecordatorio } = require('../validators/recordatorios');

router.use(auth);
router.get('/', ctrl.listar);
router.post('/', createRecordatorio, validate, ctrl.crear);
router.get('/:id', ctrl.obtener);
router.put('/:id', updateRecordatorio, validate, ctrl.actualizar);
router.patch('/:id/completar', ctrl.completar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
