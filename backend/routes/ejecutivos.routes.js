const router = require('express').Router();
const ctrl = require('../controllers/ejecutivos.controller');
const auth = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/role');

router.use(auth, soloAdmin);
router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.get('/:id', ctrl.obtener);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.desactivar);

module.exports = router;
