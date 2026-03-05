# 📡 API Documentation - ShopiaAI Bible App

## Base URL

- **Development:** `http://localhost:5000`
- **Production:** `https://your-api-domain.com`

---

## 📚 Bible Endpoints

### GET /api/translations

Obtiene la lista de traducciones disponibles de la Biblia.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rvr1960",
      "name": "Reina Valera 1960",
      "language": "es"
    },
    {
      "id": "nvi",
      "name": "Nueva Versión Internacional",
      "language": "es"
    }
  ]
}
```

---

### GET /api/books/:translation

Obtiene la lista de libros para una traducción específica.

**Parameters:**
- `translation` (string): ID de la traducción (ej: "rvr1960")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "genesis",
      "name": "Génesis",
      "testament": "OT",
      "chapters": 50
    }
  ]
}
```

---

### GET /api/chapter/:translation/:book/:chapter

Obtiene los versículos de un capítulo específico.

**Parameters:**
- `translation` (string): ID de la traducción
- `book` (string): ID del libro
- `chapter` (number): Número del capítulo

**Response:**
```json
{
  "success": true,
  "data": {
    "book": "genesis",
    "chapter": 1,
    "verses": [
      {
        "number": 1,
        "text": "En el principio creó Dios los cielos y la tierra."
      }
    ]
  }
}
```

---

### GET /api/commentaries

Obtiene la lista de comentarios bíblicos disponibles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "matthew-henry",
      "name": "Matthew Henry Commentary",
      "language": "en"
    }
  ]
}
```

---

### GET /api/commentary-books/:commentary

Obtiene los libros disponibles para un comentario específico.

**Parameters:**
- `commentary` (string): ID del comentario

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "genesis",
      "name": "Genesis",
      "chapters": 50
    }
  ]
}
```

---

### GET /api/commentary/:commentary/:book/:chapter

Obtiene el comentario de un capítulo específico.

**Parameters:**
- `commentary` (string): ID del comentario
- `book` (string): ID del libro
- `chapter` (number): Número del capítulo

**Response:**
```json
{
  "success": true,
  "data": {
    "book": "genesis",
    "chapter": 1,
    "commentary": "Commentary text here..."
  }
}
```

---

## 🤖 AI Endpoints

### POST /api/ai/chat-stream

Endpoint principal para chat con IA usando Server-Sent Events (SSE).

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "¿Qué significa este versículo?",
  "messageType": "question",
  "verseContext": {
    "verse": "Juan 3:16",
    "text": "Porque de tal manera amó Dios al mundo...",
    "book": "Juan",
    "chapter": 3,
    "verseNumber": 16,
    "translation": "rvr1960"
  },
  "conversationHistory": [
    {
      "role": "user",
      "content": "Mensaje anterior"
    },
    {
      "role": "assistant",
      "content": "Respuesta anterior"
    }
  ],
  "modeId": "personal_guide",
  "doctrineId": "evangelical",
  "language": "es"
}
```

**Parameters:**
- `message` (string, required): Mensaje del usuario
- `messageType` (string): "question" o "button"
- `verseContext` (object, optional): Contexto del versículo
- `conversationHistory` (array): Historial de la conversación
- `modeId` (string): ID del modo de IA (default: "personal_guide")
- `doctrineId` (string): ID de la perspectiva doctrinal (default: "evangelical")
- `language` (string): Código de idioma (default: "es")

**Response (SSE Stream):**
```
data: {"chunk": "Texto de la respuesta..."}

data: {"chunk": " más texto..."}

data: {"done": true}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Insufficient credits",
  "creditsNeeded": 1,
  "currentCredits": 0
}
```

---

### GET /api/ai/modes

Obtiene los modos de IA disponibles.

**Query Parameters:**
- `lang` (string): Código de idioma (default: "es")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "personal_guide",
      "name": "Guía Personal",
      "description": "Asistente personal para estudio bíblico",
      "icon": "user"
    },
    {
      "id": "deep_study",
      "name": "Estudio Profundo",
      "description": "Análisis teológico detallado",
      "icon": "book-open"
    }
  ]
}
```

---

### GET /api/ai/perspectives

Obtiene las perspectivas doctrinales disponibles.

**Query Parameters:**
- `lang` (string): Código de idioma (default: "es")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "evangelical",
      "name": "Evangélica",
      "description": "Perspectiva evangélica protestante"
    },
    {
      "id": "catholic",
      "name": "Católica",
      "description": "Perspectiva católica romana"
    }
  ]
}
```

---

### GET /api/ai/validate-combination/:modeId/:doctrineId

Valida si una combinación de modo y doctrina es válida.

**Parameters:**
- `modeId` (string): ID del modo
- `doctrineId` (string): ID de la doctrina

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "Combination is valid"
  }
}
```

---

### GET /api/ai/costs

Obtiene los costos de las acciones de IA.

