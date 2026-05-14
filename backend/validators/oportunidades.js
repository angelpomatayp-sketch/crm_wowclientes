const { body } = require('express-validator');

const createOportunidad = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 200 }).withMessage('Nombre muy largo'),
  body('cliente_id').notEmpty().withMessage('Cliente requerido').isInt({ min: 1 }).withMessage('Cliente inválido'),
  body('contacto_id').optional().isInt({ min: 1 }).withMessage('Contacto inválido'),
  body('etapa').optional().isIn(['prospecto', 'cotizado', 'negociacion', 'ganado', 'perdido']).withMessage('Etapa inválida'),
  body('monto_estimado').optional().isFloat({ min: 0 }).withMessage('Monto inválido'),
  body('probabilidad').optional().isInt({ min: 0, max: 100 }).withMessage('Probabilidad inválida'),
  body('fecha_cierre_est').optional().isISO8601().withMessage('Fecha inválida'),
  body('cotizacion_id').optional().isInt({ min: 1 }).withMessage('Cotización inválida'),
  body('observaciones').optional().isLength({ max: 2000 }).withMessage('Observaciones muy largas'),
  body('ejecutivo_id').optional().isInt({ min: 1 }).withMessage('Ejecutivo inválido'),
];

const updateOportunidad = [
  body('nombre').optional().trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 200 }).withMessage('Nombre muy largo'),
  body('cliente_id').optional().isInt({ min: 1 }).withMessage('Cliente inválido'),
  body('contacto_id').optional().isInt({ min: 1 }).withMessage('Contacto inválido'),
  body('etapa').optional().isIn(['prospecto', 'cotizado', 'negociacion', 'ganado', 'perdido']).withMessage('Etapa inválida'),
  body('monto_estimado').optional().isFloat({ min: 0 }).withMessage('Monto inválido'),
  body('probabilidad').optional().isInt({ min: 0, max: 100 }).withMessage('Probabilidad inválida'),
  body('fecha_cierre_est').optional().isISO8601().withMessage('Fecha inválida'),
  body('cotizacion_id').optional().isInt({ min: 1 }).withMessage('Cotización inválida'),
  body('observaciones').optional().isLength({ max: 2000 }).withMessage('Observaciones muy largas'),
  body('ejecutivo_id').optional().isInt({ min: 1 }).withMessage('Ejecutivo inválido'),
];

const patchEtapa = [
  body('etapa').notEmpty().withMessage('Etapa requerida').isIn(['prospecto', 'cotizado', 'negociacion', 'ganado', 'perdido']).withMessage('Etapa inválida'),
];

module.exports = { createOportunidad, updateOportunidad, patchEtapa };
