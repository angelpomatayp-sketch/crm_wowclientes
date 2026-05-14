const { body } = require('express-validator');

const updateContacto = [
  body('nombre').optional().trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 150 }).withMessage('Nombre muy largo'),
  body('cargo').optional().isLength({ max: 100 }).withMessage('Cargo muy largo'),
  body('area').optional().isLength({ max: 100 }).withMessage('Área muy larga'),
  body('correo').optional().isEmail().withMessage('Correo inválido').isLength({ max: 150 }).withMessage('Correo muy largo'),
  body('telefono').optional().isLength({ max: 20 }).withMessage('Teléfono muy largo'),
  body('celular').optional().isLength({ max: 20 }).withMessage('Celular muy largo'),
  body('contacto_principal').optional().isBoolean().withMessage('Contacto principal inválido'),
];

module.exports = { updateContacto };
