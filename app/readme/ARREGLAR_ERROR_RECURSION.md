# 🚨 SOLUCIÓN: Error de Recursión Infinita en Políticas RLS

## ❌ Problema
```
infinite recursion detected in policy for relation "usuarios"
```

Esto ocurre cuando una política RLS intenta leer la misma tabla que está protegiendo, creando un bucle infinito.

## ✅ Solución Rápida

### Opción 1: Ejecutar SQL para Arreglar Políticas (RECOMENDADO)

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Crea una **New query**
5. **Copia y pega SOLO este código:**

```sql
-- ARREGLAR POLÍTICAS RLS - Eliminar recursión infinita

-- 1. Limpiar políticas problemáticas
DROP POLICY IF EXISTS "Usuarios pueden leer su propia información" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia información" ON public.usuarios;
DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Service role puede ver todos" ON public.usuarios;

-- 2. Crear políticas corregidas (sin recursión)
CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "usuarios_service_role_all" ON public.usuarios
  FOR ALL
  USING (auth.role() = 'service_role');
```

6. Haz clic en **Run** (o `Ctrl+Enter`)
7. ✅ Deberías ver "Success"

### Opción 2: Deshabilitar RLS Temporalmente (Para pruebas)

Si solo quieres probar rápido, puedes deshabilitar RLS:

```sql
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
```

⚠️ **ADVERTENCIA**: Esto deja la tabla sin protección. Solo para desarrollo.

## 📋 Verificar que Funcionó

Después de ejecutar el SQL:

1. Recarga la página de login
2. El error de "infinite recursion" debe desaparecer
3. Deberías ver "Conexión OK" o similar

## 🔍 Entender el Problema

### ❌ Política Problemática (ANTES):
```sql
CREATE POLICY "Admins pueden ver todos los usuarios" ON public.usuarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios  -- ❌ Lee usuarios dentro de política de usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

Esta política intenta leer `usuarios` para verificar el rol, pero esa lectura activa la misma política nuevamente → **recursión infinita**.

### ✅ Política Corregida (DESPUÉS):
```sql
CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);  -- ✅ Solo compara con el ID del usuario autenticado
```

Esta política solo compara el ID sin hacer consultas adicionales → **sin recursión**.

## 🎯 Resumen de Cambios

| Antes | Después |
|-------|---------|
| Política que lee la misma tabla | Política simple basada en `auth.uid()` |
| Recursión infinita | Sin recursión |
| Error 500 | Funciona ✅ |

## 📝 Próximos Pasos

1. ✅ Ejecuta el SQL de arriba
2. ✅ Recarga la aplicación
3. ✅ Prueba registrar un usuario
4. ✅ El email de confirmación debería enviarse

## 🆘 Si Aún Tienes Problemas

Si después de ejecutar el SQL aún ves errores:

1. **Verifica que la tabla existe:**
   ```sql
   SELECT * FROM public.usuarios LIMIT 1;
   ```

2. **Verifica las políticas activas:**
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'usuarios';
   ```

3. **Opción nuclear - Borrar y recrear todo:**
   ```sql
   DROP TABLE IF EXISTS public.usuarios CASCADE;
   -- Luego ejecuta sync_auth_users.sql completo
   ```
