const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController");

// NUEVA RUTA: GET /productos?supermercado_id=2&categoria_id=1
router.get("/", productoController.getProductosFiltrados);

// Ruta vieja (si querés mantenerla para todo un supermercado)
router.get("/:id", productoController.getProductosBySupermercado);

// POST crear producto
router.post("/", productoController.createProducto);

module.exports = router;