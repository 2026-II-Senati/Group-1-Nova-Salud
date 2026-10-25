const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.get('/me', verifyToken, (req, res) => {
  return res.status(200).json(req.usuario);
});

module.exports = router;
