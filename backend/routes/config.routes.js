const router = require('express').Router();
const ctrl = require('../controllers/config.controller');
const auth = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/role');

// Listar (todos los autenticados pueden leer para llenar selects)
router.get('/categorias', auth, ctrl.listarCategorias);
router.get('/tipos-cliente', auth, ctrl.listarTipos);

// CRUD solo admin
router.post('/categorias', auth, soloAdmin, ctrl.crearCategoria);
router.put('/categorias/:id', auth, soloAdmin, ctrl.actualizarCategoria);
router.delete('/categorias/:id', auth, soloAdmin, ctrl.eliminarCategoria);

router.post('/tipos-cliente', auth, soloAdmin, ctrl.crearTipo);
router.put('/tipos-cliente/:id', auth, soloAdmin, ctrl.actualizarTipo);
router.delete('/tipos-cliente/:id', auth, soloAdmin, ctrl.eliminarTipo);

module.exports = router;
