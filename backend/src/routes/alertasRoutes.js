const express = require('express');
const router = express.Router();
const { listar } = require('../controllers/alertasController');

router.get('/', listar);

module.exports = router;
