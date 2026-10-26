const express = require('express');
const router = express.Router();
const { listar, actualizar } = require('../controllers/productosController');

router.get('/', listar);
router.put('/:id', actualizar);

module.exports = router;
