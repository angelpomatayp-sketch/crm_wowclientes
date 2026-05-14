const { body } = require('express-validator');

const createProveedor = [
  body('ruc').optional().trim().isLength({ min: 11, max: 11 }).withMessage('RUC debe tener 11 dígitos')
    .isNumeric().withMessage('RUC debe ser numérico'),
  body('razon_social').trim().notEmpty().withMessage('Razón social requerida').isLength({ max: 200 }).withMessage('Razón social muy larga'),
  body('nombre_comercial').optional().isLength({ max: 200 }).withMessage('Nombre comercial muy largo'),
  body('descripcion').optional().isLength({ max: 1000 }).withMessage('Descripción muy larga'),
  body('direccion').optional().isLength({ max: 300 }).withMessage('Dirección muy larga'),
  body('telefono').optional().isLength({ max: 20 }).withMessage('Teléfono muy largo'),
  body('web').optional().isLength({ max: 200 }).withMessage('Web muy larga'),
];

const updateProveedor = [
  body('ruc').optional().trim().isLength({ min: 11, max: 11 }).withMessage('RUC debe tener 11 dígitos')
    .isNumeric().withMessage('RUC debe ser numérico'),
  body('razon_social').optional().trim().notEmpty().withMessage('Razón social requerida').isLength({ max: 200 }).withMessage('Razón social muy larga'),
  body('nombre_comercial').optional().isLength({ max: 200 }).withMessage('Nombre comercial muy largo'),
  body('descripcion').optional().isLength({ max: 1000 }).withMessage('Descripción muy larga'),
  body('direccion').optional().isLength({ max: 300 }).withMessage('Dirección muy larga'),
  body('telefono').optional().isLength({ max: 20 }).withMessage('Teléfono muy largo'),
  body('web').optional().isLength({ max: 200 }).withMessage('Web muy larga'),
];

module.exports = { createProveedor, updateProveedor };
