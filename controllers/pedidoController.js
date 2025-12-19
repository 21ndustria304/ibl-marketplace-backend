const db = require('../config/db');

// Crear pedido
exports.createPedido = (req, res) => {
  const { usuario_id, supermercado_id, productos, total, forma_entrega, forma_pago } = req.body;

  db.query(
    'INSERT INTO pedidos (usuario_id, supermercado_id, productos, total, forma_entrega, forma_pago, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [usuario_id, supermercado_id, JSON.stringify(productos), total, forma_entrega, forma_pago, 'pendiente'],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear pedido' });
      res.json({ message: '✅ Pedido creado con éxito' });
    }
  );
};

// Ver pedidos de un supermercado
exports.getPedidosBySupermercado = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM pedidos WHERE supermercado_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener pedidos' });
    res.json(results);
  });
};

// Ver pedidos de un usuario
exports.getPedidosByUsuario = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM pedidos WHERE usuario_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener pedidos' });
    res.json(results);
  });
};