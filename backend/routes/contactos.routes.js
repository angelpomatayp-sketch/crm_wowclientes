const router = require('express').Router();
const ctrl = require('../controllers/contactos.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateContacto } = require('../validators/contactos');

router.use(auth);
router.get('/:id', ctrl.obtener);
router.put('/:id', updateContacto, validate, ctrl.actualizar);
router.delete('/:id', ctrl.desactivar);

module.exports = router;
