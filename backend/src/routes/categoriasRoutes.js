const express = require('express');
const router = express.Router();
const { listar, crear, editar } = require('../controllers/categoriasController');

router.get('/', listar);
router.post('/', crear);
router.put('/:id', editar);
module.exports = router;
