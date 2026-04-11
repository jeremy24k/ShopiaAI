---
name: Análisis app y checklist demo/beta
overview: "Análisis exhaustivo del estado actual de la app (BibleApp: Biblia + IA, auth, créditos, PayPal) y lista mínima de tareas para sacar una demo/beta en condiciones, con criterios concretos para validar si seguir o no."
todos: []
isProject: false
---

# Análisis completo de la app y checklist para demo/beta

## 1. Estado actual de la app

### Lo que está terminado y funcional


| Área                  | Estado | Notas                                                                                                                                                  |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Auth**              | Listo  | Supabase Auth: login, signup, logout, sesión. ProtectedRoute en todas las rutas excepto /login.                                                        |
| **Biblia**            | Listo  | Libros, capítulos, versículos, traducciones, comentarios. Rutas anidadas en /books/*.                                                                  |
| **IA**                | Listo  | Chat por streaming (DeepSeek), conversaciones en DB, historial, contexto de versículos, modos/doctrinas, créditos verificados y deducidos tras stream. |
| **Créditos**          | Listo  | Saldo en `user_credits`, consulta por API, deducción tras uso, créditos diarios (RPC).                                                                 |
| **Pagos**             | Listo  | PayPal integrado: create-order, capture-order, paquetes (basic/premium/unlimited), actualización de créditos y transacciones.                          |
| **Favoritos / Notas** | Listo  | Páginas y flujos operativos. Favorites y Notes usan textos en inglés (sin i18n); menor.                                                                |
| **Home**              | Listo  | Versículo del día, métricas, recientes, enlaces.                                                                                                       |
| **Errores**           | Listo  | ErrorBoundary global, RouteError (404), manejo de créditos insuficientes y errores de stream.                                                          |
| **CORS**              | Listo  | `cors()` en backend sin restricción de origen; válido para front y back en distintos dominios.                                                         |


### Lo que falta o es frágil para producción


| Área                            | Estado                    | Impacto para demo/beta                                                                                                                                                                                                                                                         |
| ------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Landing pública**             | No existe                 | Tienes solo /login como ruta pública. Para demo cerrada puedes compartir el link a /login; para “beta en condiciones” ayuda una landing mínima (título + “Entrar” → /login).                                                                                                   |
| **Redirect tras login**         | No implementado           | [Login.jsx](BibleApp/Frontend/src/pages/Login.jsx) siempre navega a `"/"` tras login. ProtectedRoute pasa `state: { from: location }` pero no se usa. El usuario no vuelve a la ruta donde estaba.                                                                             |
| **Logs de debug en producción** | Activos                   | En [AI.jsx](BibleApp/Frontend/src/pages/AI.jsx) existe `DEBUG_AI_CONTEXT = true` y logs `[AI:context]`. En producción conviene atar a `import.meta.env.DEV` o apagarlos.                                                                                                       |
| **Variables de entorno**        | Sin .env.example          | Frontend: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PAYPAL_CLIENT_ID`. Backend: `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DEEPSEEK_API_KEY`, `PAYPAL_`*, `FRONTEND_URL`. No hay archivo de ejemplo; quien despliegue puede equivocarse. |
| **Despliegue**                  | Sin configuración en repo | No hay Dockerfile, vercel.json, railway.json ni equivalente. Backend es Node/Express estándar (`npm start`); se puede desplegar en Render, Railway, Fly.io, etc., pero hay que configurar env y comando a mano.                                                                |
| **Seguridad backend**           | userId desde body         | Las rutas de AI y payments confían en `userId` enviado por el cliente. Un atacante podría enviar otro userId. Para demo/beta con pocos usuarios es un riesgo asumible; para producción habría que validar JWT de Supabase en el backend.                                       |


---

## 2. Mínimo esfuerzo para una demo/beta “en condiciones”

Objetivo: poder desplegar, compartir un enlace y que los primeros usuarios prueben el flujo completo (registro → leer → usar IA → ver créditos) sin bloqueos ni ruido innecesario.

### Tareas obligatorias (poco esfuerzo)

1. **Redirect después del login**
  En [Login.jsx](BibleApp/Frontend/src/pages/Login.jsx), al login/signup exitoso, usar `const from = location.state?.from?.pathname; navigate(from || '/', { replace: true });` en lugar de `navigate("/")`. Así quien entre por ProtectedRoute vuelve a la página que intentaba ver.
2. **Debug solo en desarrollo**
  En [AI.jsx](BibleApp/Frontend/src/pages/AI.jsx), cambiar a `const DEBUG_AI_CONTEXT = import.meta.env.DEV;` (o equivalente) para que los logs `[AI:context]` no salgan en producción.
3. **Documentar env con .env.example**
  Crear en la raíz del Frontend un `.env.example` con `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PAYPAL_CLIENT_ID` (y comentarios breves). En la raíz del Backend otro con `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DEEPSEEK_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`, `FRONTEND_URL`. No commitear `.env` real (ya está en .gitignore).
4. **Instrucciones de despliegue mínimas**
  Añadir una sección “Despliegue” al README (o un DEPLOY.md): (a) Backend: host que ejecute Node (Render/Railway/etc.), comando `npm start`, variables del .env.example. (b) Frontend: build con `npm run build`, host estático (Vercel/Netlify) apuntando a ese build, variables VITE_ y `VITE_API_URL` apuntando a la URL del backend. (c) Supabase: proyecto ya creado, URL y anon key en frontend, service role key solo en backend. (d) PayPal: sandbox para demo, `FRONTEND_URL` y return/cancel URLs coherentes con el front desplegado.

### Tareas opcionales (mejoran la demo)

1. **Landing mínima**
  Si quieres una URL “presentable” sin login: ruta pública (ej. `/` o `/landing`) con una página que muestre título, una línea de valor (ej. “Biblia + IA para tu estudio”) y un botón “Entrar” que lleve a `/login`. Puedes hacerla después; para beta cerrada no es imprescindible si compartes directamente el enlace a la app (que redirige a login).
2. **Validar JWT en backend**
  Para mayor seguridad antes de abrir a más gente: en las rutas de AI y payments, leer el token de Supabase (header o cookie), verificar con Supabase y usar el `user.id` del token en lugar del body. No es estrictamente necesario para la primera demo.

---

## 3. Cómo validar “si vale la pena seguir”

Objetivo: tomar una decisión con datos, no solo con sensación.

**Pasos:**

1. **Desplegar**
  Backend + Frontend + Supabase + PayPal sandbox con las env correctas. Comprobar: registro, login, leer un capítulo, abrir IA, enviar un mensaje, ver créditos y (opcional) compra en sandbox.
2. **Compartir con un grupo acotado**
  Enviar el enlace a 15–30 personas que encajen (comunidades de fe, estudio bíblico, amigos). Mensaje claro: “Es una beta; quiero saber si os resulta útil.” Opcional: dar a cada uno unos créditos de regalo o usar solo créditos diarios para que prueben sin pagar.
3. **Métricas mínimas a observar (sin analytics complejo)**
  - Cuántos se registran.  
  - Cuántos usan la IA al menos una vez (puedes verlo por uso de créditos o por conversaciones en Supabase).  
  - Cuántos vuelven otro día (si tienes `updated_at` en conversaciones o último login, puedes aproximar).
4. **Criterio de decisión**
  - Si una parte razonable se registra (ej. >50% de los que abren el link) y una parte usa la IA (ej. >30% de registrados), y al menos unos pocos vuelven: **sí vale la pena seguir**; hay interés y uso.  
  - Si casi nadie se registra o nadie usa la IA: no es que “la app no valga”, sino que o el canal/audiencia no encaja, o el valor no está claro en el primer contacto; se puede iterar (landing, mensaje, otro público) o decidir parar con la cabeza fría.
5. **Límite de tiempo**
  Fijar una fecha (ej. 2–4 semanas después de compartir) para revisar esos números y decidir: seguir invirtiendo, pivotar (ej. solo landing + waitlist), o cerrar el experimento. Así evitas arrastrar la duda indefinidamente.

---

## 4. Resumen ejecutivo

- **La app está muy avanzada:** auth, Biblia, IA con streaming y contexto, créditos y PayPal funcionan. No falta un “core” por construir para una demo.
- **Para una demo/beta en condiciones con mínimo esfuerzo:** implementar redirect tras login, limitar logs de debug a desarrollo, añadir .env.example (front y back) y un mínimo de instrucciones de despliegue. Opcional: landing mínima y, más adelante, validación JWT en backend.
- **Para validar si seguir:** desplegar, compartir con 15–30 personas, medir registros y uso de IA (y algo de retención si puedes). En 2–4 semanas, decidir con esos datos; así reduces la incertidumbre y evitas dejar el proyecto solo por miedo al fracaso.

