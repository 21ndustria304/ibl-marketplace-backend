const db = require('../config/db');

// ✅ Obtener supermercados con async/await
exports.getSupermercados = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM supermercados');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener supermercados' });
  }
};

// ✅ Crear supermercado
exports.createSupermercado = async (req, res) => {
  try {
    const { nombre, direccion, telefono } = req.body;
    await db.query(
      'INSERT INTO supermercados (nombre, direccion, telefono) VALUES (?, ?, ?)',
      [nombre, direccion, telefono]
    );
    res.json({ message: '✅ Supermercado creado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear supermercado' });
  }
};