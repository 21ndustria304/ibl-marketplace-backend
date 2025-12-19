const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();
const authController = require('../controllers/authController');

// Configuración de Passport para Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  console.log('Google profile recibido:', profile.displayName, profile.emails[0].value);
  
  // Verificar si el usuario ya existe
  db.query('SELECT * FROM usuarios WHERE google_id = ? OR email = ?', 
    [profile.id, profile.emails[0].value], 
    (err, users) => {
      if (err) {
        console.error('Error en consulta Google:', err);
        return done(err, null);
      }
      
      if (users.length > 0) {
        // Usuario existente - actualizar google_id si es necesario
        const user = users[0];
        if (!user.google_id) {
          db.query('UPDATE usuarios SET google_id = ? WHERE id = ?', 
            [profile.id, user.id], 
            (updateErr) => {
              if (updateErr) console.error('Error actualizando google_id:', updateErr);
            }
          );
        }
        console.log('Usuario Google existente:', user.nombre);
        return done(null, user);
      }
      
      // Crear nuevo usuario
      db.query(
        'INSERT INTO usuarios (nombre, email, google_id, avatar) VALUES (?, ?, ?, ?)',
        [
          profile.displayName,
          profile.emails[0].value,
          profile.id,
          profile.photos[0]?.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=DD6031&color=fff`
        ],
        (err, result) => {
          if (err) {
            console.error('Error creando usuario Google:', err);
            return done(err, null);
          }
          
          // Obtener el usuario recién creado
          db.query('SELECT * FROM usuarios WHERE id = ?', [result.insertId], (err, newUser) => {
            if (err) {
              console.error('Error obteniendo nuevo usuario:', err);
              return done(err, null);
            }
            console.log('Nuevo usuario Google creado:', newUser[0].nombre);
            return done(null, newUser[0]);
          });
        }
      );
    }
  );
}));

// Serialización para sesiones (requerido por Passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, users) => {
    done(err, users[0]);
  });
});

// Rutas de autenticación tradicional
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas de Google OAuth
router.get('/google', (req, res, next) => {
  console.log('Iniciando autenticación con Google...');
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login' 
  }),
  (req, res) => {
    try {
      console.log('Google callback exitoso para:', req.user.nombre);
      
      // Generar token JWT
      const token = jwt.sign(
        { userId: req.user.id },
        process.env.JWT_SECRET || 'mi_secreto',
        { expiresIn: '7d' }
      );

      // Preparar datos del usuario sin información sensible
      const usuario = {
        id: req.user.id,
        nombre: req.user.nombre,
        email: req.user.email,
        avatar: req.user.avatar
      };

      // Enviar respuesta al popup del frontend
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Autenticación exitosa</title>
          </head>
          <body>
            <div style="text-align: center; font-family: Arial, sans-serif; padding: 50px;">
              <h2>¡Autenticación exitosa!</h2>
              <p>Cerrando ventana...</p>
            </div>
            <script>
              try {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: '${token}',
                  usuario: ${JSON.stringify(usuario)}
                }, window.location.origin);
                window.close();
              } catch(error) {
                console.error('Error enviando mensaje:', error);
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_ERROR',
                  error: 'Error enviando datos'
                }, window.location.origin);
                window.close();
              }
            </script>
          </body>
        </html>
      `;
      
      res.send(html);
    } catch (error) {
      console.error('Error en Google callback:', error);
      
      const errorHtml = `
        <!DOCTYPE html>
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Error en autenticación con Google'
              }, window.location.origin);
              window.close();
            </script>
          </body>
        </html>
      `;
      res.send(errorHtml);
    }
  }
);

module.exports = router;