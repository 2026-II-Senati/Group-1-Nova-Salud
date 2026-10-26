const express = require('express');
const router = express.Router();
const { listar, crear } = require('../controllers/categoriasController');
router.get('/', listar);
router.post('/', crear);

module.exports = router;
