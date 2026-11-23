const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { predecir } = require('../controllers/mlController');

router.post('/prediccion', verifyToken, predecir);

module.exports = router;
