const express = require('express');
const router = express.Router();
const { registrar, listar, detalle } = require('../controllers/ventasController');

router.post('/', registrar);
router.get('/', listar);
router.get('/:id', detalle);

module.exports = router;
