const express = require('express');
const router = express.Router();
const { listar } = require('../controllers/categoriasController');

router.get('/', listar);

module.exports = router;
