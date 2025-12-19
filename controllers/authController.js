const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO
exports.register = async (req, res) => {
  const { nombre, email, password } = req.body;
  
  console.log('Datos recibidos:', { nombre, email, password: '***' });
  
  try {
    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verifica si el usuario ya existe
    const [rows] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Inserta el usuario COMPLETO
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, contraseña, avatar) VALUES (?, ?, ?, ?)',
      [
        nombre, 
        email, 
        hashedPassword,
        `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=DD6031&color=fff`,
      ]
    );

    // Obtener el usuario creado
    const [newUser] = await db.query(
      'SELECT id, nombre, email, avatar FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    // Generar token
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET || 'mi_secreto',
      { expiresIn: '7d' }
    );

    console.log('Usuario registrado:', newUser[0]);

    // RESPUESTA CORRECTA para el frontend
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: newUser[0]
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Intento de login:', { email, password: '***' });
  
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const [rows] = await db.query(
      'SELECT id, nombre, email, contraseña, google_id, avatar FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const usuario = rows[0];

    if (!usuario.contraseña) {
      return res.status(401).json({ 
        message: 'Esta cuenta fue creada con Google. Usa "Continuar con Google"' 
      });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.contraseña);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { userId: usuario.id },
      process.env.JWT_SECRET || 'mi_secreto',
      { expiresIn: '7d' }
    );

    // Respuesta sin contraseña
    const { contraseña: _, google_id: __, ...usuarioSinPassword } = usuario;

    console.log('Login exitoso:', usuarioSinPassword);

    res.json({
      message: 'Login exitoso',
      token,
      usuario: usuarioSinPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};