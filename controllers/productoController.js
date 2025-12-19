const db = require('../config/db');

// Obtener productos filtrados por supermercadoId y categoriaId (query params)
exports.getProductosFiltrados = async (req, res) => {
  try {
    const { supermercadoId, categoriaId } = req.query;

    let query = `
      SELECT 
        p.*, 
        s.nombre as supermercadoNombre,
        c.nombre as categoriaNombre
      FROM productos p 
      LEFT JOIN supermercados s ON p.supermercado_id = s.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (supermercadoId) {
      query += " AND p.supermercado_id = ?";
      params.push(supermercadoId);
    }

    if (categoriaId) {
      query += " AND p.categoria_id = ?";
      params.push(categoriaId);
    }

    const [rows] = await db.query(query, params);

    // Enviamos envuelto en "data" como espera Flutter
    res.json({
      data: rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        precio: parseFloat(row.precio),
        imagen: row.imagen,
        descripcion: row.descripcion || null,
        categoriaId: row.categoria_id,
        supermercadoId: row.supermercado_id,
        categoriaNombre: row.categoriaNombre || null,
        supermercadoNombre: row.supermercadoNombre || null
      }))
    });
  } catch (error) {
    console.error("Error obteniendo productos filtrados:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

exports.getProductosBySupermercado = async (req, res) => {
  try {
    const supermercadoId = req.params.id;
    const { categoriaId } = req.query;

    let query = "SELECT p.*, s.nombre as supermercadoNombre FROM productos p LEFT JOIN supermercados s ON p.supermercado_id = s.id WHERE p.supermercado_id = ?";
    const params = [supermercadoId];

    if (categoriaId) {
      query += " AND categoria_id = ?";
      params.push(categoriaId);
    }

    const [rows] = await db.query(query, params);

    // Enviamos envuelto en "data" como espera Flutter
    res.json({
      data: rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        precio: parseFloat(row.precio),
        imagen: row.imagen,
        stock: row.stock,
        supermercadoNombre: row.supermercadoNombre || "Supermercado"
      }))
    });
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// Crear producto
exports.createProducto = async (req, res) => {
  try {
    const { nombre, precio, imagen, descripcion, categoria_id, supermercado_id, stock } = req.body;

    if (!nombre || !precio || !categoria_id || !supermercado_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const [result] = await db.query(
      "INSERT INTO productos (nombre, precio, imagen, descripcion, categoria_id, supermercado_id, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombre, precio, imagen || null, descripcion || null, categoria_id, supermercado_id, stock || 0]
    );

    res.status(201).json({ 
      message: "Producto creado con éxito",
      id: result.insertId 
    });
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};