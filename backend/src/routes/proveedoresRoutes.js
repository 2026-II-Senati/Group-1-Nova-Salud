const express = require('express');
const router = express.Router();
const { crear, listar } = require('../controllers/proveedoresController');

router.post('/', crear);
router.get('/', listar);

module.exports = router;