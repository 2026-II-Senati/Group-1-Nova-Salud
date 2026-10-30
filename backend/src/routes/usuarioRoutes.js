const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { cambiarEstado } = require('../controllers/usuarioController');


router.get('/me', verifyToken, (req, res) => {
  return res.status(200).json(req.usuario);
});

router.put('/:id/estado', cambiarEstado);

module.exports = router;
