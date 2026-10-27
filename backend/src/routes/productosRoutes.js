const express = require('express');
const router = express.Router();
const { listar, actualizar, crear } = require('../controllers/productosController');

router.get('/', listar);
router.put('/:id', actualizar);
router.post('/', crear);

module.exports = router;
