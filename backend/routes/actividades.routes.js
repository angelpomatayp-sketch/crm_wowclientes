const router = require('express').Router();
const ctrl = require('../controllers/actividades.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createActividad, updateActividad } = require('../validators/actividades');

router.use(auth);
router.get('/', ctrl.listar);
router.post('/', createActividad, validate, ctrl.crear);
router.get('/:id', ctrl.obtener);
router.put('/:id', updateActividad, validate, ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
