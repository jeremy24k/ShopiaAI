# 🚀 BETA LAUNCH CHECKLIST - SophiaBible

## 📋 Resumen Ejecutivo

Este documento contiene todos los pasos necesarios para lanzar la beta abierta de SophiaBible.

**Dominio:** sophiabible.com  
**Backend:** Railway  
**Frontend:** Vercel  
**Estado:** Pre-lanzamiento

---

## ✅ COMPLETADO

- [x] Dominio adquirido (sophiabible.com)
- [x] Políticas de privacidad y términos en landing page
- [x] RLS (Row Level Security) activado en Supabase
- [x] Onboarding básico implementado
- [x] SEO básico configurado
- [x] Cuentas en Railway (backend) y Vercel (frontend)
- [x] `.env.example` creados (Frontend + Backend)
- [x] `vercel.json` configurado
- [x] `railway.json` configurado
- [x] CORS actualizado con dominio de producción
- [x] Console.logs limpiados en archivos críticos
- [x] README mejorado con instrucciones completas

---

## 🔴 CRÍTICO - HACER ANTES DE LANZAR

### 1. Deployment Backend (Railway)

**Tiempo estimado:** 15 minutos

- [ ] Conectar repositorio GitHub a Railway
- [ ] Configurar variables de entorno:
  ```
  NODE_ENV=production
  PORT=5000
  SUPABASE_URL=
  SUPABASE_SERVICE_KEY=
  DEEPSEEK_API_KEY=
  PAYPAL_CLIENT_ID=
  PAYPAL_CLIENT_SECRET=
  PAYPAL_MODE=live
  ALLOWED_ORIGINS=https://sophiabible.com,https://www.sophiabible.com
  ```
- [ ] Verificar que el deploy sea exitoso
- [ ] Copiar URL del backend (ej: `https://sophiabible-backend.railway.app`)
- [ ] Probar endpoint `/health`

**Comando de verificación:**
```bash
curl https://tu-backend.railway.app/health
```

---

### 2. Deployment Frontend (Vercel)

**Tiempo estimado:** 20 minutos

- [ ] Importar proyecto desde GitHub en Vercel
- [ ] Configurar:
  - Framework: `Vite`
  - Root Directory: `BibleApp/Frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`

- [ ] Configurar variables de entorno:
  ```
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  VITE_BACKEND_URL=https://tu-backend.railway.app
  VITE_PAYPAL_CLIENT_ID=
  VITE_SENTRY_DSN=
  VITE_FORMSPREE_ID=
  ```

- [ ] Deploy inicial
- [ ] Verificar que la app carga sin errores

---

### 3. Configurar Dominio Personalizado

**Tiempo estimado:** 30 minutos (+ 24h propagación DNS)

**En Vercel:**
- [ ] Settings > Domains
- [ ] Agregar `sophiabible.com`
- [ ] Agregar `www.sophiabible.com`
- [ ] Copiar instrucciones DNS

**En tu proveedor de dominio:**
- [ ] Configurar registro A:
  ```
  Tipo: A
  Host: @
  Valor: 76.76.21.21
  TTL: 3600
  ```
- [ ] Configurar registro CNAME:
  ```
  Tipo: CNAME
  Host: www
  Valor: cname.vercel-dns.com
  TTL: 3600
  ```

