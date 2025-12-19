# 🚀 Cómo Iniciar el Backend - Guía Paso a Paso

## 📋 Pasos para Iniciar el Backend:

### Paso 1: Abrir una Terminal Nueva

Abre una nueva terminal o ventana de comandos (CMD o PowerShell en Windows).

### Paso 2: Navegar al Directorio del Backend

```bash
cd B:\Trabajos\ibl-marketplace\backend
```

O si estás en el directorio raíz del proyecto:
```bash
cd backend
```

### Paso 3: Instalar Dependencias (Solo la Primera Vez)

Si es la primera vez que ejecutas el backend, necesitas instalar las dependencias:

```bash
npm install
```

Esto instalará todos los paquetes necesarios (express, mysql2, etc.).

**⏱️ Esto puede tomar 1-2 minutos la primera vez.**

### Paso 4: Iniciar el Servidor

Una vez instaladas las dependencias, inicia el servidor:

```bash
npm start
```

O si tienes nodemon instalado (para auto-recargar):
```bash
npm run dev
```

### Paso 5: Verificar que Está Corriendo

Deberías ver en la terminal:
```
✅ Servidor corriendo en http://localhost:3001
```

## ✅ Verificar que Funciona:

Abre tu navegador y ve a:
```
http://localhost:3001/api/test
```

Deberías ver un JSON como:
```json
{
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-XX...",
  "env": "development"
}
```

## 🎯 Comandos Rápidos:

```bash
# 1. Ir al directorio backend
cd backend

# 2. Instalar dependencias (solo primera vez)
npm install

# 3. Iniciar el servidor
npm start
```

## ⚠️ Problemas Comunes:

### Error: "npm no se reconoce"
- **Solución:** Necesitas instalar Node.js
- Descarga desde: https://nodejs.org/
- Instala la versión LTS

### Error: "Puerto 3001 ya en uso"
- **Solución:** Algo más está usando el puerto 3001
- Opción 1: Cierra la aplicación que está usando el puerto
- Opción 2: Cambia el puerto en `backend/index.js`:
  ```javascript
  const PORT = 3002; // Cambia a otro puerto
  ```

### Error: "Cannot find module"
- **Solución:** Las dependencias no están instaladas
- Ejecuta: `npm install`

### Error: "Database connection failed"
- **Solución:** Necesitas configurar la base de datos MySQL
- Revisa el archivo `backend/config/db.js`
- O comenta temporalmente las rutas que usan la base de datos

## 📝 Notas Importantes:

1. **Mantén esta terminal abierta** mientras uses la aplicación Flutter
2. **No cierres la terminal** - el servidor se detendrá si la cierras
3. **Para detener el servidor:** Presiona `Ctrl + C` en la terminal
4. **Para reiniciar:** Presiona `Ctrl + C` y luego ejecuta `npm start` de nuevo

## 🔄 Reiniciar el Backend:

Si haces cambios en el código del backend:
1. Presiona `Ctrl + C` en la terminal del backend
2. Ejecuta `npm start` de nuevo

O si usas `npm run dev` (nodemon), se reinicia automáticamente.

## 📊 Ver Logs:

El backend mostrará logs en la terminal cada vez que reciba una petición:
```
2024-01-XX - POST /api/auth/login
2024-01-XX - GET /api/supermercados
```

Esto te ayuda a ver qué está pasando cuando usas la app Flutter.


