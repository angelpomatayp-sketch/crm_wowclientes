const { body } = require('express-validator');

const createCotizacion = [
  body('cliente_id').notEmpty().withMessage('Cliente requerido').isInt({ min: 1 }).withMessage('Cliente inválido'),
  body('contacto_id').optional().isInt({ min: 1 }).withMessage('Contacto inválido'),
  body('fecha').notEmpty().withMessage('Fecha requerida').isISO8601().withMessage('Fecha inválida'),
  body('fecha_vencimiento').optional().isISO8601().withMessage('Fecha vencimiento inválida'),
  body('tipo').notEmpty().withMessage('Tipo requerido').isIn(['venta', 'alquiler']).withMessage('Tipo inválido'),
  body('moneda').optional().isIn(['PEN', 'USD']).withMessage('Moneda inválida'),
  body('observaciones').optional().isLength({ max: 2000 }).withMessage('Observaciones muy largas'),
];

const updateCotizacion = [
  body('cliente_id').optional().isInt({ min: 1 }).withMessage('Cliente inválido'),
  body('contacto_id').optional().isInt({ min: 1 }).withMessage('Contacto inválido'),
  body('fecha').optional().isISO8601().withMessage('Fecha inválida'),
  body('fecha_vencimiento').optional().isISO8601().withMessage('Fecha vencimiento inválida'),
  body('tipo').optional().isIn(['venta', 'alquiler']).withMessage('Tipo inválido'),
  body('moneda').optional().isIn(['PEN', 'USD']).withMessage('Moneda inválida'),
  body('observaciones').optional().isLength({ max: 2000 }).withMessage('Observaciones muy largas'),
];

const itemRules = [
  body('descripcion').trim().notEmpty().withMessage('Descripción requerida').isLength({ max: 500 }).withMessage('Descripción muy larga'),
  body('cantidad').notEmpty().withMessage('Cantidad requerida').isFloat({ gt: 0 }).withMessage('Cantidad inválida'),
  body('precio_unitario').notEmpty().withMessage('Precio unitario requerido').isFloat({ min: 0 }).withMessage('Precio inválido'),
];

module.exports = { createCotizacion, updateCotizacion, itemRules };
