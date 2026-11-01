const express = require('express');
const router = express.Router();
const { listar } = require('../controllers/movimientosController');

router.get('/', listar);

module.exports = router;
