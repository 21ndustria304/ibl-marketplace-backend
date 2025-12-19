const express = require('express');
const router = express.Router();
const supermercadoController = require('../controllers/supermercadoController');

// GET: todos los supermercados
router.get('/', supermercadoController.getSupermercados);

// POST: crear supermercado
router.post('/', supermercadoController.createSupermercado);

module.exports = router;