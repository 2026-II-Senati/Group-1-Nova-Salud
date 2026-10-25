const express = require('express');
const router = express.Router();
const { listar } = require('../controllers/rolesController');

router.get('/', listar);

module.exports = router;
