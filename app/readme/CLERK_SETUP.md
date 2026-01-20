# 🔐 Configuración de Clerk - Guía Completa

## ✅ Migración Completada

Se ha migrado completamente de **Supabase Auth** a **Clerk** para la autenticación.

### Cambios Realizados:

1. ✅ Instalado `@clerk/nextjs`
2. ✅ Actualizado `middleware.ts` con Clerk middleware
3. ✅ Creadas nuevas páginas de login y registro con componentes de Clerk
4. ✅ Actualizado `app/layout.tsx` con ClerkProvider
5. ✅ Actualizado `Sidebar` para usar hooks de Clerk
6. ✅ Actualizado `app/page.tsx` para usar useUser de Clerk
7. ✅ Actualizado `ProtectedRoute` para usar autenticación de Clerk

## 📋 Pasos para Configurar Clerk

### 1. Crear Cuenta en Clerk

1. Ve a https://clerk.com
2. Haz clic en **"Start building for free"** o **"Sign up"**
3. Crea una cuenta con tu email

### 2. Crear Nueva Aplicación

1. Una vez dentro del Dashboard de Clerk, haz clic en **"Create application"**
2. Nombre de la aplicación: `Sistema Inventario TI`
3. Selecciona los métodos de autenticación:
   - ✅ Email (activado por defecto)
   - ✅ Google (opcional, recomendado)
   - ✅ Microsoft (opcional)
4. Haz clic en **"Create application"**

### 3. Obtener Credenciales (API Keys)

Después de crear la aplicación, serás redirigido a la página de API Keys:

1. Copia el **Publishable key** (empieza con `pk_test_...`)
2. Copia el **Secret key** (empieza con `sk_test_...`)

**IMPORTANTE:** El Secret key solo se muestra una vez. Si lo pierdes, deberás generar uno nuevo.

### 4. Configurar Variables de Entorno

Abre el archivo `.env.local` y reemplaza estos valores:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_TU_PUBLISHABLE_KEY_AQUI
CLERK_SECRET_KEY=sk_test_TU_SECRET_KEY_AQUI
```

**Ejemplo real (no uses estas, son de ejemplo):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmstZGFzaGJvYXJkLWV4YW1wbGUtMTIz
CLERK_SECRET_KEY=sk_test_YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY=
```

### 5. Configurar Rutas en Clerk Dashboard

1. En el Dashboard de Clerk, ve a **"Paths"** o **"Routing"**
2. Configura las rutas:
   - **Sign-in path:** `/login`
   - **Sign-up path:** `/registro`
   - **After sign-in path:** `/dashboard`
   - **After sign-up path:** `/dashboard`

### 6. Personalizar la Interfaz (Opcional)

1. Ve a **"Customization"** en el Dashboard de Clerk
2. Personaliza colores, logo, etc.
3. Puedes subir tu logo y cambiar el tema

## 🚀 Ejecutar la Aplicación

```powershell
# Instalar dependencias (si aún no lo hiciste)
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 🧪 Probar la Autenticación

1. Abre http://localhost:3000
2. Serás redirigido a la página de bienvenida
3. Haz clic en **"Iniciar Sesión"**
4. Prueba registrar un nuevo usuario
5. Clerk enviará un código de verificación al email
6. Después de verificar, serás redirigido al dashboard

## 📍 Estructura de Rutas

- `/` → Página de inicio (redirige a /dashboard si está autenticado)
- `/login` → Página de inicio de sesión (componente de Clerk)
- `/registro` → Página de registro (componente de Clerk)
- `/dashboard` → Dashboard principal (protegido)
- `/inventario` → Gestión de inventario (protegido)
- `/plan-mantenimiento` → Mantenimiento (protegido)
- `/reportes` → Reportes (protegido)

## 🔒 Protección de Rutas

El middleware de Clerk protege automáticamente todas las rutas excepto:
- `/login`
- `/registro`
- `/api/webhooks` (para webhooks de Clerk)

## 🎨 Componentes de Clerk Usados

- `<SignIn />` - Formulario de inicio de sesión
- `<SignUp />` - Formulario de registro
- `<ClerkProvider>` - Proveedor de contexto
- `useUser()` - Hook para obtener datos del usuario
- `useClerk()` - Hook para acciones (logout, etc.)

## 📊 Diferencias vs Supabase

| Característica | Supabase | Clerk |
|----------------|----------|-------|
| Login | Custom form + API | Componente pre-construido |
| Registro | Custom form + email confirm | Componente + verificación automática |
| Logout | `supabase.auth.signOut()` | `clerk.signOut()` |
| Usuario actual | `supabase.auth.getSession()` | `useUser()` hook |
| Middleware | Custom cookie check | Clerk middleware automático |

## ✨ Ventajas de Clerk

1. **UI Pre-construida:** No necesitas crear formularios de login/registro
2. **Seguridad:** Manejo automático de sesiones y tokens
3. **Social Login:** Fácil integración con Google, Microsoft, etc.
4. **2FA:** Autenticación de dos factores incluida
5. **Webhooks:** Eventos automáticos cuando usuarios se registran/login
6. **Localización:** Soporte para español e idiomas

## 🔧 Configuración Adicional (Opcional)

### Agregar Google OAuth

1. En Clerk Dashboard → **"User & Authentication"** → **"Social connections"**
2. Activa **Google**
3. Sigue las instrucciones para crear OAuth app en Google Console
4. Copia Client ID y Client Secret a Clerk

### Configurar Email Templates

1. Ve a **"Emails"** en Clerk Dashboard
2. Personaliza los templates de verificación, bienvenida, etc.
3. Agrega tu logo y branding

## 🆘 Solución de Problemas

### Error: "Clerk: Missing publishable key"
- Verifica que `.env.local` tenga `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Reinicia el servidor (`npm run dev`)

### Error: "Clerk: Invalid secret key"
- Verifica que `CLERK_SECRET_KEY` sea correcto
- Asegúrate de no haber copiado espacios extra

### Redirección infinita
- Verifica que el middleware esté configurado correctamente
- Revisa que `/login` esté en las rutas públicas

### No muestra el formulario de Clerk
- Verifica que instalaste `@clerk/nextjs` correctamente
- Ejecuta: `npm install @clerk/nextjs`

## 📚 Recursos

- Documentación de Clerk: https://clerk.com/docs
- Guía Next.js + Clerk: https://clerk.com/docs/quickstarts/nextjs
- Dashboard de Clerk: https://dashboard.clerk.com

---

**Estado:** ✅ Migración completada - Lista para configurar credenciales de Clerk
