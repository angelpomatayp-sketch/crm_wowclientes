const { body } = require('express-validator');

const createActividad = [
  body('cliente_id').notEmpty().withMessage('Cliente requerido').isInt({ min: 1 }).withMessage('Cliente inválido'),
  body('contacto_id').optional().isInt({ min: 1 }).withMessage('Contacto inválido'),
  body('tipo').notEmpty().withMessage('Tipo requerido').isIn(['llamada', 'reunion', 'visita', 'seguimiento', 'email']).withMessage('Tipo inválido'),
  body('fecha').notEmpty().withMessage('Fecha requerida').isISO8601().withMessage('Fecha inválida'),
  body('duracion_min').optional().isInt({ min: 0 }).withMessage('Duración inválida'),
  body('asunto').optional().isLength({ max: 200 }).withMessage('Asunto muy largo'),
  body('descripcion').optional().isLength({ max: 2000 }).withMessage('Descripción muy larga'),
  body('resultado').optional().isLength({ max: 2000 }).withMessage('Resultado muy largo'),
  body('ejecutivo_id').optional().isInt({ min: 1 }).withMessage('Ejecutivo inválido'),
];

const updateActividad = [
  body('cliente_id').optional().isInt({ min: 1 }).withMessage('Cliente inválido'),
  body('contacto_id').optional().isInt({ min: 1 }).withMessage('Contacto inválido'),
  body('tipo').optional().isIn(['llamada', 'reunion', 'visita', 'seguimiento', 'email']).withMessage('Tipo inválido'),
  body('fecha').optional().isISO8601().withMessage('Fecha inválida'),
  body('duracion_min').optional().isInt({ min: 0 }).withMessage('Duración inválida'),
  body('asunto').optional().isLength({ max: 200 }).withMessage('Asunto muy largo'),
  body('descripcion').optional().isLength({ max: 2000 }).withMessage('Descripción muy larga'),
  body('resultado').optional().isLength({ max: 2000 }).withMessage('Resultado muy largo'),
  body('ejecutivo_id').optional().isInt({ min: 1 }).withMessage('Ejecutivo inválido'),
];

module.exports = { createActividad, updateActividad };
