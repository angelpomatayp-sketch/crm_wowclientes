const { body } = require('express-validator');

const rucRules = [
  body('ruc')
    .trim()
    .isLength({ min: 11, max: 11 }).withMessage('RUC debe tener 11 dígitos')
    .isNumeric().withMessage('RUC debe ser numérico'),
];

const createCliente = [
  ...rucRules,
  body('razon_social').trim().notEmpty().withMessage('Razón social requerida').isLength({ max: 200 }).withMessage('Razón social muy larga'),
  body('nombre_comercial').optional().isLength({ max: 200 }).withMessage('Nombre comercial muy largo'),
  body('direccion').optional().isLength({ max: 300 }).withMessage('Dirección muy larga'),
  body('telefono').optional().isLength({ max: 20 }).withMessage('Teléfono muy largo'),
  body('web').optional().isLength({ max: 200 }).withMessage('Web muy larga'),
  body('categoria').optional().isLength({ max: 100 }).withMessage('Categoría muy larga'),
  body('tipo_cliente').optional().isLength({ max: 50 }).withMessage('Tipo de cliente muy largo'),
  body('estado_cliente').optional().isIn(['prospecto', 'cliente']).withMessage('Estado cliente inválido'),
  body('fecha_registro').optional().isISO8601().withMessage('Fecha de registro inválida'),
  body('ejecutivo_id').optional().isInt({ min: 1 }).withMessage('Ejecutivo inválido'),
];

const updateCliente = [
  body('ruc').optional().trim().isLength({ min: 11, max: 11 }).withMessage('RUC debe tener 11 dígitos')
    .isNumeric().withMessage('RUC debe ser numérico'),
  body('razon_social').optional().trim().notEmpty().withMessage('Razón social requerida').isLength({ max: 200 }).withMessage('Razón social muy larga'),
  body('nombre_comercial').optional().isLength({ max: 200 }).withMessage('Nombre comercial muy largo'),
  body('direccion').optional().isLength({ max: 300 }).withMessage('Dirección muy larga'),
  body('telefono').optional().isLength({ max: 20 }).withMessage('Teléfono muy largo'),
  body('web').optional().isLength({ max: 200 }).withMessage('Web muy larga'),
  body('categoria').optional().isLength({ max: 100 }).withMessage('Categoría muy larga'),
  body('tipo_cliente').optional().isLength({ max: 50 }).withMessage('Tipo de cliente muy largo'),
  body('estado_cliente').optional().isIn(['prospecto', 'cliente']).withMessage('Estado cliente inválido'),
  body('fecha_registro').optional().isISO8601().withMessage('Fecha de registro inválida'),
  body('ejecutivo_id').optional().isInt({ min: 1 }).withMessage('Ejecutivo inválido'),
];

module.exports = { createCliente, updateCliente };
