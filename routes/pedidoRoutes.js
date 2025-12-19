const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Crear un nuevo pedido con forma de entrega
router.post("/", async (req, res) => {
  // 🔹 Aquí es donde va tu destructuración y validación
  const { usuario_id, supermercado_id, forma_entrega_id, items } = req.body;

  if (!usuario_id || !supermercado_id || !forma_entrega_id || !items || items.length === 0) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    // 🔹 Insertar el pedido incluyendo forma de entrega
    const [pedidoResult] = await db.query(
      "INSERT INTO pedidos (usuario_id, supermercado_id, forma_entrega_id, fecha) VALUES (?, ?, ?, NOW())",
      [usuario_id, supermercado_id, forma_entrega_id]
    );

    const pedido_id = pedidoResult.insertId;

    // 🔹 Insertar los items en pedido_items
    for (let item of items) {
      await db.query(
        "INSERT INTO pedido_items (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)",
        [pedido_id, item.producto_id, item.cantidad]
      );
    }

    res.status(201).json({ message: "Pedido creado con éxito", pedido_id });
  } catch (err) {
    console.error("❌ Error creando pedido:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.get("/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const [pedidos] = await db.query(
      `SELECT 
         p.id AS pedido_id,
         p.fecha,
         f.nombre AS forma_entrega,
         f.descripcion AS forma_entrega_desc,
         pi.producto_id,
         pi.cantidad
       FROM pedidos p
       JOIN formas_entrega f ON p.forma_entrega_id = f.id
       JOIN pedido_items pi ON p.id = pi.pedido_id
       WHERE p.usuario_id = ?`,
      [usuarioId]
    );

    res.json(pedidos);
  } catch (err) {
    console.error("❌ Error al obtener pedidos:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;