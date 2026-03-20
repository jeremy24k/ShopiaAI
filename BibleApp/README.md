# 📖 ShopiaAI Bible App

> Una aplicación moderna de estudio bíblico potenciada por Inteligencia Artificial

[//]: # (TODO: Agregar banner/logo aquí)

## 🌟 Descripción

SophiaBible es una plataforma completa de estudio bíblico que combina la lectura tradicional de las Escrituras con el poder de la Inteligencia Artificial. Diseñada para enriquecer tu experiencia de estudio bíblico mediante explicaciones contextuales, aplicaciones prácticas y perspectivas teológicas personalizadas.

🌐 **Live:** [sophiabible.com](https://sophiabible.com)

## ⚡ Quick Start

```bash
# 1. Clonar repositorio
git clone [tu-repo-url]
cd BibleApp

# 2. Configurar Backend
cd Backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev

# 3. Configurar Frontend (nueva terminal)
cd ../Frontend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

**Nota:** Necesitas configurar Supabase, DeepSeek API y PayPal antes de que la app funcione completamente. Ver [Instalación](#-instalación) para detalles.

## ✨ Características Principales

### 📚 Lectura y Estudio
- **Múltiples traducciones** - Acceso a diferentes versiones de la Biblia
- **Navegación intuitiva** - Explora libros y capítulos fácilmente
- **Favoritos** - Guarda tus versículos preferidos
- **Notas enriquecidas** - Editor de texto rico con formato completo
- **Tracking de progreso** - Monitorea tu avance de lectura

### 🤖 Inteligencia Artificial
- **Chat contextual** - Conversaciones sobre versículos específicos
- **Múltiples modos** - Guía personal, estudio profundo, aplicación práctica
- **Perspectivas doctrinales** - Respuestas adaptadas a tu tradición teológica
- **Historial de conversaciones** - Accede a tus consultas anteriores
- **Sistema de créditos** - Modelo freemium con créditos diarios gratuitos

### 📊 Métricas y Progreso
- **Versículo del día** - Inspiración diaria
- **Racha de lectura** - Mantén tu hábito de lectura
- **Tiempo de lectura** - Estadísticas de tu dedicación
- **Capítulos completados** - Visualiza tu progreso

### 💳 Monetización
- **Integración con PayPal** - Compra de créditos segura
- **Paquetes flexibles** - Diferentes opciones según tus necesidades
- **Créditos diarios gratuitos** - Acceso básico sin costo

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Biblioteca de UI moderna
- **Vite** - Build tool ultrarrápido
- **React Router v7** - Navegación SPA
- **Zustand** - State management ligero
- **Quill** - Editor de texto rico
- **Lucide React** - Iconos modernos

### Backend
- **Node.js + Express** - API REST
- **Supabase** - Base de datos PostgreSQL + Auth
- **DeepSeek AI** - Modelo de lenguaje para IA
- **PayPal SDK** - Procesamiento de pagos

### Servicios Externos
- **Supabase** - Authentication, Database, Storage
- **DeepSeek** - AI Language Model
- **PayPal** - Payment Processing

## 📋 Requisitos Previos

- **Node.js** v18 o superior
- **npm** o **pnpm**
- Cuenta de **Supabase**
- API Key de **DeepSeek**
- Cuenta de desarrollador de **PayPal** (sandbox o live)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/shopiaai-bible-app.git
cd shopiaai-bible-app
```

### 2. Configurar el Backend

```bash
cd BibleApp/Backend
npm install
```

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=tu-supabase-url
SUPABASE_SERVICE_KEY=tu-supabase-service-key

DEEPSEEK_API_KEY=tu-deepseek-api-key

PAYPAL_CLIENT_ID=tu-paypal-client-id
PAYPAL_CLIENT_SECRET=tu-paypal-client-secret
PAYPAL_MODE=sandbox
```

### 3. Configurar el Frontend

```bash
cd ../Frontend
npm install
```

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-supabase-anon-key
VITE_PAYPAL_CLIENT_ID=tu-paypal-client-id
```

### 4. Configurar Supabase

#### Crear las tablas necesarias:

```sql
-- Users (manejado por Supabase Auth)

-- User Credits
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'FREE',
  total_paid_credits_purchased INTEGER DEFAULT 0,
  last_daily_credit DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Credit Transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'completed',
  conversation_id UUID,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  mode_id TEXT DEFAULT 'personal_guide',
  doctrine_id TEXT DEFAULT 'evangelical',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversation Messages
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  verse_context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_data JSONB NOT NULL,
  content_delta JSONB,
  content_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, verse_data)
);

-- Reading Progress
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  translation TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  reading_time INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id, chapter, translation)
);
```

#### Configurar Row Level Security (RLS):

```sql
-- Enable RLS on all tables
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Policies (ejemplo para notes, replicar para otras tablas)
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);
```

## 🎮 Comandos Disponibles

### Backend

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 📁 Estructura del Proyecto

```
ShopiaAI/
├── BibleApp/
│   ├── Backend/
│   │   ├── AI/              # Servicios de IA
│   │   ├── config/          # Configuraciones
│   │   ├── middleware/      # Middlewares Express
│   │   ├── routes/          # Rutas de la API
│   │   ├── services/        # Lógica de negocio
│   │   ├── utils/           # Utilidades
│   │   ├── server.js        # Punto de entrada
│   │   └── .env.example     # Variables de entorno
│   │
│   └── Frontend/
│       ├── src/
│       │   ├── components/  # Componentes reutilizables
│       │   ├── features/    # Features por módulo
│       │   ├── hooks/       # Custom hooks
│       │   ├── pages/       # Páginas principales
│       │   ├── store/       # Zustand stores
│       │   ├── styles/      # CSS modules
│       │   ├── utils/       # Utilidades
│       │   ├── App.jsx      # Componente principal
│       │   └── main.jsx     # Punto de entrada
│       └── .env.example     # Variables de entorno
```

## 🔐 Autenticación

La aplicación usa **Supabase Auth** para manejo de usuarios:

- Registro con email/password
- Login/Logout
- Sesiones persistentes
- Protección de rutas

## 💰 Sistema de Créditos

- **Créditos diarios gratuitos**: 10 créditos/día
- **Costo por mensaje de IA**: 1 crédito
- **Paquetes de pago**: Disponibles vía PayPal

## 🌍 Internacionalización

Soporte para múltiples idiomas:
- Español (es)
- Inglés (en)

## 🚀 Deployment

### Backend (Railway)

1. **Crear nuevo proyecto en Railway**
   ```bash
   # Instalar Railway CLI (opcional)
   npm i -g @railway/cli
   railway login
   ```

2. **Configurar variables de entorno en Railway Dashboard:**
   ```env
   NODE_ENV=production
   PORT=5000
   SUPABASE_URL=tu-supabase-url
   SUPABASE_SERVICE_KEY=tu-supabase-service-key
   DEEPSEEK_API_KEY=tu-deepseek-api-key
   PAYPAL_CLIENT_ID=tu-paypal-client-id
   PAYPAL_CLIENT_SECRET=tu-paypal-client-secret
   PAYPAL_MODE=live
   ALLOWED_ORIGINS=https://sophiabible.com,https://www.sophiabible.com
   ```

3. **Deploy**
   - Conectar repositorio GitHub
   - Railway detectará automáticamente el `railway.json`
   - El deploy se ejecutará automáticamente

4. **Obtener URL del backend**
   - Copiar la URL generada (ej: `https://tu-app.railway.app`)
   - Usarla como `VITE_BACKEND_URL` en el frontend

### Frontend (Vercel)

1. **Importar proyecto desde GitHub**
   - Ir a [vercel.com](https://vercel.com)
   - Click en "Import Project"
   - Seleccionar repositorio

2. **Configurar proyecto**
   - Framework Preset: `Vite`
   - Root Directory: `BibleApp/Frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Configurar variables de entorno:**
   ```env
   VITE_SUPABASE_URL=tu-supabase-url
   VITE_SUPABASE_ANON_KEY=tu-supabase-anon-key
   VITE_BACKEND_URL=https://tu-backend.railway.app
   VITE_PAYPAL_CLIENT_ID=tu-paypal-client-id
   VITE_SENTRY_DSN=tu-sentry-dsn
   VITE_FORMSPREE_ID=tu-formspree-id
   ```

4. **Configurar dominio personalizado**
   - En Vercel Dashboard > Settings > Domains
   - Agregar: `sophiabible.com`
   - Agregar: `www.sophiabible.com`
   - Seguir instrucciones de DNS

5. **Configurar DNS en tu proveedor de dominio**
   ```
   Tipo: A
   Host: @
   Valor: 76.76.21.21
   
   Tipo: CNAME
   Host: www
   Valor: cname.vercel-dns.com
   ```

6. **Deploy**
   - Vercel deployará automáticamente
   - SSL se configurará automáticamente

### Verificación Post-Deployment

- [ ] Backend responde en `/health`
- [ ] Frontend carga correctamente
- [ ] CORS configurado (sin errores en consola)
- [ ] Autenticación funciona
- [ ] IA responde correctamente
- [ ] PayPal funciona en modo live
- [ ] SSL activo (https)
- [ ] Dominio personalizado funcionando

## 🧪 Testing

### Checklist de Testing Manual

Antes de lanzar a producción, verifica:

**Autenticación:**
- [ ] Registro de nuevo usuario
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas (debe fallar)
- [ ] Logout
- [ ] Persistencia de sesión (refresh página)

**Lectura:**
- [ ] Navegación entre libros
- [ ] Navegación entre capítulos
- [ ] Cambio de traducciones
- [ ] Scroll y rendimiento

**Funcionalidades:**
- [ ] Agregar/eliminar favoritos
- [ ] Crear/editar/eliminar notas
- [ ] Chat con IA (3 modos)
- [ ] Historial de conversaciones
- [ ] Compra de créditos (PayPal sandbox primero)

**UI/UX:**
- [ ] Modo oscuro/claro
- [ ] Cambio de idioma ES/EN
- [ ] Responsive mobile
- [ ] Responsive tablet
- [ ] Responsive desktop

**Performance:**
- [ ] Lighthouse score >90
- [ ] Sin console.errors en producción
- [ ] Tiempo de carga <3s

## 🐛 Troubleshooting

### Error: "CORS policy blocked"

**Causa:** El backend no permite requests desde tu dominio frontend.

**Solución:**
```env
# Backend .env
ALLOWED_ORIGINS=https://sophiabible.com,https://www.sophiabible.com
```

### Error: "Supabase client error"

**Causa:** Variables de entorno incorrectas o no configuradas.

**Solución:**
1. Verificar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
2. Verificar que las variables empiecen con `VITE_` en frontend
3. Rebuild después de cambiar variables de entorno

### Error: "PayPal button not loading"

**Causa:** Client ID incorrecto o no configurado.

**Solución:**
```env
# Frontend .env
VITE_PAYPAL_CLIENT_ID=tu-client-id-correcto
```

### Error: "AI not responding"

**Causa:** DeepSeek API key inválida o sin créditos.

**Solución:**
1. Verificar `DEEPSEEK_API_KEY` en backend
2. Verificar saldo en cuenta DeepSeek
3. Revisar logs del backend para más detalles

### Build falla en Vercel

**Causa:** Variables de entorno faltantes o errores de sintaxis.

**Solución:**
1. Verificar todas las variables `VITE_*` en Vercel Dashboard
2. Revisar logs de build en Vercel
3. Probar build local: `npm run build`

### Backend no responde en Railway

**Causa:** Puerto incorrecto o variables de entorno faltantes.

**Solución:**
1. Verificar que `PORT` esté configurado
2. Railway asigna puerto automáticamente, usar `process.env.PORT`
3. Revisar logs en Railway Dashboard

## 📊 Monitoreo

### Sentry (Error Tracking)

La aplicación usa Sentry para tracking de errores en producción:

1. Crear cuenta en [sentry.io](https://sentry.io)
2. Crear nuevo proyecto (React)
3. Copiar DSN
4. Configurar en frontend:
   ```env
   VITE_SENTRY_DSN=tu-sentry-dsn
   ```

### Logs del Backend

Para ver logs en Railway:
```bash
railway logs
```

### Analytics

Considera agregar Google Analytics o Plausible para tracking de usuarios:

```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## 🤝 Contribución

[//]: # (TODO: Crear CONTRIBUTING.md con guías detalladas)

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

### ✅ Completado
- [x] Múltiples traducciones bíblicas (58+)
- [x] Sistema de autenticación
- [x] Chat con IA (3 modos especializados)
- [x] Notas con editor rico
- [x] Sistema de favoritos
- [x] Tracking de progreso
- [x] Sistema de créditos
- [x] Integración PayPal
- [x] Modo oscuro/claro
- [x] Internacionalización (ES/EN)
- [x] Responsive design

### 🚧 En Desarrollo
- [ ] Búsqueda de versículos por palabra clave
- [ ] Planes de lectura personalizados
- [ ] Compartir versículos en redes sociales
- [ ] Exportar notas (PDF/Markdown)

### 🔮 Futuro
- [ ] App móvil (React Native)
- [ ] Notificaciones push
- [ ] Grupos de estudio
- [ ] Audio bíblico
- [ ] Comentarios de la comunidad
- [ ] Integración con calendarios

## 📄 Licencia

Este proyecto es privado y está en desarrollo activo.

## 👥 Autor

**SophiaBible Team** - [sophiabible.com](https://sophiabible.com)

## 🙏 Agradecimientos

- Comunidad de React
- Equipo de Supabase
- DeepSeek AI
- Todos los contribuidores

## 📞 Soporte

¿Tienes preguntas o problemas?

- 🌐 Website: [sophiabible.com](https://sophiabible.com)
- � Formulario de contacto en la landing page
- 🐛 Reportar bugs vía formulario de feedback en la app

---

**SophiaBible** - Estudia la Biblia con el Poder de la IA 📖✨
