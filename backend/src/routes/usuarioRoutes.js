const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { cambiarEstado, listar } = require('../controllers/usuarioController');

router.get('/me', verifyToken, (req, res) => {
  return res.status(200).json(req.usuario);
});

router.get('/usuarios', verifyToken, listar);
router.put('/usuarios/:id/estado', verifyToken, cambiarEstado);

module.exports = router;
