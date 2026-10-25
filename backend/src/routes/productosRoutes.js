const express = require('express');
const router = express.Router();
const { listar } = require('../controllers/productosController');

router.get('/', listar);

module.exports = router;
