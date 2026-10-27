const express = require('express');
const router = express.Router();
const { listar, actualizar, crear, eliminar } = require('../controllers/productosController');

router.get('/', listar);
router.put('/:id', actualizar);
router.post('/', crear);
router.delete('/:id', eliminar);

module.exports = router;
