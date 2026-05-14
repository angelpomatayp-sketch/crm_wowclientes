const router = require('express').Router();
const { consultarRuc } = require('../controllers/sunat.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/ruc/:ruc', consultarRuc);

module.exports = router;
