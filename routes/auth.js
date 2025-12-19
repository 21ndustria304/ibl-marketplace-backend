// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const db = require('../config/db');

const router = express.Router();

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'clave_por_defecto_cambiame';

// Configuración de Passport para Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const connection = await mysql.createConnection(db);
    
    // Verificar si el usuario ya existe
    const [existingUsers] = await connection.execute(
      'SELECT * FROM usuarios WHERE google_id = ? OR email = ?',
      [profile.id, profile.emails[0].value]
    );

    if (existingUsers.length > 0) {
      // Usuario existente - actualizar google_id si es necesario
      if (!existingUsers[0].google_id) {
        await connection.execute(
          'UPDATE usuarios SET google_id = ? WHERE id = ?',
          [profile.id, existingUsers[0].id]
        );
      }
      await connection.end();
      return done(null, existingUsers[0]);
    }

    // Crear nuevo usuario
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, email, google_id, avatar) VALUES (?, ?, ?, ?)',
      [
        profile.displayName,
        profile.emails[0].value,
        profile.id,
        profile.photos[0]?.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=DD6031&color=fff`
      ]
    );

    const [newUser] = await connection.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    await connection.end();
    return done(null, newUser[0]);
  } catch (error) {
    console.error('Error en Google OAuth:', error);
    return done(error, null);
  }
}));

// Serializar usuario para sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const connection = await mysql.createConnection(db);
    const [users] = await connection.execute(
      'SELECT * FROM usuarios WHERE id = ?', 
      [id]
    );
    await connection.end();
    done(null, users[0] || null);
  } catch (error) {
    done(error, null);
  }
});

// Función para generar JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// RUTA: POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        message: 'Todos los campos son obligatorios' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const connection = await mysql.createConnection(db);

    // Verificar si el usuario ya existe
    const [existingUsers] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ 
        message: 'El email ya está registrado' 
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, email, password, avatar) VALUES (?, ?, ?, ?)',
      [
        nombre,
        email,
        hashedPassword,
        `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=DD6031&color=fff`
      ]
    );

    // Obtener usuario creado (sin password)
    const [newUser] = await connection.execute(
      'SELECT id, nombre, email, avatar, created_at FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    await connection.end();

    // Generar token
    const token = generateToken(result.insertId);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: newUser[0]
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// RUTA: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son obligatorios' 
      });
    }

    const connection = await mysql.createConnection(db);

    // Buscar usuario
    const [users] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      await connection.end();
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    const user = users[0];

    // Verificar contraseña
    if (!user.password) {
      await connection.end();
      return res.status(401).json({ 
        message: 'Esta cuenta fue creada con Google. Usa "Continuar con Google"' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await connection.end();
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    await connection.end();

    // Generar token
    const token = generateToken(user.id);

    // Enviar respuesta (sin password)
    const { password: _, ...usuarioSinPassword } = user;
    
    res.json({
      message: 'Login exitoso',
      token,
      usuario: usuarioSinPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// RUTA: GET /api/auth/google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// RUTA: GET /api/auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('Usuario no encontrado después de autenticación');
      }

      const user = req.user;
      // Generar token
      const token = generateToken(user.id);

      // Enviar token al frontend
      const { password, google_id, ...usuario } = user;

      // Crear página HTML que enviará el token al popup
      const html = `
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                token: '${token}',
                usuario: ${JSON.stringify(usuario)}
              }, window.location.origin);
              window.close();
            </script>
          </body>
        </html>
      `;
      
      res.send(html);
    } catch (error) {
      const html = `
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Error en autenticación'
              }, window.location.origin);
              window.close();
            </script>
          </body>
        </html>
      `;
      res.send(html);
    }
  }
);

// Middleware para verificar JWT
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer token"
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const connection = await mysql.createConnection(db);
    const [users] = await connection.execute(
      'SELECT id, nombre, email, avatar, rol FROM usuarios WHERE id = ?', 
      [decoded.userId]
    );
    await connection.end();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// RUTA: GET /api/auth/me (verificar token)
router.get('/me', verifyToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }
  res.json({ usuario: req.user });
});

module.exports = { router, verifyToken };