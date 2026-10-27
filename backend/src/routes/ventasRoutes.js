const express = require('express');
const router = express.Router();
const { registrar } = require('../controllers/ventasController');

router.post('/', registrar);

module.exports = router;
