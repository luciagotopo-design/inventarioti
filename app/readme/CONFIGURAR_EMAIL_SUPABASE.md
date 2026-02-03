# Configuración de Email en Supabase

## 📧 Configurar envío de correos de confirmación

### Paso 1: Habilitar confirmación de email

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **Settings** → **Email**
3. Asegúrate que **Enable email confirmations** esté activado ✅

### Paso 2: Configurar plantilla de email (opcional)

1. En **Authentication** → **Email Templates**
2. Edita la plantilla **Confirm signup**
3. Personaliza el mensaje si lo deseas

### Paso 3: Para desarrollo local (OPCIONAL)

Si estás en desarrollo y no quieres configurar email real:

1. Ve a **Authentication** → **Settings** → **Email**
2. **DESACTIVA** "Enable email confirmations" para pruebas
3. Los usuarios se crearán automáticamente confirmados

### Paso 4: Configurar proveedor de email (Producción)

Para producción, necesitas configurar un proveedor SMTP:

#### Opción A: Usar el SMTP de Supabase (Limitado)
- Ya está configurado por defecto
- Límite: 30 emails/hora en plan gratuito

#### Opción B: Usar tu propio SMTP (Recomendado)
1. Ve a **Project Settings** → **Auth** → **SMTP Settings**
2. Configura tu servidor SMTP:
   - **Host**: smtp.gmail.com (para Gmail)
   - **Port**: 587
   - **Username**: tu-email@gmail.com
   - **Password**: [App Password de Gmail]
   - **Sender email**: tu-email@gmail.com
   - **Sender name**: Sistema de Inventario TI

#### Crear App Password en Gmail:
1. Ve a https://myaccount.google.com/security
2. Activa "2-Step Verification"
3. Ve a "App passwords"
4. Genera una nueva contraseña para "Mail"
5. Usa esa contraseña en la configuración SMTP

#### Opción C: Usar SendGrid, Mailgun u otro
- Sigue las instrucciones del proveedor
- Configura los valores SMTP correspondientes

## 🗄️ Crear la tabla de usuarios en Supabase

### Ejecutar migración SQL

1. Ve a **SQL Editor** en Supabase Dashboard
2. Haz clic en **New query**
3. Copia y pega el contenido de `supabase/migrations/sync_auth_users.sql`
4. Haz clic en **Run** para ejecutar

Esto creará:
- ✅ Tabla `usuarios` sincronizada con `auth.users`
- ✅ Trigger que crea usuario automáticamente al registrarse
- ✅ Trigger que actualiza cuando se confirma el email
- ✅ Políticas RLS (Row Level Security)

## 🔍 Verificar configuración

### Verificar que los correos se envían:

1. Registra un nuevo usuario
2. Revisa la consola del navegador para ver los logs
3. Revisa tu email (incluyendo spam)
4. Haz clic en el enlace de confirmación

### Verificar que se crea en la base de datos:

1. Ve a **Table Editor** en Supabase
2. Abre la tabla `usuarios`
3. Deberías ver el usuario registrado después de confirmar el email

## 🚨 Solución de problemas

### El correo no llega:

1. **Revisa spam** - Los correos de Supabase pueden ir a spam
2. **Verifica configuración SMTP** - Si usas SMTP personalizado
3. **Revisa logs** - Ve a **Authentication** → **Logs** en Supabase
4. **Límite alcanzado** - Si usas plan gratuito, puede haber límite de 30 emails/hora

### El usuario no se crea en la tabla:

1. **Verifica que ejecutaste la migración SQL** correctamente
2. **Revisa logs en SQL Editor** - Ve si hay errores
3. **Verifica triggers** - Ejecuta:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE 'on_auth_user%';
   ```
4. **Verifica función** - Ejecuta:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

### Error "User already registered":

1. El usuario ya existe en `auth.users`
2. Elimínalo desde **Authentication** → **Users** en Supabase
3. O usa otro email

## 📝 Notas importantes

- **En desarrollo**: Puedes desactivar confirmación de email para pruebas rápidas
- **En producción**: SIEMPRE activa confirmación de email por seguridad
- **La tabla `usuarios`** se crea automáticamente cuando el usuario confirma su email
- **El trigger** sincroniza `auth.users` con `public.usuarios`

## 🎯 Flujo completo

1. Usuario se registra → Se crea en `auth.users` (sin confirmar)
2. Trigger `on_auth_user_created` → Crea registro en `public.usuarios`
3. Supabase envía email de confirmación
4. Usuario hace clic en enlace → Email se confirma
5. Trigger `on_auth_user_confirmed` → Actualiza `email_confirmed_at` y `activo = true`
6. Usuario puede iniciar sesión ✅
