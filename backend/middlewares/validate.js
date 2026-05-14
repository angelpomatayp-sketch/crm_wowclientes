const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const first = errors.array({ onlyFirstError: true })[0];
  return res.status(400).json({ message: first?.msg || 'Datos inválidos' });
};

module.exports = validate;
