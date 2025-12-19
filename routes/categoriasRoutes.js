const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categorias");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error obteniendo categorías:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;