- [ ] Esperar propagación DNS (verificar en https://dnschecker.org)
- [ ] Verificar SSL activo (https)

---

### 4. Configurar PayPal en Modo Live

**Tiempo estimado:** 10 minutos

- [ ] Ir a PayPal Developer Dashboard
- [ ] Cambiar de Sandbox a Live
- [ ] Obtener Live Client ID y Secret
- [ ] Actualizar variables en Railway:
  ```
  PAYPAL_CLIENT_ID=live-client-id
  PAYPAL_CLIENT_SECRET=live-client-secret
  PAYPAL_MODE=live
  ```
- [ ] Actualizar variable en Vercel:
  ```
  VITE_PAYPAL_CLIENT_ID=live-client-id
  ```
- [ ] Redeploy ambos servicios

---

### 5. Verificar Supabase en Producción

**Tiempo estimado:** 15 minutos

- [ ] Verificar RLS activo en todas las tablas:
  - `user_credits`
  - `credit_transactions`
  - `conversations`
  - `conversation_messages`
  - `notes`
  - `notes_verses`
  - `favorites`
  - `reading_progress`
  - `feedback`
  - `ai_feedback`

- [ ] Verificar políticas RLS configuradas
- [ ] Verificar índices en columnas frecuentes:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
  ```

- [ ] Verificar backups automáticos activados
- [ ] Verificar límites del plan gratuito (500MB, 50K usuarios)

---

### 6. Configurar Sentry (Monitoreo de Errores)

**Tiempo estimado:** 10 minutos

- [ ] Crear cuenta en sentry.io
- [ ] Crear proyecto React
- [ ] Copiar DSN
- [ ] Actualizar variable en Vercel:
  ```
  VITE_SENTRY_DSN=tu-sentry-dsn
  ```
- [ ] Redeploy frontend
- [ ] Verificar que Sentry recibe eventos de prueba

---

## 🟡 IMPORTANTE - TESTING COMPLETO

### 7. Testing Manual Completo

**Tiempo estimado:** 1-2 horas

**Autenticación:**
- [ ] Registro de nuevo usuario
- [ ] Confirmación de email (si aplica)
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas (debe fallar)
- [ ] Logout
- [ ] Persistencia de sesión (refresh página)
- [ ] Reset de contraseña (si implementado)

**Lectura Bíblica:**
- [ ] Cargar página de libros
- [ ] Navegar a un libro
- [ ] Navegar entre capítulos (anterior/siguiente)
- [ ] Cambiar traducción
- [ ] Verificar que el contenido cambia correctamente
- [ ] Scroll suave y rendimiento

**Favoritos:**
- [ ] Agregar versículo a favoritos
- [ ] Ver lista de favoritos
- [ ] Eliminar favorito
- [ ] Verificar persistencia

**Notas:**
- [ ] Crear nota nueva
- [ ] Editar nota existente
- [ ] Formatear texto (negrita, cursiva, colores)
- [ ] Guardar nota
- [ ] Eliminar nota
- [ ] Verificar advertencia de cambios no guardados

**Chat con IA:**
- [ ] Iniciar conversación nueva
- [ ] Enviar mensaje
- [ ] Verificar respuesta de IA
- [ ] Probar los 3 modos (Guía Personal, Estudio Profundo, Aplicación Práctica)
- [ ] Verificar consumo de créditos
- [ ] Ver historial de conversaciones
- [ ] Eliminar conversación

**Sistema de Créditos:**
- [ ] Verificar créditos diarios gratuitos (10)
- [ ] Consumir créditos con IA
- [ ] Verificar que se descuentan correctamente
- [ ] Intentar usar IA sin créditos (debe mostrar mensaje)

**Compra de Créditos (PayPal):**
- [ ] Abrir modal de compra
- [ ] Seleccionar paquete
- [ ] Completar pago con PayPal (usar cuenta real de prueba)
- [ ] Verificar que los créditos se agregan
- [ ] Verificar transacción en base de datos

**Progreso de Lectura:**
- [ ] Leer capítulo completo
- [ ] Verificar que se marca como completado
- [ ] Ver estadísticas de progreso
- [ ] Verificar racha de lectura
- [ ] Verificar tiempo de lectura

**UI/UX:**
- [ ] Cambiar a modo oscuro
- [ ] Cambiar a modo claro
- [ ] Cambiar idioma a inglés
- [ ] Cambiar idioma a español
- [ ] Verificar traducciones correctas

**Responsive:**
- [ ] Probar en móvil (iOS)
- [ ] Probar en móvil (Android)
- [ ] Probar en tablet
- [ ] Probar en desktop
- [ ] Verificar que todos los elementos son accesibles

**Formulario de Contacto:**
- [ ] Enviar mensaje desde landing page
- [ ] Verificar que llega a FormSpree
- [ ] Verificar respuesta automática (si aplica)

---

### 8. Testing de Performance

**Tiempo estimado:** 30 minutos

- [ ] Ejecutar Lighthouse en Chrome DevTools
  - Performance: >90
  - Accessibility: >90
  - Best Practices: >90
  - SEO: >90

- [ ] Verificar tiempo de carga inicial <3s
- [ ] Verificar que no hay console.errors en producción
- [ ] Verificar que no hay console.warnings críticos
- [ ] Probar con throttling de red (3G)
- [ ] Verificar lazy loading de imágenes

**Comando:**
```bash
# En Chrome DevTools
1. Abrir DevTools (F12)
2. Ir a pestaña "Lighthouse"
3. Seleccionar "Desktop" o "Mobile"
4. Click en "Generate report"
```

---

### 9. Testing de Seguridad

**Tiempo estimado:** 20 minutos

- [ ] Verificar HTTPS activo (candado verde)
- [ ] Verificar headers de seguridad (Helmet)
- [ ] Intentar acceder a rutas protegidas sin login (debe redirigir)
- [ ] Verificar que tokens no se exponen en localStorage
- [ ] Verificar CORS (no debe haber errores en consola)
- [ ] Verificar rate limiting (intentar spam de requests)

---

## 🟢 OPCIONAL - POST-LANZAMIENTO

### 10. Analytics

- [ ] Configurar Google Analytics 4
- [ ] Agregar tracking de eventos clave:
  - Registro de usuarios
  - Uso de IA
  - Compras de créditos
  - Páginas más visitadas

### 11. Email Transaccional

- [ ] Configurar SendGrid
- [ ] Email de bienvenida
- [ ] Email de confirmación de compra
- [ ] Email de reset de contraseña

### 12. Backups Adicionales

- [ ] Configurar backup manual de Supabase
- [ ] Documentar proceso de restauración
- [ ] Probar restauración de backup

---

## 📊 MÉTRICAS A MONITOREAR

**Primera Semana:**
- Usuarios registrados
- Tasa de conversión (visitantes → registros)
- Uso de IA (mensajes enviados)
- Compras de créditos
- Errores en Sentry
- Tiempo de respuesta del backend
- Uptime (Railway + Vercel)

**Herramientas:**
- Sentry: Errores y performance
- Railway Dashboard: Logs y métricas del backend
- Vercel Analytics: Tráfico y performance del frontend
- Supabase Dashboard: Uso de base de datos
- Google Analytics: Comportamiento de usuarios

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Backend no responde
```bash
# Ver logs en Railway
railway logs

# Verificar variables de entorno
railway variables

# Redeploy
railway up
```

### Frontend no carga
```bash
# Ver logs en Vercel
vercel logs

# Verificar build
npm run build

# Redeploy
vercel --prod
```

### CORS errors
```bash
# Verificar ALLOWED_ORIGINS en Railway
# Debe incluir: https://sophiabible.com,https://www.sophiabible.com
```

### PayPal no funciona
```bash
# Verificar que estás en modo LIVE
# Verificar PAYPAL_CLIENT_ID en ambos servicios
# Verificar que el Client ID es el mismo en frontend y backend
```

---

## ✅ CHECKLIST FINAL PRE-LANZAMIENTO

- [ ] Todos los tests manuales pasados
- [ ] Lighthouse score >90
- [ ] Sin errores en consola de producción
- [ ] HTTPS activo
- [ ] Dominio funcionando (sophiabible.com)
- [ ] PayPal en modo LIVE
- [ ] Sentry configurado y recibiendo eventos
- [ ] Backups de Supabase activos
- [ ] README actualizado
- [ ] Variables de entorno documentadas
- [ ] Plan de rollback definido

---

## 🎉 POST-LANZAMIENTO

**Día 1:**
- [ ] Monitorear Sentry cada 2 horas
- [ ] Revisar logs de Railway
- [ ] Verificar que usuarios pueden registrarse
- [ ] Verificar que compras funcionan

**Primera Semana:**
- [ ] Recolectar feedback de usuarios
- [ ] Priorizar bugs críticos
- [ ] Monitorear métricas diarias
- [ ] Ajustar rate limits si es necesario

**Primer Mes:**
- [ ] Análisis de uso de features
- [ ] Optimizaciones de performance
- [ ] Implementar features del roadmap
- [ ] Considerar plan de escalamiento

---

## 📞 CONTACTOS DE EMERGENCIA

**Servicios:**
- Railway Support: https://railway.app/help
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- DeepSeek Support: [su canal de soporte]

**Documentación:**
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs

---

**Última actualización:** 2026-03-19  
**Versión:** 1.0  
**Estado:** Listo para lanzamiento beta
