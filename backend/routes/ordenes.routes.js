const router = require('express').Router();
const path = require('path');
const ctrl = require('../controllers/ordenes.controller');
const auth = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/role');
const upload = require('../middlewares/upload');

const setOrdenUploadFolder = (req, res, next) => {
  req.uploadFolder = path.join(__dirname, '..', 'uploads', 'ordenes');
  next();
};

router.use(auth);
router.get('/cotizaciones-aprobadas', ctrl.listarCotizacionesAprobadasDisponibles);
router.get('/', ctrl.listar);
router.post('/', setOrdenUploadFolder, upload.single('archivo_orden'), ctrl.crear);
router.get('/:id', ctrl.obtener);
router.put('/:id', setOrdenUploadFolder, upload.single('archivo_orden'), ctrl.actualizar);
router.delete('/:id', soloAdmin, ctrl.eliminar);

module.exports = router;
