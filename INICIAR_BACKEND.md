# 🚀 Cómo Iniciar el Backend

## Pasos para iniciar el servidor backend:

### 1. Ir al directorio del backend:
```bash
cd backend
```

### 2. Instalar dependencias (si es la primera vez):
```bash
npm install
```

### 3. Iniciar el servidor:
```bash
npm start
```

O si tienes nodemon instalado:
```bash
npm run dev
```

### 4. Verificar que está corriendo:

Deberías ver en la terminal:
```
✅ Servidor corriendo en http://localhost:3001
```

### 5. Probar que funciona:

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

## ⚠️ Problemas Comunes:

### Error: "Puerto 3001 ya en uso"
```bash
# Cambiar el puerto en backend/index.js
const PORT = 3002; // O cualquier otro puerto disponible
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
npm install
```

### Error: "Database connection failed"
- Verifica que MySQL esté corriendo
- Verifica la configuración en `backend/config/db.js`

## 📝 Nota:

El backend **DEBE estar corriendo** para que Flutter pueda conectarse. Asegúrate de tener el backend ejecutándose en una terminal separada antes de usar la app Flutter.


