const router = require('express').Router();
const path = require('path');
const ctrl = require('../controllers/facturas.controller');
const auth = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/role');
const upload = require('../middlewares/upload');

const setFacturaUploadFolder = (req, res, next) => {
  req.uploadFolder = path.join(__dirname, '..', 'uploads', 'facturas');
  next();
};

router.use(auth);
router.get('/ordenes-facturables', ctrl.listarOrdenesFacturables);
router.get('/', ctrl.listar);
router.post(
  '/',
  setFacturaUploadFolder,
  upload.fields([{ name: 'archivo_pdf', maxCount: 1 }, { name: 'archivo_xml', maxCount: 1 }]),
  ctrl.crear
);
router.get('/:id', ctrl.obtener);
router.put(
  '/:id',
  setFacturaUploadFolder,
  upload.fields([{ name: 'archivo_pdf', maxCount: 1 }, { name: 'archivo_xml', maxCount: 1 }]),
  ctrl.actualizar
);
router.delete('/:id', soloAdmin, ctrl.eliminar);

module.exports = router;
