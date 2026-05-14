const { body } = require('express-validator');

const createMarca = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 150 }).withMessage('Nombre muy largo'),
  body('descripcion').optional().isLength({ max: 2000 }).withMessage('Descripción muy larga'),
  body('web').optional().isLength({ max: 200 }).withMessage('Web muy larga'),
];

const updateMarca = [
  body('nombre').optional().trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 150 }).withMessage('Nombre muy largo'),
  body('descripcion').optional().isLength({ max: 2000 }).withMessage('Descripción muy larga'),
  body('web').optional().isLength({ max: 200 }).withMessage('Web muy larga'),
];

module.exports = { createMarca, updateMarca };
