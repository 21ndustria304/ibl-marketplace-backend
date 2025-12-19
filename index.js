const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Importar conexión a la DB
const db = require('./config/db');

// Inicializar app
const app = express();

// Configurar CORS con credenciales para sesiones
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);
    
    // Permitir cualquier localhost en desarrollo
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // En producción, solo permitir orígenes específicos
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Configuración de sesiones ANTES de las rutas
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_sesion_super_secreta_123456',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // false para desarrollo local
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Importar las rutas de autenticación
const authRoutes = require('./routes/authRoutes');
const supermercadoRoutes = require('./routes/supermercadoRoutes');
const productoRoutes = require('./routes/productoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const categoriasRoutes = require("./routes/categoriasRoutes");

// Usar las rutas (todas empiezan con /api/)
app.use('/api/auth', authRoutes);
app.use('/api/supermercados', supermercadoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use("/api/categorias", categoriasRoutes);

// Servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});