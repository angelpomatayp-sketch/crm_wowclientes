const router = require('express').Router();
const path = require('path');
const ctrl = require('../controllers/cotizaciones.controller');
const auth = require('../middlewares/auth');
const { soloAdmin } = require('../middlewares/role');
const upload = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { createCotizacion, updateCotizacion, itemRules } = require('../validators/cotizaciones');

const setCotizacionUploadFolder = (req, res, next) => {
  req.uploadFolder = path.join(__dirname, '..', 'uploads', 'cotizaciones', 'propuestas');
  next();
};

router.use(auth);
router.get('/', ctrl.listar);
router.post('/', setCotizacionUploadFolder, upload.single('archivo_propuesta_pdf'), createCotizacion, validate, ctrl.crear);
router.get('/:id', ctrl.obtener);
router.get('/:id/pdf', ctrl.descargarPdf);
router.get('/:id/propuesta-pdf', ctrl.descargarPropuestaPdf);
router.post('/:id/enviar-correo', ctrl.enviarPorCorreo);
router.put('/:id', setCotizacionUploadFolder, upload.single('archivo_propuesta_pdf'), updateCotizacion, validate, ctrl.actualizar);
router.patch('/:id/estado', ctrl.cambiarEstado);
router.delete('/:id', soloAdmin, ctrl.eliminar);

// Items
router.post('/:id/items', itemRules, validate, ctrl.agregarItem);
router.put('/:id/items/:itemId', itemRules, validate, ctrl.actualizarItem);
router.delete('/:id/items/:itemId', ctrl.eliminarItem);

module.exports = router;
