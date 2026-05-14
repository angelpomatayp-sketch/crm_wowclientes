const { body } = require('express-validator');

const createRecordatorio = [
  body('cliente_id').optional().isInt({ min: 1 }).withMessage('Cliente inválido'),
  body('fecha').notEmpty().withMessage('Fecha requerida').isISO8601().withMessage('Fecha inválida'),
  body('descripcion').trim().notEmpty().withMessage('Descripción requerida').isLength({ max: 2000 }).withMessage('Descripción muy larga'),
  body('ejecutivo_id').optional().isInt({ min: 1 }).withMessage('Ejecutivo inválido'),
];

const updateRecordatorio = [
  body('cliente_id').optional().isInt({ min: 1 }).withMessage('Cliente inválido'),
  body('fecha').optional().isISO8601().withMessage('Fecha inválida'),
  body('descripcion').optional().trim().notEmpty().withMessage('Descripción requerida').isLength({ max: 2000 }).withMessage('Descripción muy larga'),
  body('completado').optional().isBoolean().withMessage('Completado inválido'),
  body('ejecutivo_id').optional().isInt({ min: 1 }).withMessage('Ejecutivo inválido'),
];

module.exports = { createRecordatorio, updateRecordatorio };