**Response:**
```json
{
  "success": true,
  "data": {
    "chat_message": 1,
    "verse_explanation": 1
  }
}
```

---

### GET /api/ai/test

Endpoint de prueba para verificar la conexión con DeepSeek.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "DeepSeek connection successful",
    "model": "deepseek-chat"
  }
}
```

---

## 💳 Payment Endpoints

### POST /api/payments/create-order

Crea una orden de pago en PayPal.

**Request Body:**
```json
{
  "packageId": "starter",
  "userId": "user-uuid-here"
}
```

**Response:**
```json
{
  "orderID": "paypal-order-id"
}
```

---

### POST /api/payments/capture-order

Captura el pago de una orden de PayPal.

**Request Body:**
```json
{
  "orderID": "paypal-order-id"
}
```

**Response:**
```json
{
  "success": true,
  "credits": 100,
  "newBalance": 150
}
```

**Error Response:**
```json
{
  "error": "Payment not completed",
  "status": "PENDING"
}
```

---

### GET /api/payments/packages

Obtiene los paquetes de créditos disponibles.

**Response:**
```json
{
  "packages": [
    {
      "id": "starter",
      "name": "Starter",
      "credits": 100,
      "price": 4.99,
      "currency": "USD",
      "description": "100 AI Credits"
    },
    {
      "id": "pro",
      "name": "Pro",
      "credits": 500,
      "price": 19.99,
      "currency": "USD",
      "description": "500 AI Credits"
    }
  ]
}
```

---

### GET /api/payments/credits/:userId

Obtiene los créditos actuales de un usuario.

**Parameters:**
- `userId` (string): UUID del usuario

**Response:**
```json
{
  "data": {
    "user_id": "user-uuid",
    "credits": 50,
    "tier": "PRO",
    "total_paid_credits_purchased": 500
  },
  "credits": 50,
  "tier": "PRO"
}
```

---

### POST /api/payments/daily-credits

Otorga créditos diarios gratuitos a un usuario.

**Request Body:**
```json
{
  "userId": "user-uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "credits_granted": 10,
  "new_balance": 60,
  "message": "Daily credits granted successfully"
}
```

**Error Response (ya reclamados hoy):**
```json
{
  "success": false,
  "message": "Daily credits already claimed today",
  "next_available": "2024-03-04T00:00:00Z"
}
```

---

## 🔐 Authentication

La autenticación se maneja a través de **Supabase Auth**. El frontend usa el cliente de Supabase para:

- Registro de usuarios
- Login/Logout
- Gestión de sesiones
- Tokens JWT automáticos

**No se requieren headers de autenticación en las llamadas a la API del backend**, ya que Supabase maneja la autenticación directamente desde el frontend.

---

## ❌ Error Handling

Todos los endpoints siguen un formato consistente de errores:

**Error Response:**
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

**Códigos de Estado HTTP:**
- `200` - Success
- `400` - Bad Request (parámetros inválidos)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (sin permisos)
- `404` - Not Found (recurso no encontrado)
- `500` - Internal Server Error (error del servidor)

---

## 🔄 Rate Limiting

**Actualmente no implementado**, pero se recomienda para producción:

- Límite general: 100 requests/minuto por IP
- Límite de IA: 10 mensajes/minuto por usuario
- Límite de pagos: 5 transacciones/hora por usuario

---

## 📝 Notas Importantes

1. **SSE (Server-Sent Events):** El endpoint `/api/ai/chat-stream` usa SSE para streaming de respuestas en tiempo real.

2. **CORS:** El backend está configurado para aceptar requests desde el frontend. Asegúrate de configurar `FRONTEND_URL` correctamente.

3. **Créditos:** Todas las acciones de IA requieren créditos. Verifica el balance antes de hacer llamadas.

4. **PayPal Modes:** Usa `sandbox` para desarrollo y `live` para producción.

5. **Idiomas:** Los endpoints de IA soportan múltiples idiomas mediante el parámetro `lang` o `language`.

---

## 🧪 Testing con cURL

### Obtener traducciones:
```bash
curl http://localhost:5000/api/translations
```

### Obtener capítulo:
```bash
curl http://localhost:5000/api/chapter/rvr1960/genesis/1
```

### Chat con IA (requiere créditos):
```bash
curl -X POST http://localhost:5000/api/ai/chat-stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explícame Juan 3:16",
    "modeId": "personal_guide",
    "doctrineId": "evangelical"
  }'
```

### Obtener paquetes de créditos:
```bash
curl http://localhost:5000/api/payments/packages
```

---

## 📚 Recursos Adicionales

- [Supabase Documentation](https://supabase.com/docs)
- [DeepSeek AI Documentation](https://platform.deepseek.com/docs)
- [PayPal Developer Documentation](https://developer.paypal.com/docs/api/overview/)
- [Server-Sent Events (SSE) Guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
