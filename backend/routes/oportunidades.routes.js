const router = require('express').Router();
const ctrl = require('../controllers/oportunidades.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createOportunidad, updateOportunidad, patchEtapa } = require('../validators/oportunidades');

router.use(auth);
router.get('/', ctrl.listar);
router.post('/', createOportunidad, validate, ctrl.crear);
router.get('/:id', ctrl.obtener);
router.put('/:id', updateOportunidad, validate, ctrl.actualizar);
router.patch('/:id/etapa', patchEtapa, validate, ctrl.cambiarEtapa);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
