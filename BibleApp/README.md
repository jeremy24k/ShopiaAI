# 📖 ShopiaAI Bible App

> Una aplicación moderna de estudio bíblico potenciada por Inteligencia Artificial

[//]: # (TODO: Agregar banner/logo aquí)

## 🌟 Descripción

ShopiaAI Bible App es una plataforma completa de estudio bíblico que combina la lectura tradicional de las Escrituras con el poder de la Inteligencia Artificial. Diseñada para enriquecer tu experiencia de estudio bíblico mediante explicaciones contextuales, aplicaciones prácticas y perspectivas teológicas personalizadas.

[//]: # (TODO: Personalizar esta descripción con tu visión del proyecto)

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

### Backend (Railway/Render/Heroku)

1. Crear nuevo proyecto
2. Conectar repositorio
3. Configurar variables de entorno
4. Deploy automático desde main branch

### Frontend (Vercel/Netlify)

1. Importar proyecto desde Git
2. Configurar build command: `npm run build`
3. Configurar output directory: `dist`
4. Agregar variables de entorno
5. Deploy

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de `.env.example` en tu plataforma de hosting.

## 🧪 Testing

[//]: # (TODO: Agregar información sobre testing cuando se implemente)

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## 🤝 Contribución

[//]: # (TODO: Crear CONTRIBUTING.md con guías detalladas)

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Búsqueda de versículos
- [ ] Modo oscuro
- [ ] Compartir en redes sociales
- [ ] Notificaciones push
- [ ] App móvil (React Native)
- [ ] Planes de lectura personalizados
- [ ] Grupos de estudio
- [ ] Comentarios de la comunidad

## 📄 Licencia

[//]: # (TODO: Agregar licencia apropiada)

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [Tu GitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Comunidad de React
- Equipo de Supabase
- DeepSeek AI
- Todos los contribuidores

## 📞 Soporte

¿Tienes preguntas o problemas?

- 📧 Email: tu-email@ejemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/shopiaai-bible-app/issues)
- 💬 Discusiones: [GitHub Discussions](https://github.com/tu-usuario/shopiaai-bible-app/discussions)

---

⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub!
