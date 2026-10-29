const express = require('express');
const router = express.Router();
const { registrar, listar } = require('../controllers/ventasController');

router.post('/', registrar);
router.get('/', listar);

module.exports = router;
