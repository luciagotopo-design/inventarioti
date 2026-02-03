# 🔧 Solución: Error RLS al Subir Archivos

## ❌ Problema
Al intentar subir archivos, aparecía el error:
```
Error de API: {success: false, error: 'new row violates row-level security policy'}
```

## 🔍 Causa
El cliente de Supabase en las **API routes del servidor** usaba `NEXT_PUBLIC_SUPABASE_ANON_KEY`, que está sujeto a políticas RLS (Row Level Security). Las políticas RLS requerían que el usuario esté autenticado como usuario de Supabase, pero las API routes no tienen contexto de autenticación de Supabase.

## ✅ Solución Implementada

### 1. Creado cliente Admin de Supabase
Se creó `lib/supabase-admin.ts` que usa la **Service Role Key** para bypasear RLS en operaciones del servidor.

### 2. Actualizado API route de upload
Modificado `/api/storage/upload/route.ts` para usar `supabaseAdmin` en lugar del cliente público.

### 3. Configuración requerida

#### 📋 PASO 1: Obtener Service Role Key
1. Ve a tu proyecto en **Supabase Dashboard**
2. Click en **Settings** (⚙️) en el menú lateral
3. Click en **API**
4. Busca la sección **Project API keys**
5. Copia la **`service_role` key** (⚠️ **secret**, no la compartas)

#### 📋 PASO 2: Agregar la key al .env
1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza `PEGA_AQUI_TU_SERVICE_ROLE_KEY` con tu key real:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

#### 📋 PASO 3: Reiniciar el servidor
```powershell
# Detén el servidor (Ctrl+C en la terminal)
# Luego reinicia:
npm run dev
```

## 🎯 Verificación

Después de reiniciar, intenta subir un archivo nuevamente. Deberías ver en la consola:
```
✅ Supabase Admin configurado (Service Role)
📤 [API] Subiendo archivo: imagen.jpg
✅ [API] Archivo subido a Storage
🔗 [API] URL pública: https://...
```

## 🔒 Seguridad

- ✅ **Service Role Key bypasea RLS**: Perfecta para operaciones del servidor
- ✅ **Nunca se expone al navegador**: Solo se usa en API routes
- ✅ **Mantiene las políticas RLS**: Para operaciones del cliente siguen activas
- ⚠️ **No commits de .env**: Asegúrate de que `.env` esté en `.gitignore`

## 📝 Archivos Modificados

1. ✨ **NUEVO**: `lib/supabase-admin.ts` - Cliente con Service Role
2. ✏️ **MODIFICADO**: `app/api/storage/upload/route.ts` - Usa supabaseAdmin
3. ✏️ **MODIFICADO**: `.env` - Agregada variable SUPABASE_SERVICE_ROLE_KEY

## 🤔 ¿Por qué esta solución?

**Opción 1** (Implementada): Usar Service Role Key
- ✅ Más segura y profesional
- ✅ Mantiene las políticas RLS para el cliente
- ✅ Recomendada por Supabase para operaciones del servidor

**Opción 2** (No recomendada): Desactivar RLS en storage.objects
- ❌ Menos segura
- ❌ Todos podrían subir/eliminar archivos
- ❌ No adecuada para producción

## 📚 Recursos
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side)
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
