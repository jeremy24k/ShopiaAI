# Guía de Logging - ShopiaAI Bible App

## Sistema de Logging Implementado

Se ha implementado un sistema de logging profesional que:
- Solo muestra logs en **desarrollo**
- En **producción** solo muestra errores críticos
- Usa colores y formato consistente
- Permite crear loggers con contexto específico

## Uso del Logger

### Frontend

```javascript
import Logger from '../utils/logger';

// Logger con contexto específico
const logger = Logger.create('ComponentName');

// Niveles de logging
logger.debug('Mensaje de debug'); // Solo desarrollo
logger.info('Información general'); // Solo desarrollo
logger.warn('Advertencia'); // Solo desarrollo
logger.error('Error crítico'); // Desarrollo y producción
```

### Backend

```javascript
import Logger from '../utils/logger.js';

const logger = Logger.create('ServiceName');

logger.debug('Debug info');
logger.info('Info message');
logger.warn('Warning');
logger.error('Critical error');
```

## Política de Logs

### ✅ MANTENER (convertir a logger.error)
- Errores de API/fetch
- Errores de autenticación
- Errores de base de datos
- Errores de integración (PayPal, DeepSeek)
- Errores críticos del sistema

### ⚠️ CONVERTIR (a logger.debug o logger.info)
- Logs de debugging
- Logs de flujo de datos
- Logs de estado de componentes
- Logs informativos

### ❌ ELIMINAR
- console.log de testing temporal
- Logs redundantes
- Logs de valores obvios
- Logs excesivos en loops

## Archivos Optimizados

### Stores (Frontend)
- ✅ `AiStore.jsx` - Logs críticos convertidos a logger
- ✅ `AuthStore.jsx` - Logs críticos convertidos a logger
- ✅ `BooksStore.jsx` - Logs críticos convertidos a logger
- ⏳ Otros stores pendientes

### Backend
- ✅ Sistema de logger implementado
- ⏳ Rutas pendientes de optimización
- ⏳ Servicios pendientes de optimización

## Próximos Pasos

1. Reemplazar console.log en stores restantes
2. Optimizar logs en componentes de UI
3. Limpiar logs en servicios de backend
4. Verificar que no haya logs sensibles (API keys, passwords)
