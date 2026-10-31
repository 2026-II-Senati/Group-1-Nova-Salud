const express = require('express');
const router = express.Router();
const { metricas, ventasSemana } = require('../controllers/dashboardController');

router.get('/metricas', metricas);
router.get('/ventas-semana', ventasSemana);

module.exports = router;
